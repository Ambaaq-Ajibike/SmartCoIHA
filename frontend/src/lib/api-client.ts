import axios from "axios";

const defaultApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "https://localhost:7103";

export const apiClient = axios.create({
    baseURL: defaultApiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    if (typeof window === "undefined") {
        return config;
    }

    const token = window.localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== "undefined" && error.response?.status === 401) {
            window.localStorage.removeItem("auth_token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    },
);