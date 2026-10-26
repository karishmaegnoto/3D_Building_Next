"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./PasswordInput.module.scss";

export default function PasswordInput({ className = "", toggleClassName = "", ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const toggleLabel = visible ? "Hide password" : "Show password";

  return (
    <>
      <input {...inputProps} type={visible ? "text" : "password"} className={className} />
      <button
        type="button"
        className={`${styles.toggle}${toggleClassName ? ` ${toggleClassName}` : ""}`}
        onClick={() => setVisible((v) => !v)}
        onMouseDown={(e) => e.preventDefault()}
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        {visible ? (
          <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Eye size={18} strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>
    </>
  );
}
