import React, { useState, useEffect, useMemo } from 'react';
import { LeftSidebar } from './components/Sidebar/LeftSidebar';
import { HeaderToolbar } from './components/Header/HeaderToolbar';
import { PDFViewer } from './components/PDFViewer/PDFViewer';
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';
import { SignatureModal } from './components/Modals/SignatureModal';
import { UploadModal } from './components/Modals/UploadModal';
import { FieldMappingView } from '@/components/modules/fieldMapping';
import { useFormFields } from './hooks/useFormFields';
import { usePdfDocument } from './hooks/usePdfDocument';
import { usePdfViewerState } from './hooks/usePdfViewerState';
import { exportPdfDocument, triggerPdfDownload } from './utils/pdfExporter';
import { autoDetectDocumentFields, sanitizeFieldName } from './utils/fieldUtils';
import { quotesApi } from '@/lib/api/quotes';
import './App.css';

export function PDFEditor({
  initialFile = null,
  initialPdfType = '',
  initialFields: passedInitialFields = null,
  initialMappings = null,
  onBack = null,
  onSave = null,
  customSave = null,
  title = 'AcroForm PDF Editor',
  mappingType = 'lead',
  isManufacturer = false,
  quoteFieldMappings = null,
  customFieldGroups = null
}) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signingField, setSigningField] = useState(null);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [leftTab, setLeftTab] = useState('tools');
  const [isExporting, setIsExporting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'mapping'
  const [fieldMappings, setFieldMappings] = useState(initialMappings || {});

  useEffect(() => {
    if (initialMappings && typeof initialMappings === 'object') {
      setFieldMappings(initialMappings);
    }
  }, [initialMappings]);

  // PDF Document hook
  const {
    pdfDoc,
    rawBuffer,
    numPages,
    pageSizes,
    initialFields,
    detectedPdfFont,
    fileName,
    fileSize,
    loading,
    loadingMessage,
    error: docError,
    loadFromFile
  } = usePdfDocument(initialFile);

  // Viewer state hook
  const {
    currentPage,
    setCurrentPage,
    zoom,
    setZoomLevel,
    zoomIn,
    zoomOut,
    fitMode,
    setFitMode,
    handleFitMode,
    rotation,
    rotateClockwise,
    goToPage,
    nextPage,
    prevPage,
    sidebarOpen,
    setSidebarOpen
  } = usePdfViewerState(numPages);

  // If caller provided saved initialFields, use those; otherwise use document extracted fields
  const effectiveInitialFields = useMemo(() => {
    if (Array.isArray(passedInitialFields) && passedInitialFields.length > 0) {
      return passedInitialFields;
    }
    return initialFields || [];
  }, [passedInitialFields, initialFields]);

  // Form Fields hook
  const {
    fields,
    setFields,
    selectedFieldId,
    selectedField,
    setSelectedFieldId,
    activeTool,
    setActiveTool,
    continuousPlacement,
    setContinuousPlacement,
    addField,
    updateField,
    deleteField,
    duplicateField,
    undo,
    redo,
    canUndo,
    canRedo
  } = useFormFields(effectiveInitialFields, rawBuffer);

  const showToast = (msg, duration = 3000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  };

  // In-place text conversion handler when clicking on text in the PDF
  const handleAddTextAsField = (newField) => {
    addField(newField);
    setSelectedFieldId(newField.id);
    showToast(`Editing: "${newField.value || 'Text'}"`);
  };

  // Auto-detect and populate all fields from the document text
  const handleAutoDetectFields = async () => {
    if (!pdfDoc) {
      showToast('No PDF is currently loaded.');
      return;
    }
    setIsDetecting(true);
    showToast('Scanning document for fillable fields...');
    try {
      const detected = await autoDetectDocumentFields(pdfDoc, numPages, pageSizes, fields);
      if (detected.length === 0) {
        showToast('No form fields found in this PDF. Use the toolbar on the left to add fields.');
      } else {
        detected.forEach(f => addField(f));
        showToast(`Auto-detected ${detected.length} form fields!`);
      }
    } catch (err) {
      console.error('Auto-detect error:', err);
      showToast('Failed to auto-detect fields.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Clear all fields on the document
  const handleClearFields = () => {
    setFields([]);
    setSelectedFieldId(null);
    showToast('Cleared all fields.');
  };

  const [lastExported, setLastExported] = useState(null);

  // Save Quote Template directly to Server via API (/quote-templates/upload)
  const handleExportPdf = async () => {
    if (!rawBuffer) {
      showToast('No PDF is currently loaded to save.');
      return;
    }

    // Switch view to dedicated Full Screen Field Mapping screen
    setViewMode('mapping');
  };

  // Perform actual export and upload with field mappings
  const handleSaveWithMappings = async (mappings = fieldMappings) => {
    if (!rawBuffer) {
      showToast('No PDF loaded to export.');
      return;
    }

    setIsExporting(true);
    try {
      const baseName = fileName ? fileName.replace(/\.pdf$/i, '') : 'quote-template';
      const outName = `${baseName}.pdf`;

      setFieldMappings(mappings);

      // Clean mapping object with resolved user-defined field names
      const cleanMappings = {};
      const usedKeys = new Set();
      const processedFieldIds = new Set();

      const resolveUniqueKey = (matchedField, leadKey, fallbackKey) => {
        let finalKey = (matchedField && matchedField.name) ? matchedField.name : fallbackKey;

        const isDummy =
          /^(text|field|date|checkbox|radio|dropdown|size)_\d+(_copy)?$/i.test(finalKey) ||
          /^acro_/i.test(finalKey) ||
          /^existing_/i.test(finalKey) ||
          /^SIZE_\d+/i.test(finalKey);

        if (isDummy) {
          const customLabel = matchedField?.label && !/^(text|field|date|checkbox|radio|dropdown|size)\s*(field)?\s*\d+/i.test(matchedField.label)
            ? matchedField.label
            : null;
          const customValue = matchedField?.value && typeof matchedField.value === 'string' && matchedField.value.trim().length > 0 && matchedField.value.trim().length < 30 && !/^(text|field)\b/i.test(matchedField.value.trim())
            ? matchedField.value.trim()
            : null;

          if (customLabel || customValue) {
            finalKey = sanitizeFieldName(customLabel || customValue);
          } else if (leadKey && String(leadKey).trim()) {
            const parts = String(leadKey).split('.');
            const leaf = parts[parts.length - 1];
            finalKey = sanitizeFieldName(leaf);
          } else {
            finalKey = sanitizeFieldName(finalKey);
          }
        } else {
          finalKey = sanitizeFieldName(finalKey);
        }

        if (!finalKey) {
          finalKey = `field_${matchedField?.type || 'text'}`;
        }

        let uniqueKey = finalKey;
        let counter = 2;
        while (usedKeys.has(uniqueKey)) {
          uniqueKey = `${finalKey}_${counter}`;
          counter++;
        }
        usedKeys.add(uniqueKey);
        return uniqueKey;
      };

      // 1. Process all actual form fields present in the template
      (fields || []).forEach((field) => {
        if (!field) return;
        if (field.id) processedFieldIds.add(field.id);
        if (field.name) processedFieldIds.add(field.name);
        if (field.originalName) processedFieldIds.add(field.originalName);

        // Check if there is an explicit mapping for this field
        let rawLeadKey = null;
        if (mappings && typeof mappings === 'object') {
          if (field.name && mappings[field.name] !== undefined) {
            rawLeadKey = mappings[field.name];
          } else if (field.id && mappings[field.id] !== undefined) {
            rawLeadKey = mappings[field.id];
          } else if (field.originalName && mappings[field.originalName] !== undefined) {
            rawLeadKey = mappings[field.originalName];
          }
        }

        const hasMapping = rawLeadKey && typeof rawLeadKey === 'string' && rawLeadKey.trim().length > 0;
        const uniqueKey = resolveUniqueKey(field, hasMapping ? rawLeadKey : null, field.name || field.id);

        field.name = uniqueKey;
        cleanMappings[uniqueKey] = hasMapping ? String(rawLeadKey).trim() : null;
      });

      // 2. Also retain any extra mappings not directly bound to fields array
      if (mappings && typeof mappings === 'object') {
        Object.entries(mappings).forEach(([pdfKey, leadKey]) => {
          if (processedFieldIds.has(pdfKey)) return;

          const matchedField = (fields || []).find(f => f.name === pdfKey || f.id === pdfKey || f.originalName === pdfKey);
          if (matchedField && (processedFieldIds.has(matchedField.id) || processedFieldIds.has(matchedField.name))) {
            return;
          }

          const hasMapping = leadKey && typeof leadKey === 'string' && leadKey.trim().length > 0;
          const uniqueKey = resolveUniqueKey(matchedField, hasMapping ? leadKey : null, pdfKey);

          if (matchedField) {
            matchedField.name = uniqueKey;
            if (matchedField.id) processedFieldIds.add(matchedField.id);
            if (matchedField.name) processedFieldIds.add(matchedField.name);
          }
          cleanMappings[uniqueKey] = hasMapping ? String(leadKey).trim() : null;
        });
      }

      setFieldMappings(cleanMappings);

      // Generate the editable AcroForm PDF with all fields preserved and updated names
      const { pdfBytes, blob } = await exportPdfDocument(rawBuffer, fields, {
        flatten: false,
        fileName: outName
      });

      // Construct a valid File object from the generated PDF Blob
      const pdfFile = new File([blob], outName, { type: 'application/pdf' });

      // Create multipart FormData for API
      const formData = new FormData();
      formData.append('file', pdfFile, outName);
      formData.append('typeName', (initialPdfType || '').trim());
      formData.append('fieldMappings', JSON.stringify(cleanMappings));

      let response = null;
      if (typeof customSave === 'function') {
        response = await customSave({
          file: pdfFile,
          blob,
          pdfBytes,
          fileName: outName,
          typeName: (initialPdfType || '').trim(),
          fields,
          fieldMappings: cleanMappings,
          formData
        });
      } else {
        // Upload template to backend API
        response = await quotesApi.uploadQuoteTemplate(formData);
      }

      setLastExported({
        buffer: pdfBytes.slice().buffer,
        name: outName
      });

      showToast('Template & field mappings saved successfully!');

      if (typeof onSave === 'function') {
        onSave({
          response,
          file: pdfFile,
          pdfBytes,
          blob,
          fileName: outName,
          fields,
          fieldMappings: cleanMappings,
          cleanMappings
        });
      } else {
        setViewMode('editor');
      }
    } catch (err) {
      console.error('Failed to save quote template:', err);
      showToast(err.message || 'Failed to save quote template');
    } finally {
      setIsExporting(false);
    }
  };

  // Download the interactive AcroForm PDF directly to client machine
  const handleDownloadPdf = async () => {
    if (!rawBuffer) {
      showToast('No PDF loaded to export.');
      return;
    }

    setIsExporting(true);
    try {
      const baseName = fileName ? fileName.replace(/\.pdf$/i, '') : 'quote-template';
      const outName = `${baseName}.pdf`;

      const { blob } = await exportPdfDocument(rawBuffer, fields, {
        flatten: false,
        fileName: outName
      });

      triggerPdfDownload(blob, outName);
      showToast('Interactive PDF downloaded successfully!');
    } catch (err) {
      console.error('Failed to download PDF:', err);
      showToast(err.message || 'Failed to download PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Preview the last exported PDF directly in AcroEdit
  const handlePreviewExported = () => {
    if (lastExported) {
      processPdfBuffer(lastExported.buffer, lastExported.name);
      showToast(`Now previewing saved ${lastExported.name}`);
    }
  };

  // Open signature modal for a specific field
  const handleOpenSignatureModal = (field) => {
    setSigningField(field);
    setSignatureModalOpen(true);
  };

  // Apply signature to field
  const handleSaveSignature = (dataUrl, signerName) => {
    if (signingField) {
      updateField(signingField.id, {
        signatureDataUrl: dataUrl,
        signerName: signerName || signingField.signerName
      });
      showToast('Signature added to field!');
    }
  };

  // ── Render Full Field Mapping Screen in place of PDF Editor when saving ──
  if (viewMode === 'mapping') {
    return (
      <FieldMappingView
        fields={fields}
        initialMappings={fieldMappings}
        templateName={fileName}
        typeName={initialPdfType}
        mappingType={mappingType || (isManufacturer ? 'manufacturer' : 'lead')}
        isManufacturer={isManufacturer}
        quoteFieldMappings={quoteFieldMappings}
        customFieldGroups={customFieldGroups}
        onBack={() => setViewMode('editor')}
        onSave={handleSaveWithMappings}
        onAutoDetect={handleAutoDetectFields}
        onUpdateField={updateField}
        isSaving={isExporting}
      />
    );
  }

  return (
    <div className="acrobat-app-container">
      {/* Top Header Toolbar */}
      <HeaderToolbar
        onBack={onBack}
        fileName={fileName}
        fileSize={fileSize}
        currentPage={currentPage}
        numPages={numPages}
        onGoToPage={goToPage}
        onPrevPage={prevPage}
        onNextPage={nextPage}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onSetZoomLevel={setZoomLevel}
        fitMode={fitMode}
        onSetFitMode={setFitMode}
        onRotate={rotateClockwise}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => {
          if (!sidebarOpen) {
            setSidebarOpen(true);
            setLeftTab('pages');
          } else if (leftTab === 'pages') {
            setLeftTab('tools');
          } else {
            setLeftTab('pages');
          }
        }}
        propertiesOpen={propertiesOpen}
        onToggleProperties={() => setPropertiesOpen(!propertiesOpen)}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenMapping={() => setViewMode('mapping')}
        onDownloadPdf={handleDownloadPdf}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
        lastExported={lastExported}
        onPreviewExported={handlePreviewExported}
      />

      {/* Main Workspace Area (Left Tools & Pages + Viewer + Properties) */}
      <div className="acrobat-main-body">
        {/* Left Tools & Pages Sidebar */}
        <LeftSidebar
          activeTool={activeTool}
          setActiveTool={(tool) => {
            setActiveTool(tool);
            setLeftTab('tools');
            if (!sidebarOpen) setSidebarOpen(true);
          }}
          continuousPlacement={continuousPlacement}
          setContinuousPlacement={setContinuousPlacement}
          onAutoDetect={handleAutoDetectFields}
          isDetecting={isDetecting}
          fieldsCount={fields.length}
          onClearFields={handleClearFields}
          pdfDoc={pdfDoc}
          numPages={numPages}
          pageSizes={pageSizes}
          currentPage={currentPage}
          onSelectPage={goToPage}
          fields={fields}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={leftTab}
          setActiveTab={setLeftTab}
        />

        {/* Central PDF Viewer Canvas Area */}
        <main className="acrobat-viewer-pane">
          {loading && (
            <div className="viewer-loading-overlay">
              <div className="loading-spinner" />
              <p>{loadingMessage || 'Loading document...'}</p>
            </div>
          )}

          {docError && (
            <div className="viewer-error-banner">
              <strong>Error:</strong> {docError}
              <button
                type="button"
                className="secondary-btn small-btn"
                onClick={() => setUploadModalOpen(true)}
              >
                Upload PDF
              </button>
            </div>
          )}

          {!pdfDoc && !loading && !docError && (
            <div className="viewer-empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a8a29e', gap: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>No PDF Document Loaded</div>
              <button
                type="button"
                className="secondary-btn"
                style={{ padding: '8px 18px', borderRadius: '6px', background: '#e11d48', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                onClick={() => setUploadModalOpen(true)}
              >
                Upload PDF
              </button>
            </div>
          )}

          {pdfDoc && (
            <PDFViewer
              pdfDoc={pdfDoc}
              detectedPdfFont={detectedPdfFont}
              numPages={numPages}
              pageSizes={pageSizes}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              zoom={zoom}
              rotation={rotation}
              fitMode={fitMode}
              handleFitMode={handleFitMode}
              fields={fields}
              selectedFieldId={selectedFieldId}
              activeTool={activeTool}
              onSelectField={setSelectedFieldId}
              onAddField={addField}
              onAddTextAsField={handleAddTextAsField}
              onUpdateField={updateField}
              onDeleteField={deleteField}
              onDuplicateField={duplicateField}
              onOpenSignatureModal={handleOpenSignatureModal}
            />
          )}
        </main>

        {/* Right Field Properties Inspector */}
        {propertiesOpen && (
          <PropertiesPanel
            selectedField={selectedField}
            detectedPdfFont={detectedPdfFont}
            onUpdateField={updateField}
            onDeleteField={deleteField}
            onDuplicateField={duplicateField}
            onOpenSignatureModal={handleOpenSignatureModal}
            onClose={() => setPropertiesOpen(false)}
          />
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification-pill">
          {toastMessage}
        </div>
      )}

      {/* Modals */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadFile={loadFromFile}
        loading={loading}
        error={docError}
      />

      <SignatureModal
        isOpen={signatureModalOpen}
        field={signingField}
        onClose={() => {
          setSignatureModalOpen(false);
          setSigningField(null);
        }}
        onSaveSignature={handleSaveSignature}
      />
    </div>
  );
}

export default PDFEditor;
