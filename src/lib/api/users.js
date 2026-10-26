import { apiClient } from "./client";

export const usersApi = {
  getUsers: async (params = {}, options = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/user/list${query ? `?${query}` : ""}`;
    const response = await apiClient(endpoint, { method: "GET", ...options });
    return {
      users: response?.results?.users || response?.results || [],
      roles: response?.results?.roles || [],
    };
  },
  getUser: async (id) => {
    const response = await apiClient(`/user/${id}`, { method: "GET" });
    return response?.results || {};
  },
  createUser: async (payload) => apiClient("/user/create", { method: "POST", body: payload }),

  updateUser: async (formData) => apiClient("/user/update", { method: "PUT", body: formData }),
  deleteUser: async (id, transferTo) =>
    apiClient(`/user/${id}`, { method: "DELETE", body: { transferTo } }),
};

export default usersApi;
