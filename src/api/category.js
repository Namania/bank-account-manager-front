import client from "./client";

const API_URL = import.meta.env.VITE_API_URL;

export const getCategories = async () => {
    const response = await client.get(`${API_URL}/categories/`);
    return response.data.results;
};

export const deleteCategory = async (id) => {
    const response = await client.delete(`${API_URL}/categories/${id}/`);
    return response.data.results;
};

export const updateCategory = async (id, data) => {
    const response = await client.put(`${API_URL}/categories/${id}/`, data);
    return response.data;
}
