import { create } from "zustand";

const STORAGE_KEY = "grip-theme";

function loadTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch (_) {
    return "dark";
  }
}

export const useThemeStore = create((set, get) => ({
  theme: loadTheme(),

  setTheme: (theme) => {
    const next = theme === "light" ? "light" : "dark";
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (_) { }
    set({ theme: next });
  },

  toggleTheme: () => {
    get().setTheme(get().theme === "light" ? "dark" : "light");
  },
}));

export default useThemeStore;
