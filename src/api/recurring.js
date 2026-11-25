import client from "./client";

// Rules that create a transaction every week, month or year. Plain array.
export const getRecurringTransactions = async () => {
    const response = await client.get("/recurring-transactions/");
    return response.data;
};

export const createRecurringTransaction = async (data) => {
    const response = await client.post("/recurring-transactions/", data);
    return response.data;
};

// frequency and start_date cannot change after creation; is_active pauses the rule.
export const updateRecurringTransaction = async (id, data) => {
    const response = await client.patch(`/recurring-transactions/${id}/`, data);
    return response.data;
};

export const deleteRecurringTransaction = async (id) => {
    await client.delete(`/recurring-transactions/${id}/`);
};
