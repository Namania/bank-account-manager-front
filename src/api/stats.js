import client from "./client";

const query = (filters = {}) =>
    Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "" && value != null));

// Filters: date_from, date_to, account. All optional.

// [{ category, label, color, expense, income }], largest expense first.
export const getStatsByCategory = async (filters) => {
    const response = await client.get("/stats/by_category/", { params: query(filters) });
    return response.data;
};

// [{ month: "2026-01", income, expense, net, balance }], oldest first, no gap.
export const getMonthlyStats = async (filters) => {
    const response = await client.get("/stats/monthly/", { params: query(filters) });
    return response.data;
};
