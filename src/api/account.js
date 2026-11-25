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

// The API deactivates the account instead of removing it.
export const deleteAccount = async (id) => {
    const response = await client.delete(`${API_URL}/accounts/${id}/`);
    return response.data;
}

// Counterparty of every external credit and debit.
export const getBankAccount = async () => {
    const response = await client.get(`${API_URL}/accounts/bank/`);
    return response.data;
}
