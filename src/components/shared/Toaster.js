"use client";

import { useToastStore } from "@/store/toastStore";
import styles from "./Toaster.module.scss";

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#00C950" />
      <path d="M6.5 10.25 9 12.75 13.75 7.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#FB2C36" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#2B7FFF" />
      <path d="M10 9v5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1.1" fill="#fff" />
    </svg>
  ),
};

export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.toaster} role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type] || styles.info}`}
          role={toast.type === "error" ? "alert" : "status"}
        >
          <span className={styles.icon}>{ICONS[toast.type] || ICONS.info}</span>
          <span className={styles.text}>{toast.text}</span>
          <button
            type="button"
            className={styles.close}
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
