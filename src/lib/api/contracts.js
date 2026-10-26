import { ENV } from "@/config/env";
import { getToken } from "@/lib/auth/token";
import { apiClient } from "./client";

const API_ORIGIN = String(ENV.API_BASE_URL || "").replace(/\/api\/v1\/?$/, "");

export const contractsApi = {
  saveContract: (payload = {}) =>
    apiClient("/contract/save", { method: "POST", body: payload }),

  updateContract: (payload = {}) =>
    apiClient("/contract/update", { method: "POST", body: payload }),

  getContractsList: (leadId, options = {}) =>
    apiClient(`/contract/list?leadId=${encodeURIComponent(leadId)}`, { method: "GET", ...options }),

  shareContract: (payload = {}) =>
    apiClient("/contract/share", { method: "POST", body: payload }),

  updateContractShare: (payload = {}) =>
    apiClient("/contract/share/update", { method: "POST", body: payload }),

  getContractDocuments: (payload = {}) =>
    apiClient("/contractTemplate/documents", { method: "POST", body: payload }),

  getContractPdf: async (fileUrl, options = {}) => {
    const token = getToken();
    const url = /^https?:\/\//i.test(fileUrl)
      ? fileUrl
      : `${API_ORIGIN}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;

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
      throw new Error(err.message || `Failed to fetch contract PDF (${response.status})`);
    }

    return await response.blob();
  },

  getPublicContractPdf: async (contractId, expires, signature, options = {}) => {
    const base = String(ENV.API_BASE_URL || "").replace(/\/+$/, "");
    const url = `${base}/public/contract/${encodeURIComponent(contractId)}/pdf?expires=${encodeURIComponent(expires)}&signature=${encodeURIComponent(signature)}`;

    const response = await fetch(url, {
      method: "GET",
      signal: options.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch contract PDF (${response.status})`);
    }

    return await response.blob();
  },

  getPublicContractPdfDownloadUrl: (contractId, expires, signature) => {
    const base = String(ENV.API_BASE_URL || "").replace(/\/+$/, "");
    return `${base}/public/contract/${encodeURIComponent(contractId)}/pdf?expires=${encodeURIComponent(expires)}&signature=${encodeURIComponent(signature)}&download=1`;
  },


  sendContractEmail: async (payload = {}, files = []) => {
    if (Array.isArray(files) && files.length > 0) {
      const formData = new FormData();
      formData.append("contractId", payload.contractId || "");
      formData.append("from", payload.from || "");
      formData.append("to", payload.to || "");
      formData.append("subject", payload.subject || "");
      formData.append("message", payload.message || "");
      formData.append("frontendUrl", payload.frontendUrl || "");
      files.forEach((file) => formData.append("attachment", file));
      return apiClient("/contract/send-email", { method: "POST", body: formData });
    }
    return apiClient("/contract/send-email", { method: "POST", body: payload });
  },
};

export default contractsApi;
