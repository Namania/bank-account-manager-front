import client from "./client";

// One monthly budget per category. `month` ("YYYY-MM") picks the month that
// spent and remaining are computed for; the current month by default.
export const getBudgets = async (month) => {
    const response = await client.get("/budgets/", { params: month ? { month } : {} });
    return response.data;
};

export const createBudget = async (data) => {
    const response = await client.post("/budgets/", data);
    return response.data;
};

export const updateBudget = async (id, data) => {
    const response = await client.patch(`/budgets/${id}/`, data);
    return response.data;
};

export const deleteBudget = async (id) => {
    await client.delete(`/budgets/${id}/`);
};
