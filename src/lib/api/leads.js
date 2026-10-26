import { apiClient } from "./client";

export const leadsApi = {
  getLeadList: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/lead/list${query ? `?${query}` : ""}`;
    const response = await apiClient(endpoint, { method: "GET" });
    return {
      leads: response?.results?.leads || [],
      total: response?.results?.pagination?.total ?? response?.results?.leads?.length ?? 0,
    };
  },

  getLead: async (id) => {
    const response = await apiClient(`/lead/${id}`, { method: "GET" });
    return response?.results || {};
  },

  createLead: async (payload) => apiClient("/lead/create", { method: "POST", body: payload }),

  updateLead: async (id, payload) => apiClient(`/lead/${id}`, { method: "PUT", body: payload }),

};

export default leadsApi;
