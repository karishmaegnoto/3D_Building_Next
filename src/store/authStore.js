import { create } from "zustand";
import { authApi } from "@/lib/api";
import { getToken, setToken, removeToken } from "@/lib/auth/token";

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: getToken(),
  isAuthenticated: Boolean(getToken()),
  loading: false,
  error: null,
  otpRequired: false,
  otpType: "login",
  pendingEmail: null,
  successMessage: null,

  // Actions
  clearError: () => set({ error: null }),

  clearMessage: () => set({ successMessage: null }),

  setPendingEmail: (email) => set({ pendingEmail: email }),

  resetOtpStep: () =>
    set({
      otpRequired: false,
      otpType: "login",
      pendingEmail: null,
      error: null,
      successMessage: null,
      loading: false,
    }),

  setAuth: (user, token) => {
    if (token) {
      setToken(token);
    } else {
      removeToken();
    }
    set({
      user,
      token,
      isAuthenticated: Boolean(token),
      otpRequired: false,
      pendingEmail: null,
      error: null,
      loading: false,
    });
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) return { success: false };
    set({ loading: true });
    try {
      const profile = await authApi.fetchProfile();
      set({ user: profile, loading: false, error: null });
      return { success: true, user: profile };
    } catch (err) {
      // Invalid/expired token -> drop the session entirely.
      if (err?.status === 401) {
        get().logout();
        return { success: false, error: err?.message };
      }
      set({ loading: false });
      return { success: false, error: err?.message };
    }
  },

  logout: () => {    removeToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      otpRequired: false,
      pendingEmail: null,
      successMessage: null,
    });
  },

  login: async (email, password) => {
    set({ loading: true, error: null, successMessage: null });

    try {
      const response = await authApi.signin({ email, password });
      const results = response?.results;

      // Direct token from backend
      if (results?.token) {
        setToken(results.token);
        set({
          token: results.token,
          user: results.user || null,
          isAuthenticated: true,
          otpRequired: false,
          pendingEmail: null,
          loading: false,
          successMessage: response?.message || "Signed in successfully!",
        });
        return { success: true, otpRequired: false, results };
      }

      // 2FA required
      if (results?.otpRequired) {
        set({
          otpRequired: true,
          pendingEmail: results.email || email,
          loading: false,
          successMessage:
            results.message || "Verification code sent to your email.",
        });
        return { success: true, otpRequired: true, results };
      }

      set({ loading: false });
      return { success: true, results };
    } catch (err) {
      const message = err?.message || "Invalid credentials or login failed.";
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  signup: async ({ companyName, email, password, phone, address }) => {
    set({ loading: true, error: null, successMessage: null });

    try {
      const response = await authApi.signup({
        companyName,
        email,
        password,
        phone,
        address,
      });
      const results = response?.results;

      set({
        loading: false,
        otpRequired: true,
        otpType: "signup",
        pendingEmail: results?.email || email,
        successMessage:
          response?.message ||
          "OTP sent successfully to your email. Please verify OTP to complete registration.",
      });
      return { success: true, otpRequired: true, results };
    } catch (err) {
      const message = err?.message || "Registration failed. Please check your details.";
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  verifyOtp: async (otp) => {
    const { pendingEmail, otpType = "login" } = get();
    if (!pendingEmail) {
      set({ error: "Session expired. Please sign in again." });
      return { success: false, error: "Missing email" };
    }

    set({ loading: true, error: null, successMessage: null });

    try {
      const response = await authApi.verifyOtp({
        email: pendingEmail,
        otp,
        type: otpType,
      });

      const results = response?.results;
      if (results?.token) {
        setToken(results.token);
        set({
          token: results.token,
          user: results.user || null,
          isAuthenticated: true,
          otpRequired: false,
          otpType: "login",
          pendingEmail: null,
          loading: false,
          successMessage: response?.message || "Verified successfully!",
        });
        return { success: true, results };
      }

      set({ loading: false });
      return { success: true, results };
    } catch (err) {
      const message = err?.message || "Invalid or expired OTP code. Please try again.";
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  resendOtp: async () => {
    const { pendingEmail, otpType = "login" } = get();
    if (!pendingEmail) return { success: false };

    set({ loading: true, error: null });

    try {
      const response = await authApi.resendOtp({
        email: pendingEmail,
        type: otpType,
      });

      set({
        loading: false,
        successMessage:
          response?.message || "A new verification code has been sent to your email.",
      });
      return { success: true };
    } catch (err) {
      const message = err?.message || "Failed to resend code. Please try again.";
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },
}));

export default useAuthStore;
