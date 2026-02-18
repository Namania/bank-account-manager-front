import Cookies from "js-cookie";
import client from "../api/client";

const API_URL = import.meta.env.VITE_API_URL;
const LOCAL_KEY = import.meta.env.VITE_LOCAL_KEY;

export const getToken = async (credentials) => {
  try {
    const response = await client.post(`${API_URL}/token/`, {
      username: credentials.username,
      password: credentials.password,
    });

    if (response.data.access) {
      Cookies.set(`${LOCAL_KEY}_access`, response.data.access, { secure: true, sameSite: 'strict' });
      Cookies.set(`${LOCAL_KEY}_refresh`, response.data.refresh, { expires: 7, secure: true, sameSite: 'strict' });
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
