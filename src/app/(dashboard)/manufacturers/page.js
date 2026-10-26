"use client";

import { useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, Sparkles, CheckCircle2, AlertCircle, X } from "lucide-react";
import { manufacturersApi } from "@/lib/api/manufacturers";
import { useToastStore } from "@/store/toastStore";
import styles from "./manufacturers.module.scss";

const PDFEditor = dynamic(
  () => import("@/components/modules/pdfEditor"),
  {
    ssr: false,
    loading: () => (
      <div className={styles.pdfEditorLoader}>
        <div className={styles.pdfEditorSpinner} />
        <p className={styles.pdfEditorLoaderText}>Loading Contract AcroForm PDF Editor...</p>
      </div>
    )
  }
);

const createEmptyContract = () => ({
  id: `contract_${Date.now()}`,
  name: "",
  file: null,
  pdfBlob: null,
  pdfBytes: null,
  fields: [],
  fieldMappings: {},
  isConfigured: false,
});

export default function ManufacturersPage() {
  const router = useRouter();

  const [basicDetails, setBasicDetails] = useState({
    name: "",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
  });

  const [contracts, setContracts] = useState([createEmptyContract()]);

  const [additionalDoc, setAdditionalDoc] = useState({
    name: "",
    file: null,
  });

  const [vssDoc, setVssDoc] = useState({
    name: "",
    file: null,
    showInLeadContractSelect: false,
  });

  const [activeContractIndex, setActiveContractIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState(null);

  const contractFileInputRefs = useRef([]);
  const additionalFileInputRef = useRef(null);
  const vssFileInputRef = useRef(null);

  const queryClient = useQueryClient();
  const toastSuccess = useToastStore((s) => s.success);

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

  const showToast = (message, type = "success", duration = 3500) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleBasicChange = (field, value) => {
    setBasicDetails((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleAddContractRow = () => {
    setContracts((prev) => [...prev, createEmptyContract()]);
  };

  const handleRemoveContractRow = (index) => {
    if (contracts.length === 1) {
      setContracts([createEmptyContract()]);
      if (contractFileInputRefs.current[0]) {
        contractFileInputRefs.current[0].value = "";
      }
      return;
    }

    setContracts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContractNameChange = (index, value) => {
    setContracts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name: value };
      return copy;
    });
  };

  const handleContractFileChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please upload a valid PDF document (.pdf)", "error");
      return;
    }

    setContracts((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        originalFile: file,
        file,
        pdfBlob: null,
        pdfBytes: null,
        fields: [],
        fieldMappings: {},
        isConfigured: false,
      };
      return copy;
    });
  };

  const handleOpenContractEditor = (index) => {
    const contract = contracts[index];
    if (!contract || !contract.file) {
      showToast("Please upload a PDF file first before editing.", "error");
      return;
    }

    setActiveContractIndex(index);
  };

  const handleAdditionalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please upload a valid PDF document (.pdf)", "error");
      return;
    }

    setAdditionalDoc((prev) => ({ ...prev, file }));
  };

  const handleVssFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please upload a valid PDF document (.pdf)", "error");
      return;
    }

    setVssDoc((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!basicDetails.name.trim()) {
      setErrorMessage("Please enter Manufacturer Name.");
      return;
    }
    if (!basicDetails.fullName.trim()) {
      setErrorMessage("Please enter Full Name.");
      return;
    }
    if (!basicDetails.phone.trim()) {
      setErrorMessage("Please enter Phone number.");
      return;
    }
    if (!basicDetails.addressLine1.trim()) {
      setErrorMessage("Please enter Address Line 1.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", basicDetails.name.trim());
      formData.append("full_name", basicDetails.fullName.trim());
      formData.append("phone_no", basicDetails.phone.trim());
      formData.append("address_line_1", basicDetails.addressLine1.trim());
      formData.append("address_line_2", basicDetails.addressLine2.trim());

      const validContracts = contracts.filter((c) => c.file);
      const contractsMetadata = [];

      validContracts.forEach((contract, idx) => {
        const fileKey = `contract_${idx}`;
        const fileToUpload = contract.pdfBlob
          ? new File([contract.pdfBlob], contract.file?.name || `contract_${idx + 1}.pdf`, { type: "application/pdf" })
          : contract.file;

        contractsMetadata.push({
          name: contract.name.trim() || `Contract Template ${idx + 1}`,
          fileKey,
          fieldMappings: contract.fieldMappings || {},
        });

        formData.append(fileKey, fileToUpload);
      });

      formData.append("contracts", JSON.stringify(contractsMetadata));

      if (additionalDoc.file) {
        formData.append("additionalDocumentName", additionalDoc.name.trim() || additionalDoc.file.name);
        formData.append("additionalDocumentPdf", additionalDoc.file);
      }

      if (vssDoc.file) {
        formData.append("document_name", vssDoc.name.trim() || vssDoc.file.name);
        formData.append("document_pdf", vssDoc.file);
        formData.append("document_enabled", vssDoc.showInLeadContractSelect ? "1" : "0");
      }

      await manufacturersApi.createManufacturer(formData);
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
      toastSuccess("Manufacturer created successfully!");
      router.push("/manufacturer/manufacturer-list");
    } catch (err) {
      console.error("Save Manufacturer error:", err);
      setErrorMessage(err.message || "Failed to save Manufacturer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/manufacturer/manufacturer-list");
  };

  if (activeContractIndex !== null) {
    const currentContract = contracts[activeContractIndex];

    return (
      <PDFEditor
        initialFile={currentContract.originalFile || currentContract.file}
        initialFields={currentContract.fields}
        initialMappings={currentContract.fieldMappings}
        initialPdfType={currentContract.name || "Contract Template"}
        title={`Edit AcroForm: ${currentContract.name || "Contract PDF"}`}
        isManufacturer={true}
        mappingType="manufacturer"
        quoteFieldMappings={quoteFieldMappings}
        onBack={() => setActiveContractIndex(null)}
        customSave={async ({ blob, pdfBytes, fields, fieldMappings, cleanMappings, fileName }) => {
          setContracts((prev) => {
            const updated = [...prev];
            const currentItem = updated[activeContractIndex];
            const baseFile = currentItem.originalFile || currentItem.file;
            const updatedFile = new File([blob], fileName || baseFile?.name || "contract.pdf", {
              type: "application/pdf",
            });

            updated[activeContractIndex] = {
              ...currentItem,
              originalFile: baseFile,
              file: updatedFile,
              pdfBlob: blob,
              pdfBytes,
              fields: fields || [],
              fieldMappings: cleanMappings || fieldMappings || {},
              isConfigured: true,
            };
            return updated;
          });

          showToast(`AcroForm configured for ${currentContract.name || "Contract"}!`);
          setActiveContractIndex(null);
          return { success: true };
        }}
        onSave={() => {
          setActiveContractIndex(null);
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
            <h2 className={styles.sectionTitle}>Add Manufacturer</h2>

            <div className={styles.gridThreeCol}>
              <div>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Name *"
                  value={basicDetails.name}
                  onChange={(e) => handleBasicChange("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Full Name *"
                  value={basicDetails.fullName}
                  onChange={(e) => handleBasicChange("fullName", e.target.value)}
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Enter Phone number *"
                  value={basicDetails.phone}
                  onChange={(e) => handleBasicChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.singleCol}>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Address Line 1 *"
                value={basicDetails.addressLine1}
                onChange={(e) => handleBasicChange("addressLine1", e.target.value)}
                required
              />
            </div>

            <div className={styles.singleCol}>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Address Line 2"
                value={basicDetails.addressLine2}
                onChange={(e) => handleBasicChange("addressLine2", e.target.value)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionDash} />
            <h2 className={styles.sectionTitle}>Contract PDF Templates</h2>

            {contracts.map((contract, index) => (
              <div key={contract.id} className={styles.contractRow}>
                <div className={styles.contractRowFields}>
                  <div>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="Contract Name"
                      value={contract.name}
                      onChange={(e) => handleContractNameChange(index, e.target.value)}
                    />
                  </div>

                  <fieldset className={styles.fileFieldset}>
                    <legend className={styles.fileLegend}>Upload Contract PDF</legend>
                    <div className={styles.fileContentWrapper}>
                      <input
                        ref={(el) => (contractFileInputRefs.current[index] = el)}
                        type="file"
                        accept=".pdf,application/pdf"
                        className={styles.hiddenFileInput}
                        onChange={(e) => handleContractFileChange(index, e)}
                      />

                      {!contract.file ? (
                        <>
                          <button
                            type="button"
                            className={styles.chooseFileButton}
                            onClick={() => contractFileInputRefs.current[index]?.click()}
                          >
                            Choose File
                          </button>
                          <span className={styles.noFileChosenText}>No file chosen</span>
                        </>
                      ) : (
                        <div className={styles.uploadedFileInfo}>
                          <span className={styles.pdfTag}>PDF</span>
                          <span className={styles.uploadedFileName} title={contract.file.name}>
                            {contract.file.name}
                          </span>
                          <span className={styles.uploadedFileSize}>
                            ({formatFileSize(contract.file.size)})
                          </span>
                        </div>
                      )}
                    </div>
                  </fieldset>
                </div>

                {contract.file && (
                  <div className={styles.contractActions}>
                    {contract.isConfigured ? (
                      <>
                        <span className={styles.configuredBadge}>
                          <CheckCircle2 size={13} />
                          AcroForm Configured ({contract.fields?.length || 0} fields)
                        </span>
                        <button
                          type="button"
                          className={styles.editAcroFormBtn}
                          onClick={() => handleOpenContractEditor(index)}
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
                          onClick={() => handleOpenContractEditor(index)}
                        >
                          <Sparkles size={13} />
                          Make Editable (AcroForm)
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className={styles.removeRowBtn}
                      title="Remove Contract"
                      onClick={() => handleRemoveContractRow(index)}
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
              onClick={handleAddContractRow}
            >
              <Plus size={14} />
              Add More Contract
            </button>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionDash} />
            <h2 className={styles.sectionTitle}>Additional Manufacturer Documents</h2>

            <div className={styles.gridTwoCol}>
              <div>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Additional Manufacturer Document Name"
                  value={additionalDoc.name}
                  onChange={(e) => setAdditionalDoc((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <fieldset className={styles.fileFieldset}>
                <legend className={styles.fileLegend}>Upload Additional Manufacturer Document</legend>
                <div className={styles.fileContentWrapper}>
                  <input
                    ref={additionalFileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className={styles.hiddenFileInput}
                    onChange={handleAdditionalFileChange}
                  />

                  {!additionalDoc.file ? (
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
                      <span className={styles.uploadedFileName} title={additionalDoc.file.name}>
                        {additionalDoc.file.name}
                      </span>
                      <span className={styles.uploadedFileSize}>
                        ({formatFileSize(additionalDoc.file.size)})
                      </span>
                      <button
                        type="button"
                        className={`${styles.removeRowBtn} ${styles.removeFileBtn}`}
                        onClick={() => {
                          setAdditionalDoc((prev) => ({ ...prev, file: null }));
                          if (additionalFileInputRef.current) additionalFileInputRef.current.value = "";
                        }}
                      >
                        <X size={12} />
                      </button>
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
              <div>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Document Name"
                  value={vssDoc.name}
                  onChange={(e) => setVssDoc((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <fieldset className={styles.fileFieldset}>
                <legend className={styles.fileLegend}>Upload VSS Document</legend>
                <div className={styles.fileContentWrapper}>
                  <input
                    ref={vssFileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className={styles.hiddenFileInput}
                    onChange={handleVssFileChange}
                  />

                  {!vssDoc.file ? (
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
                      <span className={styles.uploadedFileName} title={vssDoc.file.name}>
                        {vssDoc.file.name}
                      </span>
                      <span className={styles.uploadedFileSize}>
                        ({formatFileSize(vssDoc.file.size)})
                      </span>
                      <button
                        type="button"
                        className={`${styles.removeRowBtn} ${styles.removeFileBtn}`}
                        onClick={() => {
                          setVssDoc((prev) => ({ ...prev, file: null }));
                          if (vssFileInputRef.current) vssFileInputRef.current.value = "";
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </fieldset>
            </div>

            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={vssDoc.showInLeadContractSelect}
                onChange={(e) =>
                  setVssDoc((prev) => ({
                    ...prev,
                    showInLeadContractSelect: e.target.checked,
                  }))
                }
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
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.saveSpinner} />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className={styles.toastPill}>
          {toast.type === "error" ? (
            <AlertCircle size={16} color="#ef4444" />
          ) : (
            <CheckCircle2 size={16} color="#10b981" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
