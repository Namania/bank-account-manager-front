import client from "./client";

const API_URL = import.meta.env.VITE_API_URL;

export const getTransactions = async (page = 1) => {
    const response = await client.get(`${API_URL}/transactions/?page=${page}`);
    return response.data; 
};

export const getTransactionsById = async (id, page = 1) => {
    const response = await client.get(`${API_URL}/transactions/by_account/${id}/?page=${page}`);
    return response.data; 
};

export const createTransaction = async (data) => {
    const response = await client.post(`${API_URL}/transactions/`, data);
    return response.data;
}

export const deleteTransaction = async (id) => {
    const response = await client.delete(`${API_URL}/transactions/${id}/`);
    return response.data;
}
