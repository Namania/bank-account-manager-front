import client from "./client";

// Every filter is optional: date_from, date_to, category (id or "none"), account,
// amount_min, amount_max, search, ordering. Empty values are left out.
const query = (page, filters = {}) => ({
    page,
    ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "" && value != null)),
});

// Paginated: { count, next, previous, results }, 100 per page.
export const getTransactions = async (page = 1, filters = {}) => {
    const response = await client.get("/transactions/", { params: query(page, filters) });
    return response.data;
};

export const getTransactionsById = async (id, page = 1, filters = {}) => {
    const response = await client.get(`/transactions/by_account/${id}/`, { params: query(page, filters) });
    return response.data;
};

export const createTransaction = async (data) => {
    const response = await client.post("/transactions/", data);
    return response.data;
};

export const updateTransaction = async (id, data) => {
    const response = await client.patch(`/transactions/${id}/`, data);
    return response.data;
};

export const deleteTransaction = async (id) => {
    const response = await client.delete(`/transactions/${id}/`);
    return response.data;
};
