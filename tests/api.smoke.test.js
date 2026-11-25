/**
 * End-to-end check of the API modules against a real API.
 *
 * Skipped unless SMOKE_API_URL is set. It needs a disposable API with the bank
 * account created and two users, and it writes data: never point it at
 * production.
 *
 *   SMOKE_API_URL=http://127.0.0.1:5599 SMOKE_USER=alice SMOKE_OTHER_USER=bob \
 *   SMOKE_PASSWORD=... npm test
 */
import axios from "axios";
import { beforeAll, describe, expect, it, vi } from "vitest";

const API_URL = process.env.SMOKE_API_URL;
const USER = process.env.SMOKE_USER ?? "alice";
const OTHER_USER = process.env.SMOKE_OTHER_USER ?? "bob";
const PASSWORD = process.env.SMOKE_PASSWORD ?? "";
const ORIGIN = process.env.SMOKE_ORIGIN ?? "http://localhost:8080";

// What a browser does on its own: keep the cookies and send the origin.
const jar = new Map();
const installBrowserBehaviour = () => {
    const http = axios.getAdapter("http");
    const keep = (response) => {
        for (const line of response?.headers?.["set-cookie"] ?? []) {
            const pair = line.split(";")[0];
            const name = pair.slice(0, pair.indexOf("="));
            const value = pair.slice(pair.indexOf("=") + 1);
            if (value === "" || value === '""') jar.delete(name);
            else jar.set(name, value);
        }
    };
    axios.defaults.adapter = async (config) => {
        if (jar.size > 0) config.headers.set("Cookie", [...jar].map(([name, value]) => `${name}=${value}`).join("; "));
        config.headers.set("Origin", ORIGIN);
        config.headers.set("Referer", `${ORIGIN}/`);
        try {
            const response = await http(config);
            keep(response);
            return response;
        } catch (error) {
            keep(error.response);
            throw error;
        }
    };
};

const status = (promise) => promise.then(() => 200, (error) => error.response?.status);
const today = () => new Date().toISOString().slice(0, 10);

describe.skipIf(!API_URL)("front API modules against a real API", () => {
    let client, accountApi, categoryApi, transactionApi, statsApi, recurringApi, budgetApi, userApi, getUser;
    let me, bank, main, savings, category, debit;
    const sessionExpired = vi.fn();

    beforeAll(async () => {
        installBrowserBehaviour();
        vi.stubEnv("VITE_API_URL", API_URL);
        client = await import("@/api/client");
        accountApi = await import("@/api/account");
        categoryApi = await import("@/api/category");
        transactionApi = await import("@/api/transaction");
        statsApi = await import("@/api/stats");
        recurringApi = await import("@/api/recurring");
        budgetApi = await import("@/api/budget");
        userApi = await import("@/api/user");
        ({ getUser } = await import("@/auth/getUser"));
        client.setSessionExpiredHandler(sessionExpired);
    });

    it("answers /health/ without a session", async () => {
        expect(await client.getHealth()).toMatchObject({ status: "ok", maintenance: false });
    });

    it("reports no session before login", async () => {
        expect(await status(getUser())).toBe(401);
        expect(sessionExpired).toHaveBeenCalledTimes(1);
    });

    it("logs in and reads the current user", async () => {
        await client.login({ username: USER, password: PASSWORD });
        me = await getUser();
        expect(me).toMatchObject({ username: USER, is_staff: false });
        // The tokens live in HttpOnly cookies, never in a response body.
        expect([...jar.keys()]).toEqual(expect.arrayContaining(["access_token", "refresh_token", "csrftoken"]));
    });

    it("finds the bank account", async () => {
        bank = await accountApi.getBankAccount();
        expect(bank).toMatchObject({ is_bank: true, is_active: true });
    });

    it("creates accounts in euros, owned by the caller", async () => {
        main = await accountApi.createAccount({ label: "Smoke courant", balance: "200.00" });
        savings = await accountApi.createAccount({ label: "Smoke épargne", balance: "0.00" });
        expect(main).toMatchObject({ balance: "200.00", is_active: true, owners: [me.id] });
        expect(main.owners_details).toEqual([{ id: me.id, username: USER }]);

        const accounts = await accountApi.getAccounts();
        expect(Array.isArray(accounts)).toBe(true);
        expect(accounts.map((account) => account.id)).toEqual(expect.arrayContaining([main.id, savings.id]));
    });

    it("renames an account", async () => {
        main = await accountApi.updateAccount(main.id, { label: "Smoke principal" });
        expect(main).toMatchObject({ label: "Smoke principal", balance: "200.00" });
    });

    it("creates a private category and lists categories as an array", async () => {
        category = await categoryApi.createCategory({ label: "Smoke courses", color: "#2a78d6" });
        expect(category.owner).toBe(me.id);
        const categories = await categoryApi.getCategories();
        expect(Array.isArray(categories)).toBe(true);
        expect(categories.some((item) => item.id === category.id)).toBe(true);
    });

    it("creates a debit with a date and moves the balance", async () => {
        debit = await transactionApi.createTransaction({
            sender: main.id, receiver: bank.id, amount: "50.00", category: category.id, comment: "smoke debit", date: today(),
        });
        expect(debit).toMatchObject({ amount: "50.00", date: today(), is_opening: false, category: category.id });
        expect(debit.sender_details).toMatchObject({ id: main.id, is_active: true, is_bank: false });
        expect(debit.receiver_details).toMatchObject({ is_bank: true });
        expect(debit.created_at).toBeTruthy();
        expect((await accountApi.getAccount(main.id)).balance).toBe("150.00");
    });

    it("edits a transaction, clears its category, and the balance follows", async () => {
        debit = await transactionApi.updateTransaction(debit.id, { amount: "60.00", category: null });
        expect(debit).toMatchObject({ amount: "60.00", category: null, category_details: null });
        expect((await accountApi.getAccount(main.id)).balance).toBe("140.00");
    });

    it("refuses a non-positive amount", async () => {
        const attempt = transactionApi.createTransaction({ sender: main.id, receiver: bank.id, amount: "-5.00" });
        expect(await status(attempt)).toBe(400);
    });

    it("transfers between two of the caller's accounts", async () => {
        await transactionApi.createTransaction({ sender: main.id, receiver: savings.id, amount: "40.00", comment: "smoke transfer" });
        expect((await accountApi.getAccount(main.id)).balance).toBe("100.00");
        expect((await accountApi.getAccount(savings.id)).balance).toBe("40.00");
    });

    it("paginates and filters transactions", async () => {
        const all = await transactionApi.getTransactionsById(main.id);
        expect(all).toMatchObject({ count: 3, next: null });
        expect(all.results.some((tx) => tx.is_opening)).toBe(true);

        const uncategorised = await transactionApi.getTransactionsById(main.id, 1, { category: "none", search: "smoke debit" });
        expect(uncategorised.results.map((tx) => tx.id)).toEqual([debit.id]);

        const large = await transactionApi.getTransactions(1, { amount_min: "100.00", account: main.id, ordering: "-amount" });
        expect(large.results.every((tx) => parseFloat(tx.amount) >= 100)).toBe(true);

        // Empty filter values are left out instead of being sent as "".
        const none = await transactionApi.getTransactions(1, { date_from: "", category: "", search: "" });
        expect(none.count).toBeGreaterThanOrEqual(3);
    });

    it("reads statistics", async () => {
        const months = await statsApi.getMonthlyStats({ account: main.id });
        expect(months.at(-1)).toMatchObject({ month: today().slice(0, 7), balance: "100.00" });
        expect(months.at(-1)).toHaveProperty("income");
        expect(months.at(-1)).toHaveProperty("net");

        const byCategory = await statsApi.getStatsByCategory({ account: main.id });
        // Seen from one account, the 40.00 sent to the other account is an expense
        // too; across all accounts, transfers between them are left out.
        expect(byCategory.find((row) => row.category === null)).toMatchObject({ expense: "100.00" });
    });

    it("shares an account, refuses duplicates and unknown users, then unshares", async () => {
        const shared = await accountApi.shareAccount(main.id, OTHER_USER);
        expect(shared.owners_details.map((owner) => owner.username).sort()).toEqual([USER, OTHER_USER].sort());
        expect(await status(accountApi.shareAccount(main.id, OTHER_USER))).toBe(400);
        expect(await status(accountApi.shareAccount(main.id, "nobody-smoke"))).toBe(404);

        await accountApi.unshareAccount(main.id, OTHER_USER);
        expect((await accountApi.getAccount(main.id)).owners).toEqual([me.id]);
        // The last owner cannot leave.
        expect(await status(accountApi.unshareAccount(main.id, USER))).toBe(400);
    });

    it("imports a statement once", async () => {
        const csv = "Date;Libellé;Montant\n15/01/2026;CB SMOKE;-45,90\n16/01/2026;VIR SMOKE;2 100,00\n";
        const file = new File([csv], "releve.csv", { type: "text/csv" });

        expect(await accountApi.importStatement(savings.id, file)).toMatchObject({ created: 2, skipped: 0, errors: [] });
        expect(await accountApi.importStatement(savings.id, file)).toMatchObject({ created: 0, skipped: 2 });
        expect((await accountApi.getAccount(savings.id)).balance).toBe("2094.10");

        const broken = new File(["not a statement"], "x.csv", { type: "text/csv" });
        expect(await status(accountApi.importStatement(savings.id, broken))).toBe(400);
    });

    it("manages a recurring transaction", async () => {
        const rule = await recurringApi.createRecurringTransaction({
            sender: main.id, receiver: bank.id, amount: "9.99", category: null, comment: "smoke rule",
            end_date: null, frequency: "monthly", start_date: today(),
        });
        expect(rule).toMatchObject({ frequency: "monthly", is_active: true, amount: "9.99" });
        expect(rule).toHaveProperty("next_date");
        expect(rule).toHaveProperty("occurrences");

        const paused = await recurringApi.updateRecurringTransaction(rule.id, { is_active: false });
        expect(paused.is_active).toBe(false);
        // The schedule is fixed after creation.
        expect(await status(recurringApi.updateRecurringTransaction(rule.id, { frequency: "weekly" }))).toBe(400);

        expect((await recurringApi.getRecurringTransactions()).some((item) => item.id === rule.id)).toBe(true);
        await recurringApi.deleteRecurringTransaction(rule.id);
        expect((await recurringApi.getRecurringTransactions()).some((item) => item.id === rule.id)).toBe(false);
    });

    it("manages a budget", async () => {
        const created = await budgetApi.createBudget({ category: category.id, amount: "100.00" });
        expect(await status(budgetApi.createBudget({ category: category.id, amount: "50.00" }))).toBe(400);

        const budget = (await budgetApi.getBudgets(today().slice(0, 7))).find((item) => item.id === created.id);
        expect(budget).toMatchObject({ amount: "100.00", month: today().slice(0, 7), category: category.id });
        expect(budget).toHaveProperty("spent");
        expect(budget).toHaveProperty("remaining");
        expect(budget.category_details.label).toBe("Smoke courses");

        expect((await budgetApi.updateBudget(created.id, { amount: "120.00" })).amount).toBe("120.00");
        await budgetApi.deleteBudget(created.id);
    });

    it("deletes a transaction and gives the money back", async () => {
        const before = parseFloat((await accountApi.getAccount(main.id)).balance);
        await transactionApi.deleteTransaction(debit.id);
        expect(parseFloat((await accountApi.getAccount(main.id)).balance)).toBeCloseTo(before + 60, 2);
    });

    it("updates the profile", async () => {
        const updated = await userApi.updateProfile({ email: "smoke@example.test" });
        expect(updated).toMatchObject({ username: USER, email: "smoke@example.test" });
    });

    it("renews an expired access cookie without the caller noticing", async () => {
        jar.delete("access_token");
        expect((await getUser()).username).toBe(USER);
        expect(jar.has("access_token")).toBe(true);
    });

    it("changes the password and keeps the session", async () => {
        const wrong = userApi.changePassword({ currentPassword: "not-the-password", newPassword: "Another-smoke-pw-2026!" });
        await expect(wrong).rejects.toMatchObject({ response: { status: 400, data: { current_password: expect.any(Array) } } });
        const weak = userApi.changePassword({ currentPassword: PASSWORD, newPassword: "123" });
        await expect(weak).rejects.toMatchObject({ response: { status: 400, data: { new_password: expect.any(Array) } } });

        await userApi.changePassword({ currentPassword: PASSWORD, newPassword: `${PASSWORD}-2` });
        expect((await getUser()).username).toBe(USER);
        // Put it back so the test can run again.
        await userApi.changePassword({ currentPassword: `${PASSWORD}-2`, newPassword: PASSWORD });
    });

    it("deactivates an account, which then disappears", async () => {
        await accountApi.deleteAccount(savings.id);
        expect(await status(accountApi.getAccount(savings.id))).toBe(404);
    });

    it("logs out", async () => {
        sessionExpired.mockClear();
        await client.logout();
        expect(jar.has("access_token")).toBe(false);
        expect(await status(getUser())).toBe(401);
    });
});
