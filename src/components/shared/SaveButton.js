"use client";

import styles from "./SaveButton.module.scss";

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export default function SaveButton({
  onClick,
  disabled = false,
  saving = false,
  label = "Save",
  savingLabel = "Saving...",
  title = "Save",
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      className={`${styles.saveBtn} ${className}`}
      onClick={onClick}
      disabled={disabled || saving}
      title={title}
    >
      <SaveIcon />
      <span>{saving ? savingLabel : label}</span>
    </button>
  );
}
