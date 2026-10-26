"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import { quotesApi } from "@/lib/api/quotes";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { DropdownSelect } from "@/components/shared";
import styles from "./shareQuoteModal.module.scss";

const MAX_SHARE_USERS = 3;
const SHARE_RECIPIENT_ROLES = ["lead owner", "lead owner assist"];

function isShareRecipient(u) {
  const role = typeof u?.role === "object" ? u?.role?.name : u?.role;
  const key = String(role || "").trim().toLowerCase();
  return SHARE_RECIPIENT_ROLES.includes(key);
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M8.23734 7L14 1.23734L12.7627 0L7 5.76266L1.23751 0L0 1.23734L5.76266 7L0 12.7627L1.23751 14L7 8.23734L12.7627 14L14 12.7627L8.23734 7Z" fill="#fff" fillOpacity="0.7" />
    </svg>
  );
}

function ShareHeadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 30 32" fill="none" aria-hidden="true">
      <path d="M23.6532 20.2854C22.8111 20.2896 21.9807 20.4829 21.2233 20.8509C20.4659 21.2189 19.8007 21.7523 19.277 22.4116L11.0532 17.2704C11.3529 16.3031 11.3529 15.2677 11.0532 14.3004L19.277 9.15914C20.1117 10.1927 21.2852 10.8975 22.5898 11.1486C23.8943 11.3997 25.2457 11.181 26.4044 10.5312C27.5632 9.88141 28.4545 8.84244 28.9206 7.59837C29.3867 6.35429 29.3974 4.9854 28.9508 3.7342C28.5042 2.48299 27.6292 1.43023 26.4808 0.762395C25.3323 0.094562 23.9845 -0.145233 22.6762 0.085489C21.3679 0.316211 20.1835 1.00256 19.3327 2.02295C18.482 3.04333 18.0199 4.3319 18.0282 5.66039C18.0335 6.16346 18.1093 6.66332 18.2532 7.14539L10.0295 12.2866C9.30345 11.3727 8.31108 10.7072 7.18992 10.3825C6.06876 10.0577 4.87434 10.0898 3.77224 10.4743C2.67013 10.8587 1.71492 11.5765 1.03902 12.5282C0.363118 13.4798 0 14.6181 0 15.7854C0 16.9526 0.363118 18.091 1.03902 19.0426C1.71492 19.9942 2.67013 20.712 3.77224 21.0965C4.87434 21.481 6.06876 21.5131 7.18992 21.1883C8.31108 20.8636 9.30345 20.1981 10.0295 19.2841L18.2532 24.4254C18.1093 24.9075 18.0335 25.4073 18.0282 25.9104C18.0282 27.0229 18.3581 28.1104 18.9762 29.0355C19.5943 29.9605 20.4728 30.6815 21.5006 31.1072C22.5285 31.533 23.6595 31.6443 24.7506 31.4273C25.8418 31.2103 26.844 30.6745 27.6307 29.8879C28.4174 29.1012 28.9531 28.0989 29.1701 27.0078C29.3872 25.9166 29.2758 24.7856 28.85 23.7578C28.4243 22.73 27.7033 21.8515 26.7783 21.2334C25.8533 20.6153 24.7657 20.2854 23.6532 20.2854Z" fill="#12182B" />
    </svg>
  );
}
function displayNameOf(u) {
  const name =
    u?.name ||
    [u?.firstName, u?.lastName].filter(Boolean).join(" ") ||
    u?.username ||
    u?.email ||
    "Unnamed user";
  return String(name).trim().replace(/_/g, " ");
}
export function ShareQuoteModal({ isOpen, onClose, quote, onShared }) {
  const toastSuccess = useToastStore((s) => s.success);
  const toastError = useToastStore((s) => s.error);
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?._id || currentUser?.id || null;

  const [selected, setSelected] = useState([]);
  const [quoteMsg, setQuoteMsg] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const quoteId = quote?._id || quote?.id || null;

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: ({ signal }) => usersApi.getUsers({}, { signal }),
    staleTime: 30_000,
    enabled: isOpen,
  });

  const candidates = useMemo(() => {
    const list = usersQuery.data?.users;
    if (!Array.isArray(list)) return [];
    return list
      .filter((u) => {
        const id = u?._id || u?.id;
        if (!id) return false;
        if (currentUserId && String(id) === String(currentUserId)) return false;
        if (!isShareRecipient(u)) return false;
        return true;
      })
      .map((u) => ({
        value: String(u?._id || u?.id),
        label: displayNameOf(u),
      }));
  }, [usersQuery.data, currentUserId]);

  const handleSelect = (next) => {
    setQuoteMsg(null);
    setSelected(next);
  };

  const handleLimit = () => {
    setQuoteMsg({ type: "error", text: `Maximum ${MAX_SHARE_USERS} lead owners allowed.` });
  };

  const handleShare = async () => {
    if (!quoteId) {
      const text = "Cannot share: quote is missing an id.";
      setQuoteMsg({ type: "error", text });
      toastError(text);
      return;
    }
    if (selected.length === 0) {
      const text = "Please select at least one lead owner.";
      setQuoteMsg({ type: "error", text });
      toastError(text);
      return;
    }
    setSharing(true);
    setQuoteMsg(null);
    try {
      const results = await Promise.allSettled(
        selected.map((userId) =>
          quotesApi.shareQuote({ quoteId, userId, notes: "", status: "Pending" })
        )
      );
      const okCount = results.filter((r) => r.status === "fulfilled").length;
      const failCount = results.length - okCount;
      if (okCount === 0) {
        const text =
          results.find((r) => r.status === "rejected")?.reason?.message ||
          "Quote could not be shared.";
        setQuoteMsg({ type: "error", text });
        toastError(text);
        return;
      }
      const text =
        failCount === 0
          ? "Quote shared with lead owner for approval."
          : `Quote shared with ${okCount} lead owner(s); ${failCount} failed.`;
      setQuoteMsg({ type: failCount === 0 ? "success" : "error", text });
      toastSuccess(text);
      setSelected([]);
      if (onShared) await onShared();
      if (onClose) onClose();
    } finally {
      setSharing(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modal = (
    <div
      className={styles.shareQuoteBackdrop}
      onClick={sharing ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share Quote With Lead Owner"
    >
      <div className={styles.shareQuoteDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.shareQuoteContent}>
          <div className={styles.shareQuoteBody}>
            <button
              type="button"
              className={styles.shareQuoteDismiss}
              onClick={sharing ? undefined : onClose}
              aria-label="Close"
              disabled={sharing}
            >
              <CloseIcon />
            </button>
            <div className={styles.shareQuoteHead}>
              <div className={styles.shareQuoteIcon}>
                <ShareHeadIcon />
              </div>
              <h4 className={styles.shareQuoteTitle}>Share Quote With Lead Owner!</h4>
            </div>
            <div className={styles.shareQuoteForm}>
              <input type="hidden" name="quote_id" value={quoteId || ""} readOnly />
              <DropdownSelect
                id="share_quote"
                label="Share Quote With Lead Owner"
                placeholder={usersQuery.isLoading ? "Loading lead owners..." : "Select Owner Assist"}
                options={candidates}
                value={selected}
                onChange={handleSelect}
                max={MAX_SHARE_USERS}
                onLimit={handleLimit}
                disabled={sharing || usersQuery.isLoading}
                showSearch
                searchPlaceholder="Search lead owners..."
                emptyText="No lead owners found."
              />
              <p className={styles.shareQuoteMsg} role="status">
                {quoteMsg ? (
                  <span className={quoteMsg.type === "success" ? styles.shareQuoteMsgSuccess : styles.shareQuoteMsgError}>
                    {quoteMsg.text}
                  </span>
                ) : usersQuery.isError ? (
                  <span className={styles.shareQuoteMsgError}>
                    Failed to load lead owners.{" "}
                    <button
                      type="button"
                      className={styles.shareQuoteRetry}
                      onClick={() => usersQuery.refetch()}
                    >
                      Retry
                    </button>
                  </span>
                ) : (
                  "\u00A0"
                )}
              </p>
              <button
                type="button"
                className={styles.shareQuoteCancel}
                onClick={onClose}
                disabled={sharing}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.shareQuoteSubmit}
                onClick={handleShare}
                disabled={sharing}
              >
                {sharing ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}

export default ShareQuoteModal;
