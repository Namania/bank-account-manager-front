import client from "./client";

const API_URL = import.meta.env.VITE_API_URL;

export const getCategories = async () => {
    const response = await client.get(`${API_URL}/categories/`);
    // A plain array; older API versions wrapped it in a page object.
    return response.data.results ?? response.data;
};

export const createCategory = async (data) => {
    const response = await client.post(`${API_URL}/categories/`, data);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await client.delete(`${API_URL}/categories/${id}/`);
    return response.data;
};

export const updateCategory = async (id, data) => {
    const response = await client.put(`${API_URL}/categories/${id}/`, data);
    return response.data;
}
