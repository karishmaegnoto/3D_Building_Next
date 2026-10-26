"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { quoteLabel } from "./contractData";
import styles from "./createContractModal.module.scss";

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M8.23734 7L14 1.23734L12.7627 0L7 5.76266L1.23751 0L0 1.23734L5.76266 7L0 12.7627L1.23751 14L7 8.23734L12.7627 14L14 12.7627L8.23734 7Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
    </svg>
  );
}

export function CreateContractModal({
  isOpen,
  quotes = [],
  manufacturers = [],
  loadingManufacturers = false,
  defaultManufacturerId = "",
  onClose,
  onSubmit,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const quoteList = Array.isArray(quotes) ? quotes : [];
  const firstQuoteId = quoteList[0]?._id || quoteList[0]?.id;

  const [quoteId, setQuoteId] = useState(firstQuoteId ? String(firstQuoteId) : "");
  const [manufacturerId, setManufacturerId] = useState(defaultManufacturerId || "");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const quoteOptions = quoteList.map((quote, idx) => {
    const id = quote?._id || quote?.id;
    return { value: id ? String(id) : "", label: quoteLabel(quote, idx) };
  });

  // Contract PDF templates come inline with GET /manufacturer/list
  const manufacturerList = Array.isArray(manufacturers) ? manufacturers : [];
  const selectedManufacturer = manufacturerList.find((m) => m?.value === manufacturerId);
  const templateOptions = Array.isArray(selectedManufacturer?.templates)
    ? selectedManufacturer.templates
    : [];
  const effectiveTemplateId =
    templateId || (templateOptions.length === 1 ? templateOptions[0].value : "");

  const helperText = !manufacturerId
    ? "Select manufacturer first."
    : templateOptions.length === 0
      ? "No contract templates found for selected manufacturer."
      : "Select one of the uploaded manufacturer templates.";

  if (!isOpen || !mounted) return null;

  const handleSubmit = async () => {
    if (saving) return;
    if (!quoteId) {
      setError("Please select a quote.");
      return;
    }
    if (!manufacturerId) {
      setError("Please select a manufacturer.");
      return;
    }
    if (!effectiveTemplateId) {
      setError("Please select a contract PDF template.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit?.({ quoteId, manufacturerId, templateId: effectiveTemplateId });
    } catch (err) {
      setError(err?.message || "Failed to create contract.");
    } finally {
      setSaving(false);
    }
  };

  const modal = (
    <div
      className={styles.backdrop}
      onClick={saving ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Create Contract"
    >
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <div className={styles.body}>
            <button
              type="button"
              className={styles.dismiss}
              onClick={saving ? undefined : onClose}
              disabled={saving}
              aria-label="Close"
            >
              <CloseIcon />
            </button>

            <h4 className={styles.title}>Create Contract</h4>
            <p className={styles.subtitle}>
              Select the quote and choose a manufacturer contract template.
            </p>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="create-contract-quote">
                Select Quote *
              </label>
              <select
                id="create-contract-quote"
                className={styles.select}
                value={quoteId}
                disabled={saving}
                onChange={(e) => {
                  setQuoteId(e.target.value);
                  setError("");
                }}
              >
                <option value="">Select Quote</option>
                {quoteOptions.map((opt, idx) => (
                  <option key={opt.value || `quote-${idx}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="create-contract-manufacturer">
                Manufacturer *
              </label>
              <select
                id="create-contract-manufacturer"
                className={styles.select}
                value={manufacturerId}
                disabled={saving}
                onChange={(e) => {
                  const next = e.target.value;
                  setManufacturerId(next);
                  setTemplateId("");
                  setError("");
                }}
              >
                <option value="">
                  {loadingManufacturers
                    ? "Loading manufacturers..."
                    : manufacturers.length === 0
                      ? "No manufacturers found."
                      : "Select Manufacturer"}
                </option>
                {manufacturers.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="create-contract-template">
                Select Contract PDF *
              </label>
              <select
                id="create-contract-template"
                className={styles.select}
                value={effectiveTemplateId}
                disabled={saving || !manufacturerId}
                onChange={(e) => {
                  setTemplateId(e.target.value);
                  setError("");
                }}
              >
                <option value="">Select Contract PDF</option>
                {templateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className={styles.help}>{helperText}</p>
            </div>

            <p className={styles.formError} role="alert">
              {error || "\u00A0"}
            </p>

            <div className={styles.footer}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={saving}
              >
                Close
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save PDF Contract"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default CreateContractModal;
