"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { quotesApi } from "@/lib/api/quotes";
import { getQueryClient } from "@/lib/query/queryClient";
import { sanitizeQuoteFields } from "@/lib/pdf/imageData";
import { QuoteInteractiveViewer } from "./QuoteInteractiveViewer";
import styles from "./quoteEditor.module.scss";

function ChevronDownIcon({ className }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function FullscreenIcon({ isFullscreen }) {
  if (isFullscreen) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

export function QuoteEditor({
  leadId: propLeadId,
  template: propTemplate,
  quoteId: propQuoteId,
  onBack
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const containerRef = useRef(null);
  const blobUrlRef = useRef(null);
  const viewerRef = useRef(null);

  const leadId = propLeadId || searchParams?.get("leadId");
  const template = propTemplate || searchParams?.get("template") || "standard";
  const quoteId = propQuoteId || searchParams?.get("quoteId");

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [quoteFields, setQuoteFields] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  const triggerToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    if (type === "success") {
      setSaveSuccessMsg(message);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      setSaveSuccessMsg(null);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Prevent background scrolling while QuoteEditor is full screen
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Track browser native fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (leadId) {
      router.push(`/lead/edit-lead/${leadId}`);
    } else {
      router.push("/quotes");
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [leadId]);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const fetchPdf = async () => {
    if (!leadId && !quoteId) {
      setError("Lead ID or Quote ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let blob;
      if (quoteId) {
        blob = await quotesApi.editQuotePdf(quoteId, template);
      } else {
        blob = await quotesApi.createQuotePdf(leadId, template);
      }
      setPdfBlob(blob);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );

      if (blobUrlRef.current) {
        window.URL.revokeObjectURL(blobUrlRef.current);
      }
      blobUrlRef.current = url;
      setPdfBlobUrl(url);
    } catch (err) {
      console.error("Failed to generate/fetch quote PDF:", err);
      setError(err?.message || "Failed to load quote PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdf();
    if (quoteId) {
      quotesApi.getQuoteById(quoteId)
        .then((res) => {
          const fields = res?.results?.fields || res?.data?.fields;
          if (fields) {
            setQuoteFields(fields);
          }
        })
        .catch((err) => console.warn("Failed to fetch quote details:", err));
    }
    return () => {
      if (blobUrlRef.current) {
        window.URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [leadId, template, quoteId]);

  const handleSaveQuote = async () => {
    if (!leadId && !quoteId) {
      triggerToast("error", "Cannot save quote: Lead ID or Quote ID is missing.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const viewerData = viewerRef.current?.getQuoteData() || {
        combined: {},
      };

      const quoteSavePayload = {
        leadId,
        templateType: template,
        templateId: template,
        fields: sanitizeQuoteFields(viewerData.combined || {}),
      };

      console.log(quoteId ? "=== [UPDATE QUOTE OBJECT] ===" : "=== [SAVE QUOTE OBJECT] ===", quoteSavePayload);

      try {
        let response;
        if (quoteId) {
          response = await quotesApi.updateQuote(quoteId, quoteSavePayload);
          console.log("Update quote response:", response);
          const msg = response?.message || "Quote updated successfully!";
          triggerToast("success", msg);
        } else {
          response = await quotesApi.saveQuote(quoteSavePayload);
          console.log("Save quote response:", response);
          const msg = response?.message || "Quote saved successfully!";
          triggerToast("success", msg);
        }

        // Invalidate cached lead quotes so the new/updated quote shows
        // immediately when navigating back to the lead page (its
        // ["lead-quotes"] query has a 30s staleTime and would otherwise
        // keep serving the old list from cache).
        try {
          getQueryClient().invalidateQueries({ queryKey: ["lead-quotes"] });
        } catch (invErr) {
          console.warn("Failed to invalidate lead quotes cache:", invErr);
        }

        setTimeout(() => {
          if (leadId) {
            router.push(`/lead/edit-lead/${leadId}`);
          } else {
            handleBack();
          }
        }, 1100);
      } catch (apiErr) {
        console.warn("Backend save/update warning:", apiErr);
        const errMsg = apiErr?.message || (quoteId ? "Failed to update quote." : "Failed to save quote.");
        triggerToast("error", errMsg);
      }
    } catch (err) {
      console.error("Failed to save/update quote:", err);
      const errMsg = err?.message || (quoteId ? "Failed to update quote. Please try again." : "Failed to save quote. Please try again.");
      triggerToast("error", errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.quoteEditorContainer} ref={containerRef}>
      {/* ── Top Bar: Title & Fullscreen/Back Actions ─────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>{quoteId ? "Edit Quote" : "Quote"}</h1>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={toggleBrowserFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <FullscreenIcon isFullscreen={isFullscreen} />
            <span>{isFullscreen ? "Exit" : "Fullscreen"}</span>
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleBack}
            title="Back / Close"
          >
            <ArrowLeftIcon />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* ── Main Accordion Card: Quote Editor ───────────────────── */}
      <div className={styles.editorCard}>
        <div
          className={styles.cardHeader}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <span className={styles.editorTitle}>Quote Editor</span>
          <button
            type="button"
            className={`${styles.chevronBtn} ${collapsed ? styles.collapsed : ""}`}
            aria-label={collapsed ? "Expand Quote Editor" : "Collapse Quote Editor"}
          >
            <ChevronDownIcon />
          </button>
        </div>

        {!collapsed && (
          <div className={styles.cardBody}>
            {saveSuccessMsg && (
              <div className={`${styles.notificationBanner} ${styles.success}`}>
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {error && (
              <div className={`${styles.notificationBanner} ${styles.error}`}>
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className={styles.stateBox}>
                <div className={styles.spinner} />
                <span>Generating Quote PDF...</span>
              </div>
            ) : error && !pdfBlob ? (
              <div className={styles.stateBox}>
                <span>{error}</span>
                <button
                  type="button"
                  className={styles.retryBtn}
                  onClick={fetchPdf}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className={styles.pdfWrapper}>
                <QuoteInteractiveViewer
                  ref={viewerRef}
                  pdfBlob={pdfBlob}
                  initialFields={quoteFields}
                />
              </div>
            )}

            <div className={styles.saveBtnRow}>
              <button
                type="button"
                className={styles.saveQuoteBtn}
                onClick={handleSaveQuote}
                disabled={saving || loading || !pdfBlob}
              >
                {saving
                  ? (quoteId ? "Updating Quote..." : "Saving Quote...")
                  : (quoteId ? "Update Quote" : "Save Quote")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast Message Popup ───────────────────────────────────────── */}
      {toast && (
        <div className={toast.type === "success" ? styles.toastSuccess : styles.toastError}>
          <span className={styles.toastIcon}>{toast.type === "success" ? "✓" : "✕"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default QuoteEditor;
