import axios from "axios";

const isProd = process.env.NODE_ENV === "production";
const BASE_URL =
    process.env.NEXT_PUBLIC_MAIN_API_URL ||
    (isProd ? "https://chatpilot-server-main.onrender.com" : "http://localhost:3002");

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
