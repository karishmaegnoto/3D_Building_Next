"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { EmailComposeForm } from "@/components/shared";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { contractLabel } from "./contractData";
import styles from "./emailContractModal.module.scss";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M8.23734 7L14 1.23734L12.7627 0L7 5.76266L1.23751 0L0 1.23734L5.76266 7L0 12.7627L1.23751 14L7 8.23734L12.7627 14L14 12.7627L8.23734 7Z"
        fill="#fff"
        fillOpacity="0.7"
      />
    </svg>
  );
}

function EmailHeadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M18.25,6h-15A1.25,1.25,0,0,0,2,7.25v10A1.25,1.25,0,0,0,3.25,18.5h15a1.25,1.25,0,0,0,1.25-1.25v-10A1.25,1.25,0,0,0,18.25,6ZM16.875,7.25,10.75,11.488,4.625,7.25ZM3.25,17.25V7.819l7.144,4.944a.625.625,0,0,0,.712,0L18.25,7.819V17.25Z"
        transform="translate(-0.75 -2.25)"
        fill="#12182B"
      />
    </svg>
  );
}

export function EmailContractModal({ isOpen, contracts = [], leadEmail, onClose, onSend }) {
  const toastError = useToastStore((s) => s.error);
  const currentUser = useAuthStore((s) => s.user);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const list = useMemo(
    () =>
      (Array.isArray(contracts) ? contracts : []).filter(
        (c) => !c?.isVoid && !c?.isCancelled
      ),
    [contracts]
  );

  const firstId = list[0]?.id || list[0]?._id;
  const [contractId, setContractId] = useState(
    list.length === 1 && firstId ? String(firstId) : ""
  );
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(leadEmail || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [contractMsg, setContractMsg] = useState(null);
  const [formMsg, setFormMsg] = useState(null);
  const [sending, setSending] = useState(false);

  const fromValue = from || currentUser?.email || "";

  const values = { from: fromValue, to, subject, message };

  const handleChange = (key, nextValue) => {
    setFormMsg(null);
    if (key === "from") setFrom(nextValue);
    else if (key === "to") setTo(nextValue);
    else if (key === "subject") setSubject(nextValue);
    else if (key === "message") setMessage(nextValue);
  };

  const fail = (text) => {
    setFormMsg({ type: "error", text });
    toastError(text);
  };

  const handleSend = async () => {
    if (sending) return;
    if (!contractId) {
      const text = "Please select a contract.";
      setContractMsg({ type: "error", text });
      toastError(text);
      return;
    }
    setContractMsg(null);
    if (!fromValue.trim() || !EMAIL_RE.test(fromValue.trim())) {
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
      await onSend?.({
        contractId,
        from: fromValue.trim(),
        to: to.trim(),
        subject: subject.trim(),
        message: message.trim(),
        files,
      });
    } catch (err) {
      fail(err?.message || "Failed to send contract email.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modal = (
    <div
      className={styles.backdrop}
      onClick={sending ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Email Contract"
    >
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <div className={styles.body}>
            <button
              type="button"
              className={styles.dismiss}
              onClick={sending ? undefined : onClose}
              disabled={sending}
              aria-label="Close"
            >
              <CloseIcon />
            </button>

            <div className={styles.head}>
              <div className={styles.headIcon}>
                <EmailHeadIcon />
              </div>
              <h4 className={styles.title}>Email Contract</h4>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="email-contract-select">
                Select Contract
              </label>
              <select
                id="email-contract-select"
                className={styles.select}
                value={contractId}
                disabled={sending}
                onChange={(e) => {
                  setContractId(e.target.value);
                  setContractMsg(null);
                  setFormMsg(null);
                }}
              >
                <option value="">Select Contract</option>
                {list.map((contract, idx) => {
                  const id = contract?.id || contract?._id;
                  return (
                    <option key={id || `contract-${idx}`} value={id ? String(id) : ""}>
                      {contractLabel(contract, idx)}
                    </option>
                  );
                })}
              </select>
              {contractMsg && (
                <p className={styles.fieldMsg} role="alert">
                  {contractMsg.text}
                </p>
              )}
            </div>

            {contractId && (
              <EmailComposeForm
                idPrefix="email-contract"
                values={values}
                onChange={handleChange}
                files={files}
                onFilesChange={(next) => {
                  setFiles(next);
                  setFormMsg(null);
                }}
                feedback={formMsg}
                disabled={sending}
                onCancel={onClose}
                onSend={handleSend}
                cancelLabel="Cancel"
                submitLabel={sending ? "Sending..." : "Send"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default EmailContractModal;
