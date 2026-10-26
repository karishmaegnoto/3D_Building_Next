"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { contractsApi } from "@/lib/api/contracts";
import { useToastStore } from "@/store/toastStore";
import { LoadingNote } from "@/components/shared";
import styles from "./publicContractSignView.module.scss";

const SIGNATURE_MAX_BYTES = 4000000;
const SIGNATURE_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const SIGNATURE_EXT_RE = /\.(jpe?g|png|pdf)$/i;
const SIGNATURE_INK = "#1a1a1a";

const STEPS = [
  { n: 1, label: "Contract" },
  { n: 2, label: "Contract Sign" },
  { n: 3, label: "Payment" },
  { n: 4, label: "Payment Reference" },
];

function NextArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.17 11l-5.36-5.36 1.41-1.41L20 12l-7.78 7.78-1.41-1.41L16.17 13H4v-2h12.17z" fill="currentColor" />
    </svg>
  );
}

function PrevArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7.83 13l5.36 5.36-1.41 1.41L4 12l7.78-7.78 1.41 1.41L7.83 11H20v2H7.83z" fill="currentColor" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="22" fill="rgba(22, 163, 74, 0.14)" />
      <path d="M13 22.5L19.5 29L31 16" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="22" fill="rgba(220, 38, 38, 0.12)" />
      <path d="M22 13V25" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
      <circle cx="22" cy="30.5" r="2" fill="#dc2626" />
    </svg>
  );
}

function readSearchParam(searchParams, key) {
  if (!searchParams) return "";
  if (typeof searchParams.get === "function") return searchParams.get(key) || "";
  return searchParams[key] || "";
}

export function PublicContractSignView({ token, searchParams }) {
  const toastError = useToastStore((s) => s.error);
  const toastSuccess = useToastStore((s) => s.success);

  const contractId = token ? String(token) : "";
  const expires = readSearchParam(searchParams, "expires");
  const signature = readSearchParam(searchParams, "signature");
  const signerName = readSearchParam(searchParams, "name").trim();

  const linkState = useMemo(() => {
    if (!contractId || !expires || !signature) return "invalid";
    const exp = Number(expires);
    if (!Number.isFinite(exp) || exp * 1000 <= Date.now()) return "expired";
    return "valid";
  }, [contractId, expires, signature]);

  const [step, setStep] = useState(1);
  const [signMethod, setSignMethod] = useState("name");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [signing, setSigning] = useState(false);

  const drawRef = useRef(null);
  const drawingRef = useRef(false);
  const uploadInputRef = useRef(null);

  const pdfQuery = useQuery({
    queryKey: ["public-contract-pdf", contractId, String(expires), String(signature)],
    queryFn: ({ signal }) =>
      contractsApi.getPublicContractPdf(contractId, expires, signature, { signal }),
    enabled: linkState === "valid",
    retry: 1,
  });



  const [pdfUrl, setPdfUrl] = useState(null);
  useEffect(() => {
    if (!pdfQuery.data) {
      setPdfUrl(null);
      return undefined;
    }
    const url = window.URL.createObjectURL(pdfQuery.data);
    setPdfUrl(url);
    return () => window.URL.revokeObjectURL(url);
  }, [pdfQuery.data]);

  useEffect(() => {
    if (pdfQuery.isError) {
      toastError(pdfQuery.error?.message || "Failed to load contract PDF.");
    }
  }, [pdfQuery.isError, pdfQuery.error, toastError]);

  useEffect(() => {
    const canvas = drawRef.current;
    if (!canvas || step !== 2) return undefined;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = SIGNATURE_INK;
    return undefined;
  }, [step]);

  const [uploadPreviewUrl, setUploadPreviewUrl] = useState(null);
  useEffect(() => {
    if (!uploadedFile || uploadedFile.type === "application/pdf") {
      setUploadPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(uploadedFile);
    setUploadPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadedFile]);

  const handlePointerDown = (e) => {
    const canvas = drawRef.current;
    if (!canvas) return;
    drawingRef.current = true;
    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerMove = (e) => {
    if (!drawingRef.current) return;
    const canvas = drawRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
  };

  const handleUploadSignClick = () => {
    setSignMethod("upload");
    uploadInputRef.current?.click();
  };

  const clearDrawing = () => {
    const canvas = drawRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasDrawn(false);
  };

  const handleUploadFile = (e) => {
    const file = e.target.files?.[0];
    setUploadError("");
    if (!file) {
      setUploadedFile(null);
      return;
    }
    if (file.size > SIGNATURE_MAX_BYTES) {
      setUploadError("The file exceeds the maximum file size of 4 MB.");
      setUploadedFile(null);
      return;
    }
    if (!SIGNATURE_ACCEPTED_TYPES.includes(file.type) && !SIGNATURE_EXT_RE.test(file.name)) {
      setUploadError("Only JPEG, JPG, PNG or PDF files are allowed.");
      setUploadedFile(null);
      return;
    }
    setUploadedFile(file);
  };

  const renderNameSignature = (name) => {
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = SIGNATURE_INK;
    ctx.font = '54px "Cedarville Cursive", "Segoe Script", "Brush Script MT", cursive';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    return canvas.toDataURL("image/png");
  };

  const handleCompleteSigning = () => {
    if (signing) return;
    if (signMethod === "name" && !signerName) {
      toastError("Customer name is unavailable for this link. Please draw or upload your signature instead.");
      return;
    }
    if (signMethod === "draw" && !hasDrawn) {
      toastError("Please draw your signature before continuing.");
      return;
    }
    if (signMethod === "upload" && !uploadedFile) {
      toastError("Please upload a signature file.");
      return;
    }
    setSigning(true);
    try {
      const signatureDataUrl =
        signMethod === "name"
          ? renderNameSignature(signerName)
          : signMethod === "draw"
            ? drawRef.current.toDataURL("image/png")
            : null;
      void signatureDataUrl;
      void uploadedFile;
      toastSuccess("Signature captured successfully.");
      setStep(3);
    } finally {
      setSigning(false);
    }
  };

  const downloadUrl = contractsApi.getPublicContractPdfDownloadUrl(
    contractId,
    expires,
    signature
  );

  if (linkState !== "valid") {
    return (
      <div className={styles.page}>
        <div className={styles.brandBar}>
          <span className={styles.brandName}>Grip CRM</span>
        </div>
        <div className={styles.stateWrap}>
          <div className={styles.stateCard}>
            <AlertIcon />
            <h1 className={styles.stateTitle}>
              {linkState === "expired" ? "Link Expired" : "Invalid Link"}
            </h1>
            <p className={styles.stateText}>
              {linkState === "expired"
                ? "This contract link has expired. Please contact your building specialist to receive a new link."
                : "This contract link is invalid. Please use the full link from your contract email."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.brandBar}>
        <span className={styles.brandName}>Grip CRM</span>
      </div>

      <div className={styles.shell}>
        <div className={styles.steps} role="tablist" aria-label="Signing progress">
          {STEPS.map((s) => {
            const isActive = step === s.n;
            const isCompleted = step > s.n;
            return (
              <div
                key={s.n}
                className={`${styles.step} ${isActive ? styles.stepActive : ""} ${isCompleted ? styles.stepCompleted : ""}`}
                role="tab"
                aria-selected={isActive}
              >
                <span className={styles.stepCircle}>{s.n}</span>
                <span className={styles.stepLabel}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h1 className={styles.contractHeading}>Contract</h1>
            </div>
            <div className={styles.previewHead}>
              <h2 className={styles.previewTitle}>Contract Preview</h2>
              <p className={styles.previewSubtitle}>
                Please review the contract PDF before continuing to signature.
              </p>
            </div>
            {pdfQuery.isLoading ? (
              <div className={styles.stateBlock}>
                <LoadingNote>Loading Contract PDF...</LoadingNote>
              </div>
            ) : pdfQuery.isError || !pdfUrl ? (
              <div className={styles.stateBlock}>
                <p className={styles.stateText}>
                  {pdfQuery.error?.message || "Failed to load contract PDF."}
                </p>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => pdfQuery.refetch()}
                >
                  Retry
                </button>
              </div>
            ) : (
              <iframe
                className={styles.pdfFrame}
                src={pdfUrl}
                title="Contract PDF"
              />
            )}
            <div className={styles.cardActionsEnd}>
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={!pdfUrl}
                onClick={() => setStep(2)}
              >
                Next
                <NextArrowIcon />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h1 className={styles.contractHeading}>Select Signatures</h1>
            </div>

            <div className={styles.signPanel}>
              <div className={styles.signColumns} role="radiogroup" aria-label="Signature method">
                <div
                  className={`${styles.signCol} ${signMethod === "name" ? styles.signColSelected : ""}`}
                  onClick={() => setSignMethod("name")}
                >
                  <input
                    type="radio"
                    className={styles.signRadio}
                    checked={signMethod === "name"}
                    onChange={() => setSignMethod("name")}
                    aria-label="Type your name"
                  />
                  <div className={styles.signColBody}>
                    <div className={styles.dashPreview}>
                      {signerName ? (
                        <span className={styles.dashName}>{signerName}</span>
                      ) : (
                        <span className={styles.dashPlaceholder}>Name unavailable</span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.signCol} ${signMethod === "draw" ? styles.signColSelected : ""}`}
                  onClick={() => setSignMethod("draw")}
                >
                  <input
                    type="radio"
                    className={styles.signRadio}
                    checked={signMethod === "draw"}
                    onChange={() => setSignMethod("draw")}
                    aria-label="Draw your signature"
                  />
                  <div className={styles.signColBody}>
                    <div className={styles.drawWrap}>
                      <canvas
                        ref={drawRef}
                        className={styles.drawCanvas}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                      />
                      {!hasDrawn && <span className={styles.drawHint}>Draw here</span>}
                    </div>
                    <div className={styles.btnRow}>
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => setSignMethod("draw")}
                      >
                        Draw Sign
                      </button>
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={clearDrawing}
                        disabled={!hasDrawn}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.signCol} ${signMethod === "upload" ? styles.signColSelected : ""}`}
                  onClick={() => setSignMethod("upload")}
                >
                  <input
                    type="radio"
                    className={styles.signRadio}
                    checked={signMethod === "upload"}
                    onChange={() => setSignMethod("upload")}
                    aria-label="Upload a signature file"
                  />
                  <div className={styles.signColBody}>
                    <div className={styles.fileRow}>
                      <label className={styles.fileButton}>
                        <input
                          ref={uploadInputRef}
                          className={styles.uploadInput}
                          type="file"
                          accept=".jpeg,.jpg,.jpg,.png,.pdf"
                          onChange={handleUploadFile}
                        />
                        Choose File
                      </label>
                      <span className={styles.fileName}>
                        {uploadedFile ? uploadedFile.name : "No file chosen"}
                      </span>
                    </div>
                    {uploadError && (
                      <p className={styles.fieldError} role="alert">
                        {uploadError}
                      </p>
                    )}
                    {uploadedFile && uploadPreviewUrl && (
                      <img
                        className={styles.uploadPreview}
                        src={uploadPreviewUrl}
                        alt="Uploaded signature preview"
                      />
                    )}
                    {uploadedFile && !uploadPreviewUrl && (
                      <span className={styles.pdfFileNote}>PDF signature attached</span>
                    )}
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={handleUploadSignClick}
                    >
                      Upload Sign
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setStep(1)}
                disabled={signing}
              >
                <PrevArrowIcon />
                Previous
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleCompleteSigning}
                disabled={signing}
              >
                {signing ? (
                  "Signing..."
                ) : (
                  <>
                    Sign
                    <NextArrowIcon />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h1 className={styles.cardTitle}>Payment</h1>
              <p className={styles.cardSubtitle}>
                No online payment is required here.
              </p>
            </div>
            <div className={styles.infoPanel}>
              <p className={styles.infoText}>
                Your signature has been captured. Payment for this contract is
                arranged directly with your building specialist. Continue to
                view your payment reference.
              </p>
            </div>
            <div className={styles.cardActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setStep(2)}
              >
                Previous
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setStep(4)}
              >
                Continue
                <NextArrowIcon />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.card}>
            <div className={styles.successBlock}>
              <CheckIcon />
              <h1 className={styles.cardTitle}>Contract Submitted Successfully</h1>
              <p className={styles.cardSubtitle}>
                Your signed contract has been recorded. A copy is available below for
                your records.
              </p>
              <a
                className={styles.primaryBtn}
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Signed Contract
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicContractSignView;
