import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;
const LOCAL_KEY = import.meta.env.VITE_LOCAL_KEY;

const client = axios.create({
    baseURL: API_URL,
});

client.interceptors.request.use((config) => {
    const token = Cookies.get(`${LOCAL_KEY}_access`);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = Cookies.get(`${LOCAL_KEY}_refresh`);

            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_URL}/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const newAccessToken = res.data.access;
                    Cookies.set(`${LOCAL_KEY}_access`, newAccessToken, { secure: true, sameSite: 'strict' });

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return client(originalRequest);
                } catch (refreshError) {
                    Cookies.remove(`${LOCAL_KEY}_access`);
                    Cookies.remove(`${LOCAL_KEY}_refresh`);
                    window.location.href = "/auth/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default client;
