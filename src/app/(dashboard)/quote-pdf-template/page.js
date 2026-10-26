"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { UploadCloud, Check, X, AlertTriangle } from "lucide-react";
import styles from "./quotePdfTemplate.module.scss";

const PDFEditor = dynamic(
  () => import("@/components/modules/pdfEditor"),
  {
    ssr: false,
    loading: () => (
      <div className={styles.pdfLoading}>
        <div className={styles.pdfLoadingSpinner} />
        <p className={styles.pdfLoadingText}>Loading Quote AcroForm PDF Editor...</p>
      </div>
    )
  }
);

export default function QuotePdfTemplatePage() {
  const [pdfType, setPdfType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    setError("");
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file (.pdf).");
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleConvertToAcroPdf = () => {
    setError("");

    if (!pdfType.trim()) {
      setError("Please enter a PDF Type.");
      return;
    }

    if (!selectedFile) {
      setError("Please upload a PDF file.");
      return;
    }

    setIsEditorOpen(true);
  };

  const handleReset = () => {
    setPdfType("");
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isEditorOpen) {
    return (
      <PDFEditor
        initialFile={selectedFile}
        initialPdfType={pdfType}
        onBack={() => setIsEditorOpen(false)}
        onSave={() => {
          setIsEditorOpen(false);
          handleReset();
        }}
      />
    );
  }


  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <div className={styles.titleRow}>
          <span className={styles.accentMarker} />
          <h1 className={styles.pageTitle}>Quote PDF Template</h1>
        </div>
        <p className={styles.pageSubtitle}>
          Upload quote PDFs and launch the visual AcroForm editor to map and generate interactive fields.
        </p>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <span>Template Setup</span>
            </h2>
            <span className={styles.badge}>AcroForm</span>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              1. Pdf Type <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="pdfType"
              value={pdfType}
              onChange={(e) => setPdfType(e.target.value)}
              placeholder="e.g. Standard Quote, Viking Quote, Proposal Template"
              className={styles.inputField}
              autoComplete="off"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              2. PDF Upload <span className={styles.required}>*</span>
            </label>

            {!selectedFile ? (
              <div
                className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className={styles.hiddenFileInput}
                />
                <div className={styles.dropzoneIconWrap}>
                  <UploadCloud size={24} />
                </div>
                <p className={styles.dropzoneTitle}>
                  <span>Click to upload</span> or drag and drop PDF
                </p>
                <p className={styles.dropzoneHint}>Supports standard PDF documents (up to 25MB)</p>
              </div>
            ) : (
              <div className={styles.selectedFileCard}>
                <div className={styles.fileInfo}>
                  <div className={styles.pdfBadgeIcon}>PDF</div>
                  <div>
                    <p className={styles.fileName}>{selectedFile.name}</p>
                    <p className={styles.fileMeta}>{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className={styles.removeFileBtn}
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className={styles.actionRow}>
            {selectedFile && (
              <button type="button" onClick={handleReset} className={styles.resetBtn}>
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleConvertToAcroPdf}
              disabled={!pdfType.trim() || !selectedFile}
              className={styles.convertButton}
            >
              <Check size={16} />
              <span>Convert to Acro PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
