import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const LOCAL_KEY = import.meta.env.VITE_LOCAL_KEY;
export const getToken = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/token/`, {
      username: credentials.username,
      password: credentials.password,
    });

    if (response.data.token) {
      localStorage.setItem(`${LOCAL_KEY}.token`, response.data.token);
      axios.defaults.headers.common["Authorization"] = `Token ${response.data.token}`;
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
