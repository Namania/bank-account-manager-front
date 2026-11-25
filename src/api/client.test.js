import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The client is exercised against a scripted adapter: no network involved.
const reply = (config, status, data = {}) => {
    const response = { data, status, statusText: "", headers: {}, config };
    if (status >= 200 && status < 300) return Promise.resolve(response);
    return Promise.reject(new axios.AxiosError(`status ${status}`, String(status), config, null, response));
};

const path = (config) => config.url.replace(config.baseURL ?? "", "");

let calls;
let handle;
let originalAdapter;

const load = async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "http://api.test");
    return import("./client");
};

beforeEach(() => {
    calls = [];
    originalAdapter = axios.defaults.adapter;
    axios.defaults.adapter = (config) => {
        calls.push({ method: config.method, path: path(config), csrf: config.headers.get("X-CSRFToken") ?? null });
        return handle(config);
    };
});

afterEach(() => {
    axios.defaults.adapter = originalAdapter;
    vi.unstubAllEnvs();
});

describe("CSRF token", () => {
    it("is fetched once and sent on writes only", async () => {
        handle = (config) => (path(config) === "/csrf/" ? reply(config, 200, { csrfToken: "tok" }) : reply(config, 200));
        const { default: client } = await load();

        await client.get("/accounts/");
        await client.post("/accounts/", { label: "a" });
        await client.delete("/accounts/1/");

        expect(calls).toEqual([
            { method: "get", path: "/accounts/", csrf: null },
            { method: "get", path: "/csrf/", csrf: null },
            { method: "post", path: "/accounts/", csrf: "tok" },
            { method: "delete", path: "/accounts/1/", csrf: "tok" },
        ]);
    });

    it("comes from the login response, without asking /csrf/", async () => {
        handle = (config) => reply(config, 200, path(config) === "/token/" ? { csrfToken: "from-login" } : {});
        const { default: client, login } = await load();

        await login({ username: "u", password: "p" });
        await client.patch("/users/me/", {});

        expect(calls.map((call) => call.path)).toEqual(["/token/", "/users/me/"]);
        expect(calls.at(-1).csrf).toBe("from-login");
    });
});

describe("expired access", () => {
    it("refreshes once, then replays the request", async () => {
        let expired = true;
        handle = (config) => {
            if (path(config) === "/csrf/") return reply(config, 200, { csrfToken: "old" });
            if (path(config) === "/token/refresh/") { expired = false; return reply(config, 200, { csrfToken: "new" }); }
            return expired ? reply(config, 401) : reply(config, 200, { ok: true });
        };
        const { default: client } = await load();

        const response = await client.post("/transactions/", {});

        expect(response.data).toEqual({ ok: true });
        expect(calls.map((call) => call.path)).toEqual(["/csrf/", "/transactions/", "/token/refresh/", "/transactions/"]);
        // The replay carries the token renewed by the refresh.
        expect(calls.at(-1).csrf).toBe("new");
    });

    it("shares one refresh between concurrent requests", async () => {
        let expired = true;
        handle = async (config) => {
            if (path(config) === "/csrf/") return reply(config, 200, { csrfToken: "t" });
            if (path(config) === "/token/refresh/") {
                await new Promise((resolve) => setTimeout(resolve, 10));
                expired = false;
                return reply(config, 200, { csrfToken: "t2" });
            }
            return expired ? reply(config, 401) : reply(config, 200);
        };
        const { default: client } = await load();

        await Promise.all([client.get("/accounts/"), client.get("/categories/"), client.get("/users/me/")]);

        expect(calls.filter((call) => call.path === "/token/refresh/")).toHaveLength(1);
    });

    it("reports the end of the session when the refresh is refused", async () => {
        handle = (config) => (path(config) === "/csrf/" ? reply(config, 200, { csrfToken: "t" }) : reply(config, 401));
        const { default: client, setSessionExpiredHandler } = await load();
        const expired = vi.fn();
        setSessionExpiredHandler(expired);

        await expect(client.get("/users/me/")).rejects.toMatchObject({ response: { status: 401 } });

        expect(expired).toHaveBeenCalledTimes(1);
        // No second refresh attempt for the same request.
        expect(calls.filter((call) => call.path === "/token/refresh/")).toHaveLength(1);
    });
});

describe("maintenance", () => {
    it("is reported with the API's message on a 503 that says so", async () => {
        handle = (config) => reply(config, 503, { detail: "x", maintenance: true, message: "Back at noon" });
        const { default: client, setMaintenanceHandler } = await load();
        const maintenance = vi.fn();
        setMaintenanceHandler(maintenance);

        await expect(client.get("/accounts/")).rejects.toMatchObject({ response: { status: 503 } });

        expect(maintenance).toHaveBeenCalledWith("Back at noon");
    });

    it("is not assumed on any other 503", async () => {
        handle = (config) => reply(config, 503, { status: "error" });
        const { default: client, setMaintenanceHandler } = await load();
        const maintenance = vi.fn();
        setMaintenanceHandler(maintenance);

        await expect(client.get("/accounts/")).rejects.toBeDefined();

        expect(maintenance).not.toHaveBeenCalled();
    });
});
