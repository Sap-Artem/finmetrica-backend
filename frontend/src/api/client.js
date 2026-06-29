const API_BASE = "http://127.0.0.1:8000/api/v1";

export const fetchApi = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (
        token &&
        !options.headers?.["Content-Type"]?.includes("x-www-form-urlencoded")
    ) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const separator = endpoint.includes("?") ? "&" : "?";
    const noCacheUrl = `${API_BASE}${endpoint}${separator}_t=${Date.now()}`;

    const fetchOptions = { cache: "no-store", ...options, headers };

    const response = await fetch(noCacheUrl, fetchOptions);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        throw new Error(data.detail || "Ошибка сервера");
    }
    return data;
};
