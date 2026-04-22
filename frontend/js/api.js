const DEFAULT_API_BASE_URL = "http://localhost:3000";

function getConfiguredBaseUrl() {
    const customBaseUrl = window.localStorage.getItem("fitontrack.apiBaseUrl");
    return customBaseUrl || DEFAULT_API_BASE_URL;
}

function buildUrl(endpoint) {
    const baseUrl = getConfiguredBaseUrl().replace(/\/+$/, "");
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${baseUrl}/api${path}`;
}

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        try {
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            return null;
        }
    }

    const text = await response.text();
    return text ? { message: text } : null;
}

export async function apiRequest(endpoint, options = {}) {
    const { body, headers = {}, ...rest } = options;
    const finalHeaders = { ...headers };
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    if (body !== undefined && !isFormData) {
        finalHeaders["Content-Type"] = "application/json";
    }

    let response;

    try {
        response = await fetch(buildUrl(endpoint), {
            ...rest,
            headers: finalHeaders,
            credentials: "include",
        
            body: body === undefined
                ? undefined
                : isFormData
                    ? body
                    : JSON.stringify(body),
        
        });
    } catch {
        throw new Error("Nao foi possivel conectar ao backend.");
    }

    const data = await parseResponse(response);

    if (!response.ok) {
        const errorMessage = data?.erro || data?.message || `Erro ${response.status}`;
        throw new Error(errorMessage);
    }

    return data;
}

export const api = {
    baseUrl: getConfiguredBaseUrl,
    get: (endpoint) => apiRequest(endpoint),
    post: (endpoint, body) => apiRequest(endpoint, { method: "POST", body }),
    patch: (endpoint, body) => apiRequest(endpoint, { method: "PATCH", body }),
    delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" })
};
