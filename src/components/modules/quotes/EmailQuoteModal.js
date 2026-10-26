"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { quotesApi } from "@/lib/api/quotes";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import styles from "./emailQuoteModal.module.scss";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M8.23734 7L14 1.23734L12.7627 0L7 5.76266L1.23751 0L0 1.23734L5.76266 7L0 12.7627L1.23751 14L7 8.23734L12.7627 14L14 12.7627L8.23734 7Z" fill="#fff" fillOpacity="0.7" />
    </svg>
  );
}

function EmailHeadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M18.25,6h-15A1.25,1.25,0,0,0,2,7.25v10A1.25,1.25,0,0,0,3.25,18.5h15a1.25,1.25,0,0,0,1.25-1.25v-10A1.25,1.25,0,0,0,18.25,6ZM16.875,7.25,10.75,11.488,4.625,7.25ZM3.25,17.25V7.819l7.144,4.944a.625.625,0,0,0,.712,0L18.25,7.819V17.25Z" transform="translate(-0.75 -2.25)" fill="#12182B" />
    </svg>
  );
}

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
      <path d="M14.5,9.5V7a.568.568,0,0,0-.187-.437L9.938,2.187A.568.568,0,0,0,9.5,2H3.25A1.254,1.254,0,0,0,2,3.25v15A1.25,1.25,0,0,0,3.25,19.5h10V18.25h-10v-15h5V7A1.254,1.254,0,0,0,9.5,8.25h3.75V9.5ZM9.5,7V3.5L13,7Z" transform="translate(-0.75 -0.75)" fill="#a8a29e" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M8.23734 7L14 1.23734L12.7627 0L7 5.76266L1.23751 0L0 1.23734L5.76266 7L0 12.7627L1.23751 14L7 8.23734L12.7627 14L14 12.7627L8.23734 7Z" fill="#ff9b9f" />
    </svg>
  );
}

function quoteLabel(q, idx) {
  return q?.name || q?.quoteNumber || `Quote ${idx + 1}`;
}

function formatSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function EmailQuoteModal({ isOpen, quote, quotes, leadEmail, onClose }) {
  const toastSuccess = useToastStore((s) => s.success);
  const toastError = useToastStore((s) => s.error);
  const currentUser = useAuthStore((s) => s.user);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const list = useMemo(() => (Array.isArray(quotes) ? quotes : []), [quotes]);
  const preselectedId = quote?._id || quote?.id || null;

  const [selectedQuoteId, setSelectedQuoteId] = useState(preselectedId ? String(preselectedId) : "");
  const [from, setFrom] = useState(currentUser?.email || "");
  const [to, setTo] = useState(leadEmail || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [formMsg, setFormMsg] = useState(null);
  const [sending, setSending] = useState(false);
  const [quoteMenuOpen, setQuoteMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const quoteMenuRef = useRef(null);

  const quoteOptions = useMemo(
    () =>
      list.map((q, idx) => {
        const id = q?._id || q?.id;
        return { value: id ? String(id) : "", label: quoteLabel(q, idx) };
      }),
    [list]
  );

  const selectedQuoteLabel = useMemo(
    () => quoteOptions.find((o) => o.value !== "" && o.value === selectedQuoteId)?.label || "",
    [quoteOptions, selectedQuoteId]
  );

  useEffect(() => {
    if (!quoteMenuOpen) return;
    const onPointerDown = (e) => {
      if (quoteMenuRef.current && !quoteMenuRef.current.contains(e.target)) setQuoteMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setQuoteMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [quoteMenuOpen]);

  useEffect(() => {
    if (!from && currentUser?.email) setFrom(currentUser.email);
  }, [currentUser?.email, from]);

  useEffect(() => {
    if (!selectedQuoteId && list.length === 1) {
      const only = list[0];
      const id = only?._id || only?.id;
      if (id) setSelectedQuoteId(String(id));
    }
  }, [list, selectedQuoteId]);

  const fail = (text) => {
    setFormMsg({ type: "error", text });
    toastError(text);
  };

  const isAllowedAttachment = (file) => {
    const name = file?.name || "";
    const ext = name.includes(".") ? `.${name.split(".").pop().toLowerCase()}` : "";
    return (
      ALLOWED_ATTACHMENT_TYPES.includes(file?.type) ||
      String(file?.type || "").startsWith("image/") ||
      ALLOWED_ATTACHMENT_EXTS.includes(ext)
    );
  };

  const handleFiles = (fileList) => {
    const picked = Array.from(fileList || []).filter(Boolean);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (picked.length === 0) return;
    const next = picked[0];
    if (!isAllowedAttachment(next)) {
      fail("Invalid file type. Only images and PDF files are allowed.");
      return;
    }
    if (next.size > MAX_ATTACHMENT_BYTES) {
      fail("File size too large. Maximum allowed size is 20MB.");
      return;
    }
    setFiles([next]);
    setFormMsg(null);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    if (sending) return;
    if (!selectedQuoteId) {
      fail("Please select a quote.");
      return;
    }
    if (!from.trim() || !EMAIL_RE.test(from.trim())) {
      fail("Please enter a valid From email.");
      return;
    }
    if (!to.trim() || !EMAIL_RE.test(to.trim())) {
      fail("Please enter a valid To email.");
      return;
    }
    if (!subject.trim()) {
      fail("Please enter a subject.");
      return;
    }
    setSending(true);
    setFormMsg(null);
    try {
      await quotesApi.sendQuoteEmail(
        {
          quoteId: selectedQuoteId,
          from: from.trim(),
          to: to.trim(),
          subject: subject.trim(),
          message: message.trim(),
        },
        files
      );
      const text = "Quote email sent successfully.";
      setFormMsg({ type: "success", text });
      toastSuccess(text);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      fail(err?.message || "Failed to send quote email.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modal = (
    <div
      className={styles.emailQuoteBackdrop}
      onClick={sending ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Email to Lead"
    >
      <div className={styles.emailQuoteDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.emailQuoteContent}>
          <div className={styles.emailQuoteBody}>
            <button
              type="button"
              className={styles.emailQuoteDismiss}
              onClick={sending ? undefined : onClose}
              aria-label="Close"
              disabled={sending}
            >
              <CloseIcon />
            </button>
            <div className={styles.emailQuoteHead}>
              <div className={styles.emailQuoteIcon}>
                <EmailHeadIcon />
              </div>
              <h4 className={styles.emailQuoteTitle}>Email to Lead</h4>
            </div>
            <div className={styles.emailQuoteForm}>
              <div className={styles.emailQuoteField} ref={quoteMenuRef}>
                <button
                  type="button"
                  id="email-quote-select"
                  className={`${styles.emailQuoteDropdownBox} ${quoteMenuOpen ? styles.open : ""}`}
                  aria-haspopup="listbox"
                  aria-expanded={quoteMenuOpen}
                  disabled={sending}
                  onClick={() => {
                    if (!sending) setQuoteMenuOpen((prev) => !prev);
                  }}
                >
                  <span className={selectedQuoteLabel ? styles.emailQuoteDropdownValue : styles.emailQuoteDropdownPlaceholder}>
                    {selectedQuoteLabel || "Select Quote"}
                  </span>
                  <span className={`${styles.emailQuoteDropdownCaret} ${quoteMenuOpen ? styles.open : ""}`} aria-hidden="true" />
                </button>
                <span className={styles.emailQuoteLabel}>Select Quote</span>
                {quoteMenuOpen && !sending && (
                  <div className={styles.emailQuoteDropdownMenu} role="listbox" aria-label="Select Quote">
                    {quoteOptions.length === 0 && (
                      <div className={styles.emailQuoteDropdownEmpty}>No quotes found.</div>
                    )}
                    {quoteOptions.map((o, idx) => (
                      <button
                        key={o.value !== "" ? o.value : `empty-${idx}`}
                        type="button"
                        role="option"
                        aria-selected={o.value !== "" && o.value === selectedQuoteId}
                        className={`${styles.emailQuoteDropdownItem} ${o.value !== "" && o.value === selectedQuoteId ? styles.selected : ""}`}
                        onClick={() => {
                          setSelectedQuoteId(o.value);
                          setFormMsg(null);
                          setQuoteMenuOpen(false);
                        }}
                      >
                        <span className={styles.emailQuoteDropdownItemLabel}>{o.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <h5 className={styles.emailQuoteSubhead}>Compose Email</h5>

              <div className={styles.emailQuoteRow}>
                <div className={styles.emailQuoteField}>
                  <input
                    id="email-quote-from"
                    type="email"
                    className={styles.emailQuoteInput}
                    placeholder=" "
                    value={from}
                    disabled={sending}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                  <label className={styles.emailQuoteLabel} htmlFor="email-quote-from">
                    From *
                  </label>
                </div>
                <div className={styles.emailQuoteField}>
                  <input
                    id="email-quote-to"
                    type="email"
                    className={styles.emailQuoteInput}
                    placeholder=" "
                    value={to}
                    disabled={sending}
                    onChange={(e) => setTo(e.target.value)}
                  />
                  <label className={styles.emailQuoteLabel} htmlFor="email-quote-to">
                    To *
                  </label>
                </div>
              </div>

              <div className={styles.emailQuoteField}>
                <input
                  id="email-quote-subject"
                  type="text"
                  className={styles.emailQuoteInput}
                  placeholder=" "
                  value={subject}
                  disabled={sending}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <label className={styles.emailQuoteLabel} htmlFor="email-quote-subject">
                  Subject *
                </label>
              </div>

              <div className={styles.emailQuoteField}>
                <textarea
                  id="email-quote-message"
                  className={`${styles.emailQuoteInput} ${styles.emailQuoteTextarea}`}
                  placeholder=" "
                  value={message}
                  disabled={sending}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <label className={styles.emailQuoteLabel} htmlFor="email-quote-message">
                  Message
                </label>
              </div>

              <div className={styles.emailQuoteAttachments}>
                <span className={styles.emailQuoteAttachmentsLabel}>
                  Attachments{files.length > 0 ? ` (${files.length})` : ""}
                </span>
                <label
                  className={styles.emailQuoteAddNew}
                  onClick={(e) => {
                    if (sending) e.preventDefault();
                  }}
                >
                  <AddIcon />
                  <span>Add New</span>
                  <input
                    ref={fileInputRef}
                    id="email-quote-file-input"
                    type="file"
                    accept="image/*,.pdf"
                    className={styles.emailQuoteFileInput}
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
              </div>

              {files.length > 0 && (
                <ul className={styles.emailQuoteFileList}>
                  {files.map((file, idx) => (
                    <li key={`${file.name}-${file.size}-${idx}`} className={styles.emailQuoteFileRow}>
                      <span className={styles.emailQuoteFileIcon}>
                        <FileIcon />
                      </span>
                      <span className={styles.emailQuoteFileName} title={file.name}>
                        {file.name}
                      </span>
                      <span className={styles.emailQuoteFileSize}>{formatSize(file.size)}</span>
                      <button
                        type="button"
                        className={styles.emailQuoteFileRemove}
                        aria-label={`Remove ${file.name}`}
                        disabled={sending}
                        onClick={() => removeFile(idx)}
                      >
                        <RemoveIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <p className={styles.emailQuoteMsg} role="status">
                {formMsg ? (
                  <span className={formMsg.type === "success" ? styles.emailQuoteMsgSuccess : styles.emailQuoteMsgError}>
                    {formMsg.text}
                  </span>
                ) : (
                  "\u00A0"
                )}
              </p>

              <div className={styles.emailQuoteFooter}>
                <button
                  type="button"
                  className={styles.emailQuoteCancel}
                  onClick={onClose}
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.emailQuoteSubmit}
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}

export default EmailQuoteModal;
