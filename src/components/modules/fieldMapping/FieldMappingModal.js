import React from 'react';
import { X, FileSpreadsheet, Save } from 'lucide-react';
import { useFieldMapping } from './hooks/useFieldMapping';
import { FieldMappingToolbar } from './components/FieldMappingToolbar';
import { FieldMappingTable } from './components/FieldMappingTable';
import styles from './fieldMapping.module.scss';

export function FieldMappingModal({
  isOpen,
  fields = [],
  initialMappings = {},
  onClose,
  onSave,
  onAutoDetect,
  isSaving = false
}) {
  const {
    mappings,
    filteredFields,
    isUsingDefaults,
    totalFieldsCount,
    mappedCount,
    percentMapped,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    setFieldMapping,
    autoMatchAll,
    clearAllMappings
  } = useFieldMapping({ fields, initialMappings });

  if (!isOpen) return null;

  const handleConfirmSave = () => {
    const fullMappings = { ...mappings };
    (fields || []).forEach((field) => {
      if (field?.name && (fullMappings[field.name] === undefined || fullMappings[field.name] === '')) {
        fullMappings[field.name] = null;
      }
    });
    onSave?.(fullMappings);
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={(e) => {
        // Prevent backdrop click from bubbling or closing accidentally
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="field-mapping-title"
      >
        {/* ── Modal Header ────────────────────────────────────── */}
        <div className={styles.modalHeader}>
          <div className={styles.titleWrap}>
            <div className={styles.iconBadge}>
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 id="field-mapping-title" className={styles.titleText}>
                PDF Field Mapping
              </h3>
              <p className={styles.subtitleText}>
                {isUsingDefaults
                  ? 'Standard Quote Fields & Lead Mapping. Connect fields to automatically populate customer data.'
                  : 'Connect your PDF fields with CRM Lead fields for automated quote generation.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            title="Close modal"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Toolbar: Progress & Quick Actions & Filters ─────── */}
        <FieldMappingToolbar
          mappedCount={mappedCount}
          totalFieldsCount={totalFieldsCount}
          percentMapped={percentMapped}
          isUsingDefaults={isUsingDefaults}
          onAutoDetect={onAutoDetect}
          onAutoMatch={autoMatchAll}
          onClearAll={clearAllMappings}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onFilterChange={setFilterType}
        />

        {/* ── Mapping Rows Table ──────────────────────────────── */}
        <FieldMappingTable
          fields={filteredFields}
          mappings={mappings}
          onMappingChange={setFieldMapping}
        />

        {/* ── Modal Footer ────────────────────────────────────── */}
        <div className={styles.modalFooter}>
          <div className={styles.footerHint}>
            <span>
              <strong>{mappedCount}</strong> fields will auto-populate from Lead data
            </span>
          </div>

          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              id="btn-confirm-save-mapping"
              type="button"
              className={styles.saveBtn}
              onClick={handleConfirmSave}
              disabled={isSaving}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving Template...' : 'Save Template & Mappings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FieldMappingModal;
