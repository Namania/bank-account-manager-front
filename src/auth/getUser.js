import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
export const getUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
