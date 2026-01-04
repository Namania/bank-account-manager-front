import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const LOCAL_KEY = import.meta.env.VITE_LOCAL_KEY;
export const getAccounts = async () => {
    const token = localStorage.getItem(`${LOCAL_KEY}.token`);
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    const response = await axios.get(`${API_URL}/accounts/`);
    return response.data.results;
};

export const getAccount = async (id) => {
    const token = localStorage.getItem(`${LOCAL_KEY}.token`);
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    const response = await axios.get(`${API_URL}/accounts/${id}/`);
    return response.data;
}

export const createAccount = async (data) => {
    const token = localStorage.getItem(`${LOCAL_KEY}.token`);
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    const response = await axios.post(`${API_URL}/accounts/`, data);
    return response.data;
}

export const deleteAccount = async (id) => {
    const token = localStorage.getItem(`${LOCAL_KEY}.token`);
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    const response = await axios.patch(`${API_URL}/accounts/${id}/`, { isActive: false });
    return response.data;
}
