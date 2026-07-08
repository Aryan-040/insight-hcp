import axios, { type AxiosInstance } from "axios";
import { installMockAdapter } from "./mockAdapter";

// Base URL is read from a Vite env variable so the same code targets a real
// FastAPI backend in production and a local mock in the Lovable preview.
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://localhost:8000/api";

// USE_MOCK defaults to true so the UI is fully explorable without a backend.
// Set VITE_USE_MOCK=false when the FastAPI service is running.
const USE_MOCK =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_USE_MOCK ?? "true")) !== "false";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    // Normalize errors so slices can rely on a consistent shape.
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Unexpected network error";
    return Promise.reject({ message, status: error?.response?.status });
  },
);

if (USE_MOCK) {
  installMockAdapter(apiClient);
}

export const IS_MOCK = USE_MOCK;