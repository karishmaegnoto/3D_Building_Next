"use client";

import { useRef } from "react";
import styles from "./AvatarUpload.module.scss";

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}


export default function AvatarUpload({
  src,
  alt = "",
  title = "Change photo",
  accept = "image/*",
  fallback = null,
  className = "",
  children = null,
  overlayIcon = null,
  overlay = "hover",
  onSelect,
}) {
  const fileRef = useRef(null);

  const openPicker = () => {
    fileRef.current?.click();
  };

  return (
    <span
      className={`${styles.avatarUpload} ${className}`}
      title={title}
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={styles.avatarImg}
          onError={() => console.error("[AvatarUpload] preview failed to load:", src)}
        />
      ) : (
        <span className={styles.avatarFallback}>{fallback}</span>
      )}
      {overlay === "badge" ? (
        <span className={styles.avatarBadge} aria-hidden="true">
          {overlayIcon || <CameraIcon />}
        </span>
      ) : (
        <span className={styles.avatarOverlay} aria-hidden="true">
          {overlayIcon || <CameraIcon />}
        </span>
      )}
      {children}
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className={styles.avatarInput}
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files && e.target.files[0];
          if (file && onSelect) onSelect(file);
          e.target.value = "";
        }}
      />
    </span>
  );
}
