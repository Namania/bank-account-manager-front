import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const LOCAL_KEY = import.meta.env.VITE_LOCAL_KEY;

export const getTransactions = async (page = 1) => {
    const token = localStorage.getItem(`${LOCAL_KEY}.token`);
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    const response = await axios.get(`${API_URL}/transactions/?page=${page}`);
    return response.data; 
};

export const getTransactionsById = async (id, page = 1) => {
    const token = localStorage.getItem(`${LOCAL_KEY}.token`);
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    const response = await axios.get(`${API_URL}/transactions/by_account/${id}/?page=${page}`);
    return response.data; 
};

export const createTransaction = async (data) => {
    const token = localStorage.getItem(`${LOCAL_KEY}.token`);
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    const response = await axios.post(`${API_URL}/transactions/`, data);
    return response.data;
}

export const deleteTransaction = async (id) => {
    const token = localStorage.getItem(`${LOCAL_KEY}.token`);
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    const response = await axios.delete(`${API_URL}/transactions/${id}/`);
    return response.data;
}
