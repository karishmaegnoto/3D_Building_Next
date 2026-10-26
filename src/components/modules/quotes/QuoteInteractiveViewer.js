"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { pdfjsLib } from "@/components/modules/pdfEditor/utils/pdfSetup";
import { annotationRectToPdfRect } from "@/components/modules/pdfEditor/utils/pdfCoordinates";
import { formatDateDisplay, parseToIsoDate, isoToDisplayDate } from "@/components/modules/pdfEditor/utils/fieldUtils";
import { isSupportedImageFile, isValidImageDataUrl } from "@/lib/pdf/imageData";
import { useToastStore } from "@/store/toastStore";
import styles from "./quoteViewer.module.scss";

export const QuoteInteractiveViewer = forwardRef(function QuoteInteractiveViewer(
  { pdfBlob, onValuesChange, initialFields = {}, initialScale = 1.15 },
  ref
) {
  const containerRef = useRef(null);
  const [pagesData, setPagesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(initialScale);

  const initialValuesRef = useRef({});
  const [formValues, setFormValues] = useState({});

  useImperativeHandle(ref, () => ({
    getQuoteData: () => {
      const initial = initialValuesRef.current || {};
      const current = formValues || {};

      const changedValues = {};
      const allValues = {};
      const combined = {};

      const allFieldKeys = Array.from(
        new Set([...Object.keys(initial), ...Object.keys(current)])
      );

      allFieldKeys.forEach((k) => {
        let val = current[k] !== undefined ? current[k] : (initial[k] ?? "");

        const isImage =
          k.toLowerCase().startsWith("image") ||
          k.toLowerCase().includes("image") ||
          k.toLowerCase().includes("photo") ||
          k.toLowerCase().includes("logo");

        if (isImage) {
          if (val === "__DELETE__") {
            val = "";
          } else if ((val === "" || val === undefined || val === null) && initial[k] && typeof initial[k] === "string" && initial[k].startsWith("data:image/")) {
            // Keep existing image if not explicitly removed
            val = initial[k];
          }
        }

        allValues[k] = val ?? "";
        combined[k] = val ?? "";

        const valStr = val !== null && val !== undefined ? String(val).trim() : "";
        const initStr =
          initial[k] !== null && initial[k] !== undefined ? String(initial[k]).trim() : "";

        if (valStr !== initStr) {
          changedValues[k] = val;
        }
      });

      return {
        changedValues,
        allValues,
        combined,
      };
    },
    getCurrentValues: () => formValues,
    getInitialValues: () => initialValuesRef.current,
  }));

  const handleFieldChange = (name, value) => {
    setFormValues((prev) => {
      const updated = { ...prev, [name]: value };
      if (onValuesChange) {
        onValuesChange(updated);
      }
      return updated;
    });
  };

  useEffect(() => {
    if (initialFields && typeof initialFields === "object" && Object.keys(initialFields).length > 0) {
      initialValuesRef.current = {
        ...(initialValuesRef.current || {}),
        ...initialFields,
      };
      setFormValues((prev) => {
        const next = { ...prev };
        Object.entries(initialFields).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") {
            if (next[k] === undefined || next[k] === "") {
              next[k] = v;
            }
          }
        });
        return next;
      });
    }
  }, [initialFields]);


  useEffect(() => {
    if (!pdfBlob) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const bufferCopy = arrayBuffer.slice(0);

        const loadingTask = pdfjsLib.getDocument({
          data: bufferCopy,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        const totalPages = doc.numPages;

        const pages = [];
        const extractedInitial = {};

        for (let p = 1; p <= totalPages; p++) {
          const page = await doc.getPage(p);
          const viewport = page.getViewport({ scale: 1.0 });
          const pageHeight = viewport.height;
          const pageWidth = viewport.width;

          const annotations = await page.getAnnotations({ intent: "display" });
          const fields = [];

          for (const annot of annotations) {
            const isWidget =
              annot.subtype === "Widget" ||
              annot.type === "Widget" ||
              Boolean(annot.fieldType);

            if (!isWidget || !annot.rect || annot.rect.length < 4) continue;

            const rect = annotationRectToPdfRect(annot.rect, pageHeight);
            const name = annot.fieldName || `field_${annot.id || Date.now()}`;
            const rawVal = annot.fieldValue ?? "";

            let type = "text";
            let checked = false;

            const isImage =
              annot.alternativeText === "image" ||
              (annot.alternativeText && annot.alternativeText.toLowerCase().includes("image")) ||
              name.toLowerCase().startsWith("image") ||
              name.toLowerCase().includes("image") ||
              name.toLowerCase().includes("photo") ||
              name.toLowerCase().includes("logo") ||
              (annot.fieldType === "Btn" && !annot.radioButton && !annot.checkBox && !annot.buttonValue);

            const isDate =
              (annot.alternativeText && annot.alternativeText.toLowerCase().includes("date")) ||
              name.toLowerCase().startsWith("date") ||
              name.toLowerCase().includes("date") ||
              name.toLowerCase().includes("dob");

            if (isImage) {
              type = "image";
            } else if (annot.fieldType === "Tx") {
              if (isDate) {
                type = "date";
              } else {
                type = annot.multiline ? "textarea" : "text";
              }
            } else if (annot.fieldType === "Btn") {
              const isRadio = Boolean(annot.radioButton || (annot.fieldFlags && annot.fieldFlags & 32768));
              if (isRadio) {
                type = "radio";
                checked = Boolean(annot.fieldValue === annot.buttonValue);
              } else {
                type = "checkbox";
                checked = Boolean(
                  annot.fieldValue === "Yes" ||
                  annot.fieldValue === true ||
                  annot.fieldValue === "1" ||
                  annot.exportValue === annot.fieldValue
                );
              }
            } else if (annot.fieldType === "Ch") {
              type = "select";
            }

            extractedInitial[name] = type === "checkbox" || type === "radio" ? checked : rawVal;

            fields.push({
              id: annot.id || name,
              name,
              type,
              value: rawVal,
              checked,
              options: annot.options || [],
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              readOnly: Boolean(annot.readOnly),
            });
          }

          pages.push({
            pageNumber: p,
            page,
            pageWidth,
            pageHeight,
            fields,
          });
        }

        if (isMounted) {
          const merged = { ...extractedInitial, ...(initialFields || {}) };
          initialValuesRef.current = merged;
          setFormValues((prev) => ({ ...merged, ...prev }));
          setPagesData(pages);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load PDF in interactive viewer:", err);
        if (isMounted) {
          setError(err?.message || "Failed to render interactive PDF form.");
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [pdfBlob]);

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <span className={styles.loadingText}>Loading interactive Quote PDF...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorBox}>
        {error}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.pagesContainer}>
      {pagesData.map((p) => (
        <InteractivePdfPage
          key={p.pageNumber}
          pageData={p}
          scale={scale}
          formValues={formValues}
          onFieldChange={handleFieldChange}
        />
      ))}
    </div>
  );
});

function InteractiveDropdownField({ field, value, onChange, scale, baseStyle }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const options = Array.isArray(field.options) ? field.options : [];
  const height = field.height * scale;
  const fontSize = Math.max(8, Math.min(10.5, Math.round(height * 0.52)));

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  let selectedDisplay = value;
  if (value) {
    const matched = options.find((opt) => {
      const optVal = typeof opt === "string" ? opt : opt.exportValue || opt.displayValue;
      return optVal === value;
    });
    if (matched) {
      selectedDisplay = typeof matched === "string" ? matched : matched.displayValue || matched.exportValue;
    }
  }

  const defaultLabel = selectedDisplay || field.placeholder || "Choose Option";

  return (
    <div
      ref={containerRef}
      style={{
        ...baseStyle,
        backgroundColor: "#ffffff",
        border: "1px solid #71717a",
        borderRadius: "0px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 0,
        cursor: "pointer",
        userSelect: "none",
        zIndex: isOpen ? 9999 : 3,
        boxShadow: isOpen ? "0 0 0 1px #0284c7" : "none",
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* Selected Label */}
      <span
        style={{
          flex: 1,
          minWidth: 0,
          padding: "0 4px",
          fontSize: `${fontSize}px`,
          color: value ? "#000000" : "#52525b",
          fontFamily: "Helvetica, Arial, sans-serif",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        {defaultLabel}
      </span>

      {/* Classic Square Button with Down Triangle (▼) */}
      <div
        style={{
          width: `${Math.max(14, Math.min(18, height))}px`,
          height: "100%",
          backgroundColor: "#e4e4e7",
          borderLeft: "1px solid #71717a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "3.5px solid transparent",
            borderRight: "3.5px solid transparent",
            borderTop: "4.5px solid #000000",
          }}
        />
      </div>

      {/* Dropdown Options Popup (Exact AcroForm look from screenshot) */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "-1px",
            minWidth: "calc(100% + 2px)",
            width: "max-content",
            maxWidth: "320px",
            maxHeight: "185px",
            overflowY: "auto",
            backgroundColor: "#ffffff",
            border: "1px solid #000000",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
            zIndex: 10000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt, i) => {
            const optVal = typeof opt === "string" ? opt : opt.exportValue || opt.displayValue;
            const optLabel = typeof opt === "string" ? opt : opt.displayValue || opt.exportValue;
            const isSelected = value === optVal;

            return (
              <div
                key={i}
                style={{
                  padding: "2px 6px",
                  fontSize: `${Math.max(9.5, Math.min(11, fontSize))}px`,
                  color: "#000000",
                  backgroundColor: isSelected ? "#8ab8e6" : "#ffffff",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "Helvetica, Arial, sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8ab8e6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isSelected ? "#8ab8e6" : "#ffffff";
                }}
                onClick={() => {
                  onChange(field.name, optVal);
                  setIsOpen(false);
                }}
              >
                {optLabel}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InteractiveDateField({ field, value, onChange, scale, baseStyle }) {
  const inputRef = useRef(null);
  const height = field.height * scale;
  const fontSize = Math.max(8, Math.min(10.5, Math.round(height * 0.52)));
  const buttonWidth = Math.max(14, Math.min(18, height));
  const iconSize = Math.max(10, Math.min(13, height * 0.62));

  const dateFormat = field.dateFormat || "DD/MM/YYYY";
  const displayVal = value ? formatDateDisplay(value, dateFormat) : "";
  const isoVal = parseToIsoDate(value);
  const placeholder = field.placeholder || dateFormat;

  const triggerPicker = () => {
    if (inputRef.current) {
      try {
        inputRef.current.showPicker?.();
      } catch (e) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div
      style={{
        ...baseStyle,
        backgroundColor: "#ffffff",
        border: "1px solid #71717a",
        borderRadius: "0px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 0,
        cursor: "pointer",
        userSelect: "none",
        zIndex: 3,
        overflow: "hidden",
      }}
      onClick={triggerPicker}
    >
      {/* Selected Date Text / Placeholder in DD/MM/YYYY */}
      <span
        style={{
          flex: 1,
          minWidth: 0,
          padding: "0 4px",
          fontSize: `${fontSize}px`,
          color: displayVal ? "#000000" : "#94a3b8",
          fontFamily: "Helvetica, Arial, sans-serif",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        {displayVal || placeholder}
      </span>

      {/* Calendar Button with SVG icon */}
      <div
        style={{
          width: `${buttonWidth}px`,
          height: "100%",
          backgroundColor: "#f1f5f9",
          borderLeft: "1px solid #71717a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#334155",
          pointerEvents: "none",
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      </div>

      {/* Native invisible input for opening browser date picker */}
      <input
        ref={inputRef}
        type="date"
        value={isoVal}
        disabled={field.readOnly}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: field.readOnly ? "default" : "pointer",
          zIndex: 4,
          border: "none",
          outline: "none",
          margin: 0,
          padding: 0,
        }}
        onChange={(e) => {
          const formatted = isoToDisplayDate(e.target.value, dateFormat);
          onChange(field.name, formatted);
        }}
        onClick={(e) => {
          try {
            e.target.showPicker?.();
          } catch (err) { }
        }}
      />
    </div>
  );
}

function InteractivePdfPage({ pageData, scale, formValues, onFieldChange }) {
  const canvasRef = useRef(null);

  const { page, pageWidth, pageHeight, fields } = pageData;

  useEffect(() => {
    if (!page || !canvasRef.current) return;

    let renderTask = null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });

    const viewport = page.getViewport({ scale });
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

    renderTask = page.render({
      canvasContext: ctx,
      viewport,
      transform: transform || undefined,
      intent: "display",
      annotationMode: 0, // Don't burn AcroForms into canvas so our HTML inputs overlay cleanly!
    });

    return () => {
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch { }
      }
    };
  }, [page, scale]);

  const screenWidth = Math.floor(pageWidth * scale);
  const screenHeight = Math.floor(pageHeight * scale);

  return (
    <div
      style={{
        position: "relative",
        width: `${screenWidth}px`,
        height: `${screenHeight}px`,
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0,0,0,0.06)",
        borderRadius: "2px",
        overflow: "hidden",
      }}
    >
      {/* PDF Canvas */}
      <canvas ref={canvasRef} className={styles.pdfCanvas} />

      {/* Interactive Form Fields Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${screenWidth}px`,
          height: `${screenHeight}px`,
          zIndex: 2,
          pointerEvents: "auto",
        }}
      >
        {fields.map((f) => {
          const val = formValues[f.name] !== undefined ? formValues[f.name] : f.value || "";
          const left = f.x * scale;
          const top = f.y * scale;
          const width = f.width * scale;
          const height = f.height * scale;
          const fontSize = Math.max(9, Math.round(f.height * scale * 0.65));

          const baseStyle = {
            position: "absolute",
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: "rgba(224, 238, 255, 0.45)", // subtle light-blue tint matching AcroForm in screenshot
            border: "1px solid rgba(147, 197, 253, 0.7)",
            borderRadius: "2px",
            boxSizing: "border-box",
            outline: "none",
            color: "#0f172a",
            fontFamily: "Helvetica, Arial, sans-serif",
            transition: "background-color 0.12s ease, border-color 0.12s ease",
          };

          if (f.type === "checkbox") {
            const isChecked = Boolean(formValues[f.name] !== undefined ? formValues[f.name] : f.checked);
            return (
              <input
                key={f.id}
                type="checkbox"
                name={f.name}
                checked={isChecked}
                onChange={(e) => onFieldChange(f.name, e.target.checked)}
                style={{
                  ...baseStyle,
                  cursor: "pointer",
                  accentColor: "#0284c7",
                }}
              />
            );
          }

          if (f.type === "textarea") {
            return (
              <textarea
                key={f.id}
                name={f.name}
                value={val}
                onChange={(e) => onFieldChange(f.name, e.target.value)}
                style={{
                  ...baseStyle,
                  fontSize: `${fontSize}px`,
                  padding: "2px 4px",
                  resize: "none",
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
                  e.target.style.borderColor = "#0284c7";
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = "rgba(224, 238, 255, 0.45)";
                  e.target.style.borderColor = "rgba(147, 197, 253, 0.7)";
                }}
              />
            );
          }

          if (f.type === "image") {
            const currentImg = formValues[f.name] !== undefined ? formValues[f.name] : (f.value || "");
            const hasImg = Boolean(currentImg && currentImg !== "__DELETE__");

            return (
              <div
                key={f.id}
                id={`quote-image-field-${f.id}`}
                style={{
                  ...baseStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: hasImg ? "#ffffff" : "rgba(238, 242, 255, 0.75)",
                  border: hasImg ? "1.5px solid #0284c7" : "2px dashed #0284c7",
                  overflow: "hidden",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.15s ease",
                }}
                onClick={() => {
                  const input = document.getElementById(`file-input-${f.id}`);
                  if (input) input.click();
                }}
                title={hasImg ? "Click to change image" : "Click to upload image"}
              >
                <input
                  id={`file-input-${f.id}`}
                  type="file"
                  accept="image/*"
                  className={styles.fileHidden}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!isSupportedImageFile(file)) {
                        useToastStore.getState().error("Please upload a PNG or JPEG image under 5MB.");
                        e.target.value = "";
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const dataUrl = ev.target?.result;
                        if (typeof dataUrl === "string" && isValidImageDataUrl(dataUrl)) {
                          onFieldChange(f.name, dataUrl);
                        } else {
                          useToastStore.getState().error("That image could not be read. Please try a PNG or JPEG.");
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                    e.target.value = "";
                  }}
                />

                {hasImg ? (
                  <div className={styles.imgWrap}>
                    <img
                      src={currentImg}
                      alt={f.name || "Quote Image"}
                      className={styles.imgCover}
                    />
                    <div
                      className={styles.imgActions}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const input = document.getElementById(`file-input-${f.id}`);
                          if (input) input.click();
                        }}
                        className={styles.imgBtn}
                        title="Change image"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldChange(f.name, "__DELETE__");
                        }}
                        className={`${styles.imgBtn} ${styles.imgBtnDanger}`}
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadHint}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span
                      style={{
                        fontSize: `${Math.max(9, Math.min(12, Math.round(fontSize * 0.85)))}px`,
                        fontWeight: 600,
                        lineHeight: 1.1,
                      }}
                    >
                      {f.name && !/^field_/i.test(f.name) ? f.name.replace(/_/g, " ") : "Image"}
                    </span>
                    <span className={styles.uploadSub}>Click to upload</span>
                  </div>
                )}
              </div>
            );
          }

          if (f.type === "select" || f.type === "dropdown") {
            return (
              <InteractiveDropdownField
                key={f.id}
                field={f}
                value={val}
                onChange={onFieldChange}
                scale={scale}
                baseStyle={baseStyle}
              />
            );
          }

          if (f.type === "date" || (f.type !== "textarea" && f.type !== "checkbox" && f.type !== "radio" && f.type !== "image" && /date|dob/i.test(f.name))) {
            return (
              <InteractiveDateField
                key={f.id}
                field={f}
                value={val}
                onChange={onFieldChange}
                scale={scale}
                baseStyle={baseStyle}
              />
            );
          }

          // Default text input
          return (
            <input
              key={f.id}
              type="text"
              name={f.name}
              value={val}
              onChange={(e) => onFieldChange(f.name, e.target.value)}
              style={{
                ...baseStyle,
                fontSize: `${fontSize}px`,
                padding: "0 4px",
                lineHeight: `${height}px`,
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
                e.target.style.borderColor = "#0284c7";
                e.target.style.boxShadow = "0 0 0 1.5px rgba(2, 132, 199, 0.35)";
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = "rgba(224, 238, 255, 0.45)";
                e.target.style.borderColor = "rgba(147, 197, 253, 0.7)";
                e.target.style.boxShadow = "none";
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default QuoteInteractiveViewer;
