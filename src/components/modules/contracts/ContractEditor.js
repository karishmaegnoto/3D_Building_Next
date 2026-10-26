"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { withBasePath } from "@/lib/constants";
import { contractsApi } from "@/lib/api/contracts";
import { quotesApi } from "@/lib/api/quotes";
import { sanitizeQuoteFields } from "@/lib/pdf/imageData";
import { QuoteInteractiveViewer } from "@/components/modules/quotes/QuoteInteractiveViewer";
import styles from "./contractEditor.module.scss";

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

// Same layout/behavior as QuoteEditor, but the PDF comes from
// POST /contractTemplate/documents and saving posts to /contract/save.
export function ContractEditor({
  leadId: propLeadId,
  quoteId: propQuoteId,
  manufacturerId: propManufacturerId,
  template: propTemplate,
  contractId: propContractId,
  onBack
}) {
  const searchParams = useSearchParams();

  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  const leadId = propLeadId || searchParams?.get("leadId");
  const quoteId = propQuoteId || searchParams?.get("quoteId");
  const manufacturerId = propManufacturerId || searchParams?.get("manufacturerId");
  const template = propTemplate || searchParams?.get("template");
  const contractId = propContractId || searchParams?.get("contractId");
  const isEditMode = Boolean(contractId);

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [contractFields, setContractFields] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [extraDocs, setExtraDocs] = useState([]);
  const [openDocIndex, setOpenDocIndex] = useState(null);
  const [docBlobs, setDocBlobs] = useState({});
  const [docLoading, setDocLoading] = useState({});
  const [docErrors, setDocErrors] = useState({});

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

  // Prevent background scrolling while ContractEditor is full screen
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

  // Same as PHP: full redirect back to edit-lead (contracts tab) so the
  // saved contract loads fresh from the DB. A full reload also avoids the
  // dev-mode CSS chunk mismatch of client-side cross-layout navigation.
  const goBackToLead = () => {
    window.location.assign(
      withBasePath(leadId ? `/lead/edit-lead/${leadId}` : "/quotes")
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBackToLead();
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
    if (!quoteId || !template) {
      setError("Quote or contract template is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setExtraDocs([]);
    setOpenDocIndex(null);
    setDocBlobs({});
    setDocLoading({});
    setDocErrors({});
    try {
      let initialFields = {};
      try {
        const quoteRes = await quotesApi.getQuoteById(quoteId);
        initialFields = quoteRes?.results?.fields || quoteRes?.data?.fields || {};
      } catch (_) {
        initialFields = {};
      }
      if (initialFields && Object.keys(initialFields).length > 0) {
        setContractFields(initialFields);
      }
      // Same "show contract" payload for create and edit: contractId is the
      // saved contract id on Edit, null on fresh create (backend then uses
      // the quote field mapping).
      const docs = await contractsApi.getContractDocuments({
        quoteId,
        manufacturerId: manufacturerId || null,
        contractTemplateId: template,
        contractId: contractId || null,
      });
      const fileUrl = docs?.results?.contract?.fileUrl;
      if (!fileUrl) {
        throw new Error("Contract PDF is not available yet.");
      }
      // Manufacturer extra documents (additional + VSS) render as their own
      // accordions below, same as PHP (Document-1, Document-2, ...).
      const extras = [
        ...(Array.isArray(docs?.results?.additionalDocuments)
          ? docs.results.additionalDocuments
          : []),
        ...(Array.isArray(docs?.results?.vssDocuments) ? docs.results.vssDocuments : []),
      ]
        .filter((doc) => doc && doc.fileUrl)
        .map((doc) => ({ name: doc.name || "Document", fileUrl: doc.fileUrl }));
      setExtraDocs(extras);
      const blob = await contractsApi.getContractPdf(fileUrl);
      setPdfBlob(blob);
    } catch (err) {
      console.error("Failed to fetch contract PDF:", err);
      setError(err?.message || "Failed to load contract PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdf();
  }, [quoteId, manufacturerId, template, contractId]);

  const fetchDoc = async (index) => {
    const doc = extraDocs[index];
    if (!doc || docBlobs[index]) return;
    setDocLoading((prev) => ({ ...prev, [index]: true }));
    setDocErrors((prev) => ({ ...prev, [index]: "" }));
    try {
      const blob = await contractsApi.getContractPdf(doc.fileUrl);
      setDocBlobs((prev) => ({ ...prev, [index]: blob }));
    } catch (err) {
      setDocErrors((prev) => ({ ...prev, [index]: err?.message || "Failed to load document." }));
    } finally {
      setDocLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const toggleDoc = (index) => {
    if (openDocIndex === index) {
      setOpenDocIndex(null);
      return;
    }
    setOpenDocIndex(index);
    fetchDoc(index);
  };

  const handleSaveContract = async () => {
    if (!leadId || !quoteId || !template) {
      triggerToast("error", "Cannot save contract: Lead, Quote or Template is missing.");
      return;
    }
    // Edit mode persists via POST /contract/update (backend merges fields);
    // create mode persists via POST /contract/save.
    if (isEditMode && !contractId) {
      triggerToast("error", "Cannot update contract: Contract ID is missing.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const viewerData = viewerRef.current?.getQuoteData() || {
        combined: {},
      };
      const fields = sanitizeQuoteFields(viewerData.combined || {});

      try {
        let response;
        if (isEditMode) {
          response = await contractsApi.updateContract({
            contractId,
            leadId,
            quoteId,
            templateId: template,
            fields,
          });
        } else {
          response = await contractsApi.saveContract({
            leadId,
            quoteId,
            templateId: template,
            manufacturerId: manufacturerId || undefined,
            fields,
          });
        }
        const msg =
          response?.message ||
          (isEditMode ? "Contract updated successfully!" : "Contract saved successfully!");
        triggerToast("success", msg);

        setTimeout(() => {
          goBackToLead();
        }, 1100);
      } catch (apiErr) {
        console.warn("Backend save warning:", apiErr);
        triggerToast("error", apiErr?.message || "Failed to save contract.");
      }
    } catch (err) {
      console.error("Failed to save contract:", err);
      triggerToast("error", err?.message || "Failed to save contract. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.contractEditorContainer} ref={containerRef}>
      {/* ── Top Bar: Title & Fullscreen/Back Actions ─────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>{isEditMode ? "Edit Contract" : "Contract"}</h1>
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

      {/* ── Main Accordion Card: Contract Editor ─────────────────── */}
      <div className={styles.editorCard}>
        <div
          className={styles.cardHeader}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <span className={styles.editorTitle}>Contract Editor</span>
          <button
            type="button"
            className={`${styles.chevronBtn} ${collapsed ? styles.collapsed : ""}`}
            aria-label={collapsed ? "Expand Contract Editor" : "Collapse Contract Editor"}
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
                <span>Loading Contract PDF...</span>
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
                  initialFields={contractFields}
                  initialScale={1.6}
                />
              </div>
            )}

            <div className={styles.saveBtnRow}>
              <button
                type="button"
                className={styles.saveContractBtn}
                onClick={handleSaveContract}
                disabled={saving || loading || !pdfBlob}
              >
                {saving
                  ? (isEditMode ? "Updating Contract..." : "Saving Contract...")
                  : (isEditMode ? "Update Contract" : "Save Contract")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Extra Document Accordions (manufacturer additional + VSS docs) ── */}
      {extraDocs.map((doc, idx) => {
        const isOpen = openDocIndex === idx;
        return (
          <div className={styles.editorCard} key={`${doc.fileUrl}-${idx}`}>
            <div
              className={styles.cardHeader}
              onClick={() => toggleDoc(idx)}
            >
              <span className={styles.editorTitle}>{doc.name}</span>
              <button
                type="button"
                className={`${styles.chevronBtn} ${isOpen ? "" : styles.collapsed}`}
                aria-label={isOpen ? `Collapse ${doc.name}` : `Expand ${doc.name}`}
              >
                <ChevronDownIcon />
              </button>
            </div>

            {isOpen && (
              <div className={styles.cardBody}>
                {docLoading[idx] ? (
                  <div className={styles.stateBox}>
                    <div className={styles.spinner} />
                    <span>Loading document...</span>
                  </div>
                ) : docErrors[idx] && !docBlobs[idx] ? (
                  <div className={styles.stateBox}>
                    <span>{docErrors[idx]}</span>
                    <button
                      type="button"
                      className={styles.retryBtn}
                      onClick={() => fetchDoc(idx)}
                    >
                      Retry
                    </button>
                  </div>
                ) : docBlobs[idx] ? (
                  <div className={styles.pdfWrapper}>
                    <QuoteInteractiveViewer pdfBlob={docBlobs[idx]} initialFields={{}} initialScale={1.6} />
                  </div>
                ) : null}
              </div>
            )}
          </div>
        );
      })}

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

export default ContractEditor;
