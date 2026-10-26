import { create } from "zustand";

let toastSeq = 0;

const DEFAULT_DURATIONS = {
  success: 4000,
  error: 6000,
  info: 4000,
};

export const useToastStore = create((set, get) => ({
  toasts: [],

  pushToast: (type, text, durationMs) => {
    const id = ++toastSeq;
    const ms = durationMs ?? DEFAULT_DURATIONS[type] ?? 4000;
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, type, text }],
    }));
    if (ms > 0) {
      setTimeout(() => get().dismissToast(id), ms);
    }
    return id;
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),

  success: (text, durationMs) => get().pushToast("success", text, durationMs),

  error: (text, durationMs) => get().pushToast("error", text, durationMs),

  info: (text, durationMs) => get().pushToast("info", text, durationMs),
}));

export default useToastStore;
