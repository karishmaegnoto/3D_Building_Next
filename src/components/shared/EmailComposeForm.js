"use client";

import { useRef, useState } from "react";
import styles from "./emailComposeForm.module.scss";

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
];
const ALLOWED_ATTACHMENT_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf"];

function AddIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.6" stroke="#fff" strokeWidth="1.6" />
      <path d="M10 6.4v7.2M6.4 10h7.2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M14.5,9.5V7a.568.568,0,0,0-.187-.437L9.938,2.187A.568.568,0,0,0,9.5,2H3.25A1.254,1.254,0,0,0,2,3.25v15A1.25,1.25,0,0,0,3.25,19.5h10V18.25h-10v-15h5V7A1.254,1.254,0,0,0,9.5,8.25h3.75V9.5ZM9.5,7V3.5L13,7Z"
        transform="translate(-0.75 -0.75)"
        fill="#a8a29e"
      />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M8.23734 7L14 1.23734L12.7627 0L7 5.76266L1.23751 0L0 1.23734L5.76266 7L0 12.7627L1.23751 14L7 8.23734L12.7627 14L14 12.7627L8.23734 7Z"
        fill="#ff9b9f"
      />
    </svg>
  );
}

function formatSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowedAttachment(file) {
  const name = file?.name || "";
  const ext = name.includes(".") ? `.${name.split(".").pop().toLowerCase()}` : "";
  return (
    ALLOWED_ATTACHMENT_TYPES.includes(file?.type) ||
    String(file?.type || "").startsWith("image/") ||
    ALLOWED_ATTACHMENT_EXTS.includes(ext)
  );
}

export function EmailComposeForm({
  idPrefix = "email-compose",
  values = {},
  onChange,
  files = [],
  onFilesChange,
  feedback = null,
  disabled = false,
  onCancel,
  onSend,
  cancelLabel = "Cancel",
  submitLabel = "Send",
}) {
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const value = (key) => (values[key] ?? "");

  const handleFiles = (fileList) => {
    const picked = Array.from(fileList || []).filter(Boolean);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (picked.length === 0) return;
    const next = picked[0];
    if (!isAllowedAttachment(next)) {
      setFileError("Invalid file type. Only images and PDF files are allowed.");
      return;
    }
    if (next.size > MAX_ATTACHMENT_BYTES) {
      setFileError("File size too large. Maximum allowed size is 20MB.");
      return;
    }
    setFileError("");
    onFilesChange?.([next]);
  };

  const removeFile = (idx) => {
    setFileError("");
    onFilesChange?.(files.filter((_, i) => i !== idx));
  };

  let message = null;
  if (fileError) {
    message = <span className={styles.msgError}>{fileError}</span>;
  } else if (feedback?.text) {
    message = (
      <span className={feedback.type === "success" ? styles.msgSuccess : styles.msgError}>
        {feedback.text}
      </span>
    );
  }

  return (
    <div className={styles.compose}>
      <h5 className={styles.subhead}>Compose Email</h5>

      <div className={styles.row}>
        <div className={styles.field}>
          <input
            id={`${idPrefix}-from`}
            type="email"
            className={styles.input}
            placeholder=" "
            value={value("from")}
            disabled={disabled}
            onChange={(e) => onChange?.("from", e.target.value)}
          />
          <label className={styles.label} htmlFor={`${idPrefix}-from`}>
            From *
          </label>
        </div>
        <div className={styles.field}>
          <input
            id={`${idPrefix}-to`}
            type="email"
            className={styles.input}
            placeholder=" "
            value={value("to")}
            disabled={disabled}
            onChange={(e) => onChange?.("to", e.target.value)}
          />
          <label className={styles.label} htmlFor={`${idPrefix}-to`}>
            To *
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <input
          id={`${idPrefix}-subject`}
          type="text"
          className={styles.input}
          placeholder=" "
          value={value("subject")}
          disabled={disabled}
          onChange={(e) => onChange?.("subject", e.target.value)}
        />
        <label className={styles.label} htmlFor={`${idPrefix}-subject`}>
          Subject *
        </label>
      </div>

      <div className={styles.field}>
        <textarea
          id={`${idPrefix}-message`}
          className={`${styles.input} ${styles.textarea}`}
          placeholder=" "
          value={value("message")}
          disabled={disabled}
          onChange={(e) => onChange?.("message", e.target.value)}
        />
        <label className={styles.label} htmlFor={`${idPrefix}-message`}>
          Message
        </label>
      </div>

      <div className={styles.attachments}>
        <span className={styles.attachmentsLabel}>
          Attachments{files.length > 0 ? ` (${files.length})` : ""}
        </span>
        <label
          className={styles.addNew}
          onClick={(e) => {
            if (disabled) e.preventDefault();
          }}
        >
          <AddIcon />
          <span>Add New</span>
          <input
            ref={fileInputRef}
            id={`${idPrefix}-file`}
            type="file"
            accept="image/*,.pdf"
            className={styles.fileInput}
            disabled={disabled}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((file, idx) => (
            <li key={`${file.name}-${file.size}-${idx}`} className={styles.fileRow}>
              <span className={styles.fileIcon}>
                <FileIcon />
              </span>
              <span className={styles.fileName} title={file.name}>
                {file.name}
              </span>
              <span className={styles.fileSize}>{formatSize(file.size)}</span>
              <button
                type="button"
                className={styles.fileRemove}
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                onClick={() => removeFile(idx)}
              >
                <RemoveIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className={styles.msg} role="status">
        {message || "\u00A0"}
      </p>

      <div className={styles.footer}>
        <button type="button" className={styles.cancel} onClick={onCancel} disabled={disabled}>
          {cancelLabel}
        </button>
        <button type="button" className={styles.submit} onClick={onSend} disabled={disabled}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export default EmailComposeForm;
