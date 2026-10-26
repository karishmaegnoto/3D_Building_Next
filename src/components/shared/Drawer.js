"use client";

import { useEffect } from "react";

export function DrawerTabs({ tabs, active, onChange, tabClassName }) {
  return (
    <div className="notification-drawer-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`notification-drawer-tab ${tabClassName || ""} ${active === tab.id ? "is-active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {typeof tab.count === "number" && (
            <span className="notification-drawer-tab-count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function Drawer({
  drawerId,
  backdropId,
  toggleId,
  toggleClassName = "",
  bodyClass,
  backdropClass = "",
  panelClass = "",
  title,
  label,
  icon,
  badge = 0,
  open,
  onToggle,
  onClose,
  children,
  footer = null,
}) {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.toggle(bodyClass, open);
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove(bodyClass);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, bodyClass, onClose]);

  return (
    <>
      <a
        href="#"
        id={toggleId}
        className={toggleClassName || undefined}
        role="button"
        aria-haspopup="true"
        aria-expanded={open}
        title={label || title}
        aria-label={label || title}
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
      >
        {icon}
        {badge > 0 && <span className="badge badge-danger">{badge > 99 ? "99+" : badge}</span>}
      </a>
      <div className={`notification-drawer-backdrop ${backdropClass}`} id={backdropId} onClick={onClose} />
      <div className={`dropdown-menu dropdown-custom new_notify_box notification-drawer ${panelClass}`} id={drawerId}>
        <div className="notification-drawer-header">
          <h3>{title}</h3>
          <button type="button" className="notification-drawer-close" onClick={onClose} aria-label={`Close ${title}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M8.23734 7L14 1.23734L12.7627 0L7 5.76266L1.23751 0L0 1.23734L5.76266 7L0 12.7627L1.23751 14L7 8.23734L12.7627 14L14 12.7627L8.23734 7Z" fill="currentColor" />
            </svg>
          </button>
        </div>
        {children}
        {footer}
      </div>
    </>
  );
}
