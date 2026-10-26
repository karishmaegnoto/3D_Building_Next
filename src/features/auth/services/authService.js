import { apiClient } from "@/lib/api/client";
export const authService = {
  signin: async ({ email, password }) => {
    return apiClient("/user/signin", {
      method: "POST",
      body: { email, password },
    });
  },

  signup: async ({ companyName, email, password, phone, address }) => {
    return apiClient("/user/signup", {
      method: "POST",
      body: { companyName, email, password, phone, address },
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

  fetchProfile: async () => {
    const response = await apiClient("/user/me", { method: "GET" });
    return response?.results || null;
  },
};

export default authService;
