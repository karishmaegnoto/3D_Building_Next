"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { manufacturersApi } from "@/lib/api/manufacturers";
import { useToastStore } from "@/store/toastStore";
import Loader from "@/components/shared/Loader";
import styles from "./manufacturerEdit.module.scss";

const PDFEditor = dynamic(() => import("@/components/modules/pdfEditor"), {
  ssr: false,
  loading: () => (
    <div className={styles.stateBox}>
      <div className={styles.spinner} />
      <span>Loading Contract AcroForm PDF Editor...</span>
    </div>
  ),
});

const createEmptyDraft = () => ({
  id: `draft_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
  name: "",
  file: null,
  pdfBlob: null,
  fields: [],
  fieldMappings: {},
  isConfigured: false,
});

const fetchManufacturerById = async (id, signal) => {
  const list = await manufacturersApi.getManufacturers(
    { isActive: true },
    signal ? { signal } : {}
  );
  const rows = Array.isArray(list) ? list : [];
  return rows.find((m) => String(m?.id) === String(id)) || null;
};

const fileBaseName = (fileUrl) => {
  if (!fileUrl) return "";
  const parts = String(fileUrl).split("/");
  return parts[parts.length - 1] || String(fileUrl);
};

export function ManufacturerEdit() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const toastSuccess = useToastStore((s) => s.success);
  const toastError = useToastStore((s) => s.error);
  const id = params?.id ? String(params.id) : "";

  const [basics, setBasics] = useState(null);
  const [removedTemplateIds, setRemovedTemplateIds] = useState([]);
  const [drafts, setDrafts] = useState([createEmptyDraft()]);
  const [additionalName, setAdditionalName] = useState("");
  const [additionalFile, setAdditionalFile] = useState(null);
  const [vssName, setVssName] = useState("");
  const [vssFile, setVssFile] = useState(null);
  const [vssEnabled, setVssEnabled] = useState(false);
  const [activeDraftIndex, setActiveDraftIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const draftFileInputRefs = useRef([]);
  const additionalFileInputRef = useRef(null);
  const vssFileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (type === "error") toastError(message);
    else toastSuccess(message);
  };

  const detailQuery = useQuery({
    queryKey: ["manufacturers", "detail", id],
    queryFn: ({ signal }) => fetchManufacturerById(id, signal),
    enabled: Boolean(id),
    staleTime: 60_000,
    // Instant paint when coming from the list: reuse its cached rows,
    // then revalidate in the background.
    initialData: () => {
      const cached = queryClient.getQueriesData({ queryKey: ["manufacturers", "list"] });
      for (const [, rows] of cached) {
        const found = Array.isArray(rows)
          ? rows.find((m) => String(m?.id) === String(id))
          : null;
        if (found) return found;
      }
      return undefined;
    },
  });
  const manufacturer = detailQuery.data || null;

  const existingTemplates = useMemo(() => {
    const rows = Array.isArray(manufacturer?.templates) ? manufacturer.templates : [];
    return rows.filter((t) => t && (t._id || t.id) && t.isActive !== false);
  }, [manufacturer]);

  const updateBasic = (field, value) => {
    setBasics((prev) => {
      const base = prev || {
        name: manufacturer?.name || "",
        fullName: manufacturer?.fullName || "",
        phone: manufacturer?.phone || "",
        addressLine1: manufacturer?.addressLine1 || "",
        addressLine2: manufacturer?.addressLine2 || "",
      };
      return { ...base, [field]: value };
    });
    if (errorMessage) setErrorMessage("");
  };
  const basicValue = (field, fallback) =>
    basics?.[field] ?? manufacturer?.[fallback] ?? "";

  const toggleRemoveTemplate = (templateId) => {
    setRemovedTemplateIds((prev) =>
      prev.includes(templateId)
        ? prev.filter((v) => v !== templateId)
        : [...prev, templateId]
    );
  };

  const quoteMappingsQuery = useQuery({
    queryKey: ["quote-template-mappings"],
    queryFn: async () => {
      const res = await manufacturersApi.getQuoteTemplateMappings();
      if (Array.isArray(res)) return res;
      return res?.results || res?.data?.results || [];
    },
    staleTime: 5 * 60_000,
  });
  const quoteFieldMappings = useMemo(() => {
    const results = Array.isArray(quoteMappingsQuery.data) ? quoteMappingsQuery.data : [];
    const allKeys = [];
    const seen = new Set();
    results.forEach((item) => {
      const arr = Array.isArray(item?.fieldMappings)
        ? item.fieldMappings
        : item?.fieldMappings && typeof item.fieldMappings === "object"
          ? Object.keys(item.fieldMappings)
          : [];
      arr.forEach((k) => {
        if (k && typeof k === "string" && k.trim() && !seen.has(k.trim())) {
          seen.add(k.trim());
          allKeys.push(k.trim());
        }
      });
    });
    return allKeys;
  }, [quoteMappingsQuery.data]);

  const handleDraftFile = (index, file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please upload a valid PDF document (.pdf)", "error");
      return;
    }
    setDrafts((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        file,
        pdfBlob: null,
        fields: [],
        fieldMappings: {},
        isConfigured: false,
      };
      return copy;
    });
  };

  const pickPdf = (file) => {
    if (!file) return true;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please upload a valid PDF document (.pdf)", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!basicValue("name", "name").trim()) {
      setErrorMessage("Please enter Manufacturer Name.");
      return;
    }
    if (!basicValue("fullName", "fullName").trim()) {
      setErrorMessage("Please enter Full Name.");
      return;
    }
    if (!basicValue("phone", "phone").trim()) {
      setErrorMessage("Please enter Phone number.");
      return;
    }
    if (!basicValue("addressLine1", "addressLine1").trim()) {
      setErrorMessage("Please enter Address Line 1.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("manufacturerId", id);
      formData.append("name", basicValue("name", "name").trim());
      formData.append("full_name", basicValue("fullName", "fullName").trim());
      formData.append("phone_no", basicValue("phone", "phone").trim());
      formData.append("address_line_1", basicValue("addressLine1", "addressLine1").trim());
      formData.append("address_line_2", basicValue("addressLine2", "addressLine2").trim());

      const contractsMeta = [];
      removedTemplateIds.forEach((templateId) => {
        contractsMeta.push({ contract_id: templateId, isActive: false });
      });
      drafts
        .filter((d) => d.file)
        .forEach((draft, idx) => {
          const fileKey = `contract_new_${idx}`;
          const fileToUpload = draft.pdfBlob
            ? new File([draft.pdfBlob], draft.file?.name || `contract_${idx + 1}.pdf`, {
                type: "application/pdf",
              })
            : draft.file;
          contractsMeta.push({
            name: draft.name.trim() || `Contract Template ${idx + 1}`,
            fileKey,
            fieldMappings: draft.fieldMappings || {},
          });
          formData.append(fileKey, fileToUpload);
        });
      formData.append("contracts", JSON.stringify(contractsMeta));

      if (additionalFile) {
        formData.append("additionalDocumentName", additionalName.trim() || additionalFile.name);
        formData.append("additionalDocumentPdf", additionalFile);
      }
      if (vssFile) {
        formData.append("document_name", vssName.trim() || vssFile.name);
        formData.append("document_pdf", vssFile);
        formData.append("document_enabled", vssEnabled ? "1" : "0");
      }

      await manufacturersApi.updateManufacturer(formData);
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
      showToast("Manufacturer updated successfully!", "success");
      router.push("/manufacturer/manufacturer-list");
    } catch (err) {
      setErrorMessage(err?.message || "Failed to update manufacturer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (detailQuery.isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <Loader />
        </div>
      </div>
    );
  }

  if (detailQuery.isError || !manufacturer) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{detailQuery.error?.message || "Manufacturer not found."}</span>
          </div>
          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => router.push("/manufacturer/manufacturer-list")}
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeDraftIndex !== null) {
    const draft = drafts[activeDraftIndex];
    return (
      <PDFEditor
        initialFile={draft.file}
        initialFields={draft.fields}
        initialMappings={draft.fieldMappings}
        initialPdfType={draft.name || "Contract Template"}
        title={`Edit AcroForm: ${draft.name || "Contract PDF"}`}
        isManufacturer={true}
        mappingType="manufacturer"
        quoteFieldMappings={quoteFieldMappings}
        onBack={() => setActiveDraftIndex(null)}
        customSave={async ({ blob, pdfBytes, fields, fieldMappings, cleanMappings, fileName }) => {
          setDrafts((prev) => {
            const updated = [...prev];
            const baseFile = updated[activeDraftIndex].file;
            updated[activeDraftIndex] = {
              ...updated[activeDraftIndex],
              file: new File([blob], fileName || baseFile?.name || "contract.pdf", {
                type: "application/pdf",
              }),
              pdfBlob: blob,
              pdfBytes,
              fields: fields || [],
              fieldMappings: cleanMappings || fieldMappings || {},
              isConfigured: true,
            };
            return updated;
          });
          showToast(`AcroForm configured for ${draft.name || "Contract"}!`);
          setActiveDraftIndex(null);
          return { success: true };
        }}
        onSave={() => {
          setActiveDraftIndex(null);
        }}
      />
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <section className={styles.section}>
            <div className={styles.sectionDash} />
            <h2 className={styles.sectionTitle}>Edit Manufacturer</h2>

            <div className={styles.gridThreeCol}>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Name *"
                value={basicValue("name", "name")}
                onChange={(e) => updateBasic("name", e.target.value)}
                required
              />
              <input
                type="text"
                className={styles.inputField}
                placeholder="Full Name *"
                value={basicValue("fullName", "fullName")}
                onChange={(e) => updateBasic("fullName", e.target.value)}
                required
              />
              <input
                type="text"
                className={styles.inputField}
                placeholder="Enter Phone number *"
                value={basicValue("phone", "phone")}
                onChange={(e) => updateBasic("phone", e.target.value)}
                required
              />
            </div>

            <div className={styles.singleCol}>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Address Line 1 *"
                value={basicValue("addressLine1", "addressLine1")}
                onChange={(e) => updateBasic("addressLine1", e.target.value)}
                required
              />
            </div>

            <div className={styles.singleCol}>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Address Line 2"
                value={basicValue("addressLine2", "addressLine2")}
                onChange={(e) => updateBasic("addressLine2", e.target.value)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionDash} />
            <h2 className={styles.sectionTitle}>Contract PDF Templates</h2>

            {existingTemplates.length > 0 &&
              existingTemplates.map((t) => {
                const templateId = String(t._id || t.id);
                const willRemove = removedTemplateIds.includes(templateId);
                return (
                  <div
                    key={templateId}
                    className={`${styles.existingRow} ${willRemove ? styles.willRemove : ""}`}
                  >
                    <div className={styles.existingInfo}>
                      <span className={styles.existingName}>
                        {t.name || "Contract Template"}
                      </span>
                      <span className={styles.existingFileTitle} title={t.fileUrl || ""}>
                        ({fileBaseName(t.fileUrl)})
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.removeRowBtn}
                      title={willRemove ? "Undo remove" : "Remove template"}
                      onClick={() => toggleRemoveTemplate(templateId)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}

            {drafts.map((draft, index) => (
              <div key={draft.id} className={styles.contractRow}>
                <div className={styles.contractRowFields}>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="Contract Name"
                    value={draft.name}
                    onChange={(e) =>
                      setDrafts((prev) => {
                        const copy = [...prev];
                        copy[index] = { ...copy[index], name: e.target.value };
                        return copy;
                      })
                    }
                  />
                  <fieldset className={styles.fileFieldset}>
                    <legend className={styles.fileLegend}>Upload Contract PDF</legend>
                    <div className={styles.fileContentWrapper}>
                      <input
                        ref={(el) => (draftFileInputRefs.current[index] = el)}
                        type="file"
                        accept=".pdf,application/pdf"
                        className={styles.hiddenFileInput}
                        onChange={(e) => handleDraftFile(index, e.target.files?.[0])}
                      />
                      {!draft.file ? (
                        <>
                          <button
                            type="button"
                            className={styles.chooseFileButton}
                            onClick={() => draftFileInputRefs.current[index]?.click()}
                          >
                            Choose File
                          </button>
                          <span className={styles.noFileChosenText}>No file chosen</span>
                        </>
                      ) : (
                        <div className={styles.uploadedFileInfo}>
                          <span className={styles.pdfTag}>PDF</span>
                          <span className={styles.uploadedFileName} title={draft.file.name}>
                            {draft.file.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </fieldset>
                </div>

                {draft.file && (
                  <div className={styles.contractActions}>
                    {draft.isConfigured ? (
                      <>
                        <span className={styles.configuredBadge}>
                          <CheckCircle2 size={13} />
                          AcroForm Configured ({draft.fields?.length || 0} fields)
                        </span>
                        <button
                          type="button"
                          className={styles.editAcroFormBtn}
                          onClick={() => setActiveDraftIndex(index)}
                        >
                          <Edit3 size={13} />
                          Edit AcroForm
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={styles.unconfiguredBadge}>
                          <AlertCircle size={13} />
                          Not Configured
                        </span>
                        <button
                          type="button"
                          className={styles.makeEditableBtn}
                          onClick={() => setActiveDraftIndex(index)}
                        >
                          <Sparkles size={13} />
                          Make Editable (AcroForm)
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className={styles.removeRowBtn}
                      title="Remove row"
                      onClick={() => {
                        if (drafts.length === 1) {
                          setDrafts([createEmptyDraft()]);
                          if (draftFileInputRefs.current[0]) {
                            draftFileInputRefs.current[0].value = "";
                          }
                          return;
                        }
                        setDrafts((prev) => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              className={styles.addMoreButton}
              onClick={() => setDrafts((prev) => [...prev, createEmptyDraft()])}
            >
              <Plus size={14} />
              Add More Contract
            </button>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionDash} />
            <h2 className={styles.sectionTitle}>Additional Manufacturer Documents</h2>

            <div className={styles.gridTwoCol}>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Additional Manufacturer Document Name"
                value={additionalName}
                onChange={(e) => setAdditionalName(e.target.value)}
              />
              <fieldset className={styles.fileFieldset}>
                <legend className={styles.fileLegend}>
                  Upload Additional Manufacturer Document
                </legend>
                <div className={styles.fileContentWrapper}>
                  <input
                    ref={additionalFileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className={styles.hiddenFileInput}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && !pickPdf(file)) {
                        e.target.value = "";
                        return;
                      }
                      setAdditionalFile(file);
                    }}
                  />
                  {!additionalFile ? (
                    <>
                      <button
                        type="button"
                        className={styles.chooseFileButton}
                        onClick={() => additionalFileInputRef.current?.click()}
                      >
                        Choose File
                      </button>
                      <span className={styles.noFileChosenText}>No file chosen</span>
                    </>
                  ) : (
                    <div className={styles.uploadedFileInfo}>
                      <span className={styles.pdfTag}>PDF</span>
                      <span
                        className={styles.uploadedFileName}
                        title={additionalFile.name}
                      >
                        {additionalFile.name}
                      </span>
                    </div>
                  )}
                </div>
              </fieldset>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionDash} />
            <h2 className={styles.sectionTitle}>VSS Upload Document</h2>

            <div className={styles.gridTwoCol}>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Document Name"
                value={vssName}
                onChange={(e) => setVssName(e.target.value)}
              />
              <fieldset className={styles.fileFieldset}>
                <legend className={styles.fileLegend}>Upload VSS Document</legend>
                <div className={styles.fileContentWrapper}>
                  <input
                    ref={vssFileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className={styles.hiddenFileInput}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && !pickPdf(file)) {
                        e.target.value = "";
                        return;
                      }
                      setVssFile(file);
                    }}
                  />
                  {!vssFile ? (
                    <>
                      <button
                        type="button"
                        className={styles.chooseFileButton}
                        onClick={() => vssFileInputRef.current?.click()}
                      >
                        Choose File
                      </button>
                      <span className={styles.noFileChosenText}>No file chosen</span>
                    </>
                  ) : (
                    <div className={styles.uploadedFileInfo}>
                      <span className={styles.pdfTag}>PDF</span>
                      <span className={styles.uploadedFileName} title={vssFile.name}>
                        {vssFile.name}
                      </span>
                    </div>
                  )}
                </div>
              </fieldset>
            </div>

            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={vssEnabled}
                onChange={(e) => setVssEnabled(e.target.checked)}
              />
              <span className={styles.checkboxLabel}>
                Show this uploaded file in lead Contract PDF file select
              </span>
            </label>
          </section>

          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              disabled={isSubmitting}
              onClick={() => router.push("/manufacturer/manufacturer-list")}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManufacturerEdit;
