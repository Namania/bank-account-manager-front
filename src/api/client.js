import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const WRITE_METHODS = ["post", "put", "patch", "delete"];

// The session lives in HttpOnly cookies set by the API: this code never sees a
// token. Every request sends the cookies, and every write carries the CSRF
// token, which is kept in memory only.
const options = { baseURL: API_URL, withCredentials: true };

// Bare instance for the session endpoints: no interceptors, so no retry loop.
const session = axios.create(options);
const client = axios.create(options);

let csrfToken = null;
let csrfPromise = null;
let refreshPromise = null;
let onSessionExpired = () => {};

export const setSessionExpiredHandler = (handler) => {
    onSessionExpired = handler;
};

// After a page reload the token is gone from memory: ask the API for it again.
const ensureCsrfToken = () => {
    if (csrfToken) return Promise.resolve(csrfToken);
    csrfPromise ??= session
        .get("/csrf/")
        .then((response) => {
            csrfToken = response.data.csrfToken;
            return csrfToken;
        })
        .finally(() => {
            csrfPromise = null;
        });
    return csrfPromise;
};

const csrfHeader = async () => ({ "X-CSRFToken": await ensureCsrfToken() });

export const login = async ({ username, password }) => {
    const response = await session.post("/token/", { username, password });
    csrfToken = response.data.csrfToken;
};

export const logout = async () => {
    try {
        await session.post("/token/logout/", null, { headers: await csrfHeader() });
    } finally {
        csrfToken = null;
    }
};

// Concurrent 401s share a single refresh request.
const refreshSession = () => {
    refreshPromise ??= (async () => {
        const response = await session.post("/token/refresh/", null, { headers: await csrfHeader() });
        csrfToken = response.data.csrfToken;
    })().finally(() => {
        refreshPromise = null;
    });
    return refreshPromise;
};

client.interceptors.request.use(async (config) => {
    if (WRITE_METHODS.includes(config.method?.toLowerCase())) {
        config.headers["X-CSRFToken"] = await ensureCsrfToken();
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
            return Promise.reject(error);
        }
        originalRequest._retry = true;

        try {
            await refreshSession();
        } catch (refreshError) {
            if (refreshError.response?.status === 401) {
                csrfToken = null;
                onSessionExpired();
            }
            return Promise.reject(error);
        }
        return client(originalRequest);
    }
);

export default client;
