"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { quotesApi } from "@/lib/api/quotes";
import { useMyShareEntry } from "./useApprovals";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { useApprovalReadStore } from "@/store/approvalReadStore";
import styles from "./quoteApprovalView.module.scss";

export function QuoteApprovalView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const toastSuccess = useToastStore((s) => s.success);
  const toastError = useToastStore((s) => s.error);
  const currentUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const myId = currentUser?._id || currentUser?.id || null;

  useEffect(() => {
    if (isAuthenticated && !currentUser) {
      fetchProfile();
    }
  }, [isAuthenticated, currentUser, fetchProfile]);

  const quoteId = searchParams?.get("quoteId");
  const leadId = searchParams?.get("leadId");
  const template = searchParams?.get("template") || "";

  const [comment, setComment] = useState("");
  const [commentInvalid, setCommentInvalid] = useState(false);
  const [deciding, setDeciding] = useState(null);
  const [decided, setDecided] = useState(null);

  const { entry: existingEntry } = useMyShareEntry(quoteId);
  const finalDecision = decided || (existingEntry && existingEntry.status !== "Pending" ? existingEntry.status : null);
  const viewerTitle = existingEntry?.quoteTitle || "VSS Quote PDF";

  useEffect(() => {
    if (existingEntry?.key) {
      useApprovalReadStore.getState().markViewed(existingEntry.key, existingEntry.date);
    }
  }, [existingEntry?.key, existingEntry?.date]);

  const pdfQuery = useQuery({
    queryKey: ["quote-view-pdf", quoteId, template],
    queryFn: ({ signal }) => quotesApi.editQuotePdf(quoteId, template, { signal }),
    staleTime: 60_000,
    retry: 1,
    enabled: !!quoteId,
  });

  const pdfUrl = useMemo(() => {
    if (!pdfQuery.data) return null;
    return window.URL.createObjectURL(
      new Blob([pdfQuery.data], { type: "application/pdf" })
    );
  }, [pdfQuery.data]);

  useEffect(() => {
    return () => {
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfQuery.isError) {
      toastError(pdfQuery.error?.message || "Failed to load quote PDF.");
    }
  }, [pdfQuery.isError, pdfQuery.error, toastError]);

  const goToOrigin = () => {
    const canGoBack = typeof window !== "undefined" && window.history.length > 1;
    const isPopupTab =
      typeof window !== "undefined" &&
      ((window.opener && !window.opener.closed) || !canGoBack);

    if (isPopupTab && leadId) {
      window.close();
      setTimeout(() => {
        router.push(`/lead/edit-lead/${leadId}`);
      }, 400);
      return;
    }
    if (leadId && !canGoBack) {
      router.push(`/lead/edit-lead/${leadId}`);
      return;
    }
    if (canGoBack) {
      router.back();
      return;
    }
    router.push(leadId ? `/lead/edit-lead/${leadId}` : "/");
  };

  const requireComment = () => {
    if (comment.trim() === "") {
      setCommentInvalid(true);
      return false;
    }
    setCommentInvalid(false);
    return true;
  };

  const handleDecision = async (status) => {
    if (deciding || finalDecision) return;
    if (!quoteId) {
      toastError("Cannot respond: quote is missing an id.");
      return;
    }
    if (!myId) {
      toastError("Please sign in again to respond.");
      return;
    }
    if (!requireComment()) {
      toastError("Comment is required.");
      return;
    }
    setDeciding(status);
    try {
      const res = await quotesApi.updateQuoteShare({
        quoteId,
        userId: myId,
        status,
        message: comment.trim(),
      });
      setDecided(status);
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["lead-quotes"] });
      toastSuccess(res?.message || (status === "Approved" ? "Quote approved." : "Quote rejected."));
      setTimeout(() => {
        goToOrigin();
      }, 700);
    } catch (err) {
      toastError(err?.message || "Failed to submit your response.");
    } finally {
      setDeciding(null);
    }
  };

  return (
    <div className={styles.approvalView}>
      <div className={styles.approvalShell}>
        <div className={styles.approvalTopBar}>
          <h1 className={styles.approvalTitle}>View Quote</h1>
          <button type="button" className={styles.approvalBack} onClick={goToOrigin}>
            Back
          </button>
        </div>

        <div className={styles.approvalActionBar}>
          {finalDecision ? (
            <div
              className={`${styles.approvalDecided} ${finalDecision === "Approved" ? styles.approved : styles.rejected}`}
              role="status"
            >
              {finalDecision === "Approved"
                ? "You have approved this quote."
                : "You have rejected this quote."}
            </div>
          ) : (
            <>
              <div className={styles.approvalCommentInline}>
                <label className={styles.approvalLabel} htmlFor="approval-comment">
                  Comment <span className={styles.approvalRequired}>*</span>
                </label>
                <textarea
                  id="approval-comment"
                  className={`${styles.approvalComment} ${commentInvalid ? styles.invalid : ""}`}
                  rows={2}
                  required
                  placeholder="Add your approval or rejection comment here..."
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (commentInvalid && e.target.value.trim() !== "") setCommentInvalid(false);
                  }}
                />
                {commentInvalid && (
                  <span className={styles.approvalCommentError}>Comment is required.</span>
                )}
              </div>
              <div className={styles.approvalActions}>
                <button
                  type="button"
                  className={styles.approvalApprove}
                  disabled={!!deciding}
                  onClick={() => handleDecision("Approved")}
                >
                  {deciding === "Approved" ? "Approving..." : "Approved"}
                </button>
                <button
                  type="button"
                  className={styles.approvalReject}
                  disabled={!!deciding}
                  onClick={() => handleDecision("Rejected")}
                >
                  {deciding === "Rejected" ? "Rejecting..." : "Rejected"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className={styles.approvalPdfCard}>
          <div className={styles.approvalViewerHead}>
            <h2 className={styles.approvalViewerTitle}>{viewerTitle}</h2>
            <p className={styles.approvalViewerSubtitle}>Shared quote PDF preview</p>
          </div>
          {pdfQuery.isLoading ? (
            <div className={styles.approvalState}>
              <div className={styles.approvalSpinner} />
              <span>Loading Quote PDF...</span>
            </div>
          ) : pdfQuery.isError || !pdfUrl ? (
            <div className={styles.approvalState}>
              <span>{pdfQuery.error?.message || "Failed to load quote PDF."}</span>
              <button
                type="button"
                className={styles.approvalRetry}
                onClick={() => pdfQuery.refetch()}
              >
                Retry
              </button>
            </div>
          ) : (
            <iframe
              className={styles.approvalPdfFrame}
              src={pdfUrl}
              title="Quote PDF"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default QuoteApprovalView;
