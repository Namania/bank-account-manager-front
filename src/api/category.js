import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const LOCAL_KEY = import.meta.env.VITE_LOCAL_KEY;

export const getCategories = async () => {
    const token = localStorage.getItem(`${LOCAL_KEY}.token`);
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    const response = await axios.get(`${API_URL}/categories/`);
    return response.data.results;
};

export const deleteCategory = async (id) => {
    const token = localStorage.getItem(`${LOCAL_KEY}.token`);
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    const response = await axios.delete(`${API_URL}/categories/${id}/`);
    return response.data.results;
};

export const updateCategory = async (id, data) => {
    const token = localStorage.getItem(`${LOCAL_KEY}.token`);
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    const response = await axios.put(`${API_URL}/categories/${id}/`, data);
    return response.data;
}
