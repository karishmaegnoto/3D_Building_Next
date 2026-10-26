"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { leadsApi } from "@/lib/api/leads";
import { quotesApi } from "@/lib/api/quotes";
import styles from "./quoteModal.module.scss";

export function SelectQuoteTypeModal({
  isOpen,
  onClose,
  leadId,
  initialType = "",
  onContinue,
  onSuccess,
}) {
  const router = useRouter();
  const params = useParams();
  const initialLeadId = leadId || params?.id || "";

  const [selectedLeadId, setSelectedLeadId] = useState(initialLeadId);
  const [leadsList, setLeadsList] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [quoteType, setQuoteType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialLeadId) {
      setSelectedLeadId(initialLeadId);
    }
  }, [initialLeadId]);

  useEffect(() => {
    if (isOpen && !initialLeadId) {
      setLoadingLeads(true);
      leadsApi
        .getLeadList({ limit: 50 })
        .then((res) => {
          const leads = res?.leads || [];
          setLeadsList(leads);
          if (leads.length > 0 && !selectedLeadId) {
            setSelectedLeadId(leads[0]._id);
          }
        })
        .catch((err) => {
          console.error("Failed to load leads list:", err);
        })
        .finally(() => {
          setLoadingLeads(false);
        });
    }
  }, [isOpen, initialLeadId]);

  useEffect(() => {
    if (isOpen) {
      setLoadingTemplates(true);
      quotesApi
        .getQuoteTemplates()
        .then((res) => {
          const list = res?.results || res?.data || (Array.isArray(res) ? res : []);
          setTemplates(list);
          if (list.length > 0) {
            setQuoteType((prev) => {
              const exists = list.some((t) => (t.id || t._id) === prev);
              return exists ? prev : (list[0].id || list[0]._id);
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load quote templates:", err);
          setError("Failed to load quote templates.");
        })
        .finally(() => {
          setLoadingTemplates(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = () => {
    const targetLeadId = selectedLeadId || initialLeadId;
    if (!targetLeadId) {
      setError("Please select or specify a Lead before continuing.");
      return;
    }
    if (!quoteType) {
      setError("Please select a quote template before continuing.");
      return;
    }

    setLoading(true);
    setError(null);

    const selectedTemplate = templates.find((t) => (t.id || t._id) === quoteType);

    try {
      if (onContinue) {
        onContinue(quoteType, targetLeadId, selectedTemplate);
      }
      if (onSuccess) {
        onSuccess(targetLeadId, quoteType, selectedTemplate);
      }
      if (onClose) {
        onClose();
      }

      router.push(`/quotes/editor?leadId=${targetLeadId}&template=${quoteType}`);
    } catch (err) {
      console.error("Failed to navigate to quote editor:", err);
      setError(err?.message || "Failed to open quote editor.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={loading ? undefined : onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Select Quote Type</h3>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={loading ? undefined : onClose}
            aria-label="Close"
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <p className={styles.modalSubtitle}>
          Select which quote PDF template you want to create before opening the quote editor.
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {!initialLeadId && (
          <div className={styles.leadField}>
            <label
              className={styles.leadLabel}
            >
              Select Lead
            </label>
            <div className={styles.modalSelectWrap}>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                disabled={loading || loadingLeads}
              >
                {loadingLeads ? (
                  <option value="">Loading leads...</option>
                ) : leadsList.length === 0 ? (
                  <option value="">No leads found</option>
                ) : (
                  leadsList.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.firstName || ""} {l.lastName || ""} {l.leadNumber ? `(#${l.leadNumber})` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        )}

        <div className={styles.modalSelectWrap}>
          <select
            value={quoteType}
            onChange={(e) => setQuoteType(e.target.value)}
            disabled={loading || loadingTemplates}
          >
            {loadingTemplates ? (
              <option value="">Loading templates...</option>
            ) : templates.length === 0 ? (
              <option value="">No templates found</option>
            ) : (
              templates.map((tpl) => {
                const val = tpl.id || tpl._id;
                return (
                  <option key={val} value={val}>
                    {tpl.name || "Untitled Template"}
                  </option>
                );
              })
            )}
          </select>
        </div>

        <button
          type="button"
          className={styles.modalContinueBtn}
          onClick={handleContinue}
          disabled={loading || loadingTemplates || !quoteType}
        >
          {loading ? "Opening..." : "Continue"}
        </button>
      </div>
    </div>
  );
}

export default SelectQuoteTypeModal;
