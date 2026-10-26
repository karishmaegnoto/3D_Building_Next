import { ENV } from "@/config/env";
import { getToken } from "@/lib/auth/token";
import { apiClient } from "./client";

export const quotesApi = {

  createQuotePdf: async (leadId, template = "standard", options = {}) => {
    const token = getToken();
    const url = `${ENV.API_BASE_URL}/quote/create/${leadId}/pdf/${template}`;

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: options.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to generate PDF (${response.status})`);
    }

    return await response.blob();
  },

  editQuotePdf: async (quoteId, template = "", options = {}) => {
    const token = getToken();
    const url = `${ENV.API_BASE_URL}/quote/edit/${quoteId}/pdf${template ? `?template=${template}` : ""}`;

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: options.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch quote PDF (${response.status})`);
    }

    return await response.blob();
  },

  saveQuote: async (payload = {}) => { return apiClient("/quote/save", { method: "POST", body: payload, }); },
  updateQuote: async (quoteId, payload = {}) => {
    return apiClient(`/quote/update/${quoteId}`, {
      method: "PUT",
      body: payload,
    });
  },

  shareQuote: async (payload = {}) => {
    return apiClient("/quote/share", { method: "POST", body: payload });
  },

  updateQuoteShare: async (payload = {}) => {
    return apiClient("/quote/share/update", { method: "POST", body: payload });
  },

  getQuotesList: async (params = {}, options = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/quote/list${query ? `?${query}` : ""}`, { method: "GET", ...options });
  },

  getQuoteById: async (quoteId) => apiClient(`/quote/detail/${quoteId}`, { method: "GET" }),

  getQuoteTemplates: async () => apiClient("/quote-templates", { method: "GET" }),

  getQuoteTemplateMappings: async () => apiClient("/quote-templates/mappings", { method: "GET" }),

  uploadQuoteTemplate: async (formData) => apiClient("/quote-templates/upload", { method: "POST", body: formData, }),

  sendQuoteEmail: async (payload = {}, files = []) => {
    if (Array.isArray(files) && files.length > 0) {
      const formData = new FormData();
      formData.append("quoteId", payload.quoteId || "");
      formData.append("from", payload.from || "");
      formData.append("to", payload.to || "");
      formData.append("subject", payload.subject || "");
      formData.append("message", payload.message || "");
      files.forEach((file) => formData.append("attachment", file));
      return apiClient("/quote/send-email", { method: "POST", body: formData });
    }
    return apiClient("/quote/send-email", { method: "POST", body: payload });
  },
};

export default quotesApi;
