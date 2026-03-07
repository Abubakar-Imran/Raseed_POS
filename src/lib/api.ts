/**
 * Client-side API helper.
 * Since the API routes are now in the same Next.js app,
 * we use relative URLs (/api/...) instead of http://localhost:3001/api.
 */

export const API_BASE = "/api";

type UserRole = "customer" | "retailer";

function getTokenKey(role: UserRole): string {
    return role === "customer" ? "customer_token" : "retailer_token";
}

export const fetchWithAuth = async (
    url: string,
    options: RequestInit = {},
    role: UserRole = "customer"
) => {
    const token = localStorage.getItem(getTokenKey(role));

    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem(getTokenKey(role));
        if (role === "customer") {
            localStorage.removeItem("customer_email");
        } else {
            localStorage.removeItem("retailer_id");
        }
        window.location.href = "/auth/login";
    }

    return response.json();
};
