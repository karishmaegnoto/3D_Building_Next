import { ENV } from "@/config/env";
import { getToken, removeToken } from "@/lib/auth/token";
import { ROUTES, withBasePath } from "@/lib/constants";

const API_BASE_URL = ENV.API_BASE_URL;

export const DEFAULT_TIMEOUT_MS = 20000;

export { getToken as getStoredToken };

export async function apiClient(endpoint, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, signal: externalSignal, ...rest } = options;
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;
  const headers = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...rest.headers,
  };

  const token = getToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      const cancelled = new Error("Request cancelled.");
      cancelled.name = "AbortError";
      throw cancelled;
    }
    externalSignal.addEventListener("abort", onExternalAbort, { once: true });
  }

  let timeoutId = null;
  let timedOut = false;
  if (timeout && timeout > 0) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeout);
  }

  const config = {
    ...rest,
    headers,
    signal: controller.signal,
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (
        response.status === 401 &&
        typeof window !== "undefined" &&
        !url.includes("/signin") &&
        !url.includes("/login") &&
        !url.includes("/signup") &&
        !url.includes("/verify-otp") &&
        !url.includes("/resend-otp")
      ) {
        removeToken();
        import("@/store/authStore").then((m) => {
          try {
            m.useAuthStore?.getState?.()?.logout?.();
          } catch (_) { }
        }).catch(() => { });
        import("@/lib/socket/socketClient").then((m) => {
          try {
            m.disconnectSocket?.();
          } catch (_) { }
        }).catch(() => { });
        const path = window.location.pathname || "";
        if (!path.includes("/login") && !path.includes("/signup") && !path.includes("/two-factor")) {
          window.location.replace(withBasePath(ROUTES.AUTH.LOGIN));
        }
      }

      const errorMessage =
        data?.message ||
        data?.error ||
        (response.status === 401
          ? "Invalid or expired session"
          : response.status === 400
            ? "Please check your inputs"
            : `Request failed with status ${response.status}`);

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (timedOut || error?.name === "TimeoutError") {
      const timeoutError = new Error("Request timed out. Please try again.");
      timeoutError.name = "TimeoutError";
      timeoutError.status = 408;
      throw timeoutError;
    }

    if (error?.name === "AbortError") throw error;
    if (error.status) throw error;
    const networkError = new Error(error.message || "Network error. Please try again.");
    networkError.status = 500;
    throw networkError;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }
}

export const authApi = {
  signin: async ({ email, password }) => {
    return apiClient("/user/signin", {
      method: "POST",
      body: { email, password },
    });
  },

  verifyOtp: async ({ email, otp, type = "login" }) => {
    return apiClient("/user/verify-otp", {
      method: "POST",
      body: { email, otp, type },
    });
  },

  resendOtp: async ({ email, type = "login" }) => {
    return apiClient("/user/resend-otp", {
      method: "POST",
      body: { email, type },
    });
  },
};

export default apiClient;
