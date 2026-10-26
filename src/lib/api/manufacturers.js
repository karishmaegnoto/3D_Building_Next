import { apiClient } from "./client";

export const manufacturersApi = {
  getManufacturers: async (params = {}, options = {}) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.isActive !== undefined && params?.isActive !== null) {
      query.set("isActive", String(params.isActive));
    }
    const qs = query.toString();
    const data = await apiClient(`/manufacturer/list${qs ? `?${qs}` : ""}`, {
      method: "GET",
      ...options,
    });
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return Array.isArray(data) ? data : [];
  },

  createManufacturer: async (payload) => {
    const isFormData = payload instanceof FormData;
    return apiClient("/manufacturer/create", {
      method: "POST",
      body: payload,
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      timeout: 120_000,
    });
  },

  updateManufacturer: async (payload) => {
    const isFormData = payload instanceof FormData;
    return apiClient("/manufacturer/update", {
      method: "PUT",
      body: payload,
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      timeout: 120_000,
    });
  },

  getQuoteTemplateMappings: async () => {
    return apiClient("/quote-templates/mappings", { method: "GET" });
  }

};

export default manufacturersApi;
