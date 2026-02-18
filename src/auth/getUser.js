import client from "../api/client";

const API_URL = import.meta.env.VITE_API_URL;

export const getUser = async () => {
  try {
    const response = await client.get(`${API_URL}/users/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
