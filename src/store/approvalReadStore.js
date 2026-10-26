import { create } from "zustand";

const STORAGE_KEY = "grip_viewed_approvals";
const MAX_KEYS = 200;

function loadViewed() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

function saveViewed(viewed) {
  try {
    const keys = Object.keys(viewed);
    const trimmed = {};
    keys.slice(-MAX_KEYS).forEach((k) => {
      trimmed[k] = viewed[k];
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (_) { }
}

export function isApprovalUnread(viewed, key, date) {
  if (!key || !viewed) return true;
  const seen = viewed[key];
  if (!seen) return true;
  const entryTime = new Date(date).getTime();
  const seenTime = new Date(seen).getTime();
  if (Number.isNaN(entryTime) || Number.isNaN(seenTime)) return false;
  return entryTime > seenTime;
}

export const useApprovalReadStore = create((set) => ({
  viewed: loadViewed(),

  markViewed: (key, date) => {
    if (!key) return;
    const stamp = date || new Date().toISOString();
    set((state) => {
      const viewed = { ...state.viewed, [key]: stamp };
      saveViewed(viewed);
      return { viewed };
    });
  },
}));

export default useApprovalReadStore;
