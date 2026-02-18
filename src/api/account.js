import client from "./client";

const API_URL = import.meta.env.VITE_API_URL;

export const getAccounts = async () => {
    const response = await client.get(`${API_URL}/accounts/`);
    return response.data.results;
};

export const getAccount = async (id) => {
    const response = await client.get(`${API_URL}/accounts/${id}/`);
    return response.data;
}

export const createAccount = async (data) => {
    const response = await client.post(`${API_URL}/accounts/`, data);
    return response.data;
}

export const deleteAccount = async (id) => {
    const response = await client.patch(`${API_URL}/accounts/${id}/`, { isActive: false });
    return response.data;
}
