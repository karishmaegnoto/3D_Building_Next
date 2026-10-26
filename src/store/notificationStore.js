import { create } from "zustand";

let notificationSeq = 0;
const MAX_NOTIFICATIONS = 30;

export const useNotificationStore = create((set) => ({
  items: [],
  unread: 0,

  push: (notification) => {
    const id = ++notificationSeq;
    const item = {
      id,
      title: notification?.title || "New notification",
      body: notification?.body || "",
      quoteId: notification?.quoteId || null,
      sharedBy: notification?.sharedBy || null,
      receivedAt: notification?.receivedAt || new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      items: [item, ...state.items].slice(0, MAX_NOTIFICATIONS),
      unread: state.unread + 1,
    }));
    return id;
  },

  markRead: (id) =>
    set((state) => {
      const target = state.items.find((n) => n.id === id);
      if (!target || target.read) return state;
      return {
        items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        unread: Math.max(0, state.unread - 1),
      };
    }),

  markAllRead: () =>
    set((state) => ({
      items: state.items.map((n) => ({ ...n, read: true })),
      unread: 0,
    })),

  clear: () => set({ items: [], unread: 0 }),
}));

export default useNotificationStore;
