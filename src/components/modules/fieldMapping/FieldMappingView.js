import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Save, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { useFieldMapping } from './hooks/useFieldMapping';
import { FieldMappingToolbar } from './components/FieldMappingToolbar';
import { FieldMappingTable } from './components/FieldMappingTable';
import { groupQuoteTemplateFields } from './constants/leadFields';
import { quotesApi } from '@/lib/api/quotes';
import styles from './fieldMapping.module.scss';

export function FieldMappingView({
  fields = [],
  initialMappings = {},
  templateName = '',
  typeName = '',
  mappingType = 'lead',
  isManufacturer = false,
  quoteFieldMappings = null,
  customFieldGroups = null,
  onBack,
  onSave,
  onAutoDetect,
  onUpdateField,
  isSaving = false
}) {
  const isMfg = isManufacturer || mappingType === 'manufacturer';

  // State to hold fetched or passed quote template field mappings
  const [fetchedQuoteFields, setFetchedQuoteFields] = useState(() => {
    if (Array.isArray(quoteFieldMappings) && quoteFieldMappings.length > 0) {
      return quoteFieldMappings;
    }
    return [];
  });
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);

  // Sync if parent updates quoteFieldMappings prop
  useEffect(() => {
    if (Array.isArray(quoteFieldMappings) && quoteFieldMappings.length > 0) {
      setFetchedQuoteFields(quoteFieldMappings);
    }
  }, [quoteFieldMappings]);

  // If in manufacturer mode and no quote fields passed, fetch from /quote-templates/mappings
  useEffect(() => {
    if (!isMfg) return;
    if (customFieldGroups && customFieldGroups.length > 0) return;
    if (fetchedQuoteFields.length > 0) return;

    let isMounted = true;
    setIsLoadingMappings(true);

    quotesApi.getQuoteTemplateMappings()
      .then((res) => {
        if (!isMounted) return;
        const results = res?.results || res?.data?.results || (Array.isArray(res) ? res : []);
        const allKeys = [];
        const seen = new Set();
        results.forEach((item) => {
          const arr = Array.isArray(item?.fieldMappings)
            ? item.fieldMappings
            : (item?.fieldMappings && typeof item.fieldMappings === 'object' ? Object.keys(item.fieldMappings) : []);
          arr.forEach((k) => {
            if (k && typeof k === 'string' && k.trim() && !seen.has(k.trim())) {
              seen.add(k.trim());
              allKeys.push(k.trim());
            }
          });
        });
        if (allKeys.length > 0) {
          setFetchedQuoteFields(allKeys);
        }
      })
      .catch((err) => {
        console.warn('Failed to load quote template mappings:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMappings(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isMfg, customFieldGroups, fetchedQuoteFields.length]);

  // Compute active field groups for the mapping dropdown
  const activeFieldGroups = useMemo(() => {
    if (customFieldGroups && customFieldGroups.length > 0) {
      return customFieldGroups;
    }
    if (isMfg && fetchedQuoteFields.length > 0) {
      return groupQuoteTemplateFields(fetchedQuoteFields);
    }
    return null;
  }, [customFieldGroups, isMfg, fetchedQuoteFields]);

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
    fieldTypeCounts,
    renameField,
    setFieldMapping,
    autoMatchAll,
    clearAllMappings
  } = useFieldMapping({
    fields,
    initialMappings,
    availableFields: isMfg ? fetchedQuoteFields : [],
    mappingType: isMfg ? 'manufacturer' : 'lead',
    onUpdateField
  });

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
    <div className={styles.fullPageView}>
      {/* ── Top Navigation Header ───────────────────────────────── */}
      <header className={styles.viewHeader}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            title="Return to PDF Editor"
          >
            <ArrowLeft size={16} />
            <span>Back to Editor</span>
          </button>

          <div className={styles.headerDivider} />

          <div className={styles.viewTitleGroup}>
            <div className={styles.viewIconBadge}>
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <div className={styles.breadcrumbs}>
                <span>{isMfg ? 'Manufacturer Contract' : 'Quote PDF Template'}</span>
                <span className={styles.crumbSep}>/</span>
                <span className={styles.crumbCurrent}>Field Mapping</span>
                {typeName && <span className={styles.typeBadge}>{typeName}</span>}
              </div>
              <h2 className={styles.viewTitle}>
                {isMfg
                  ? 'Map Contract Fields to Quote Template Data'
                  : 'Map PDF Fields to CRM Lead Data'}
              </h2>
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.secondaryActionBtn}
            onClick={onBack}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            id="btn-save-field-mapping-full"
            type="button"
            className={styles.primarySaveBtn}
            onClick={handleConfirmSave}
            disabled={isSaving}
          >
            <Save size={16} />
            <span>
              {isSaving
                ? 'Saving Template...'
                : (isMfg ? 'Save Contract & Mappings' : 'Save Template & Mappings')}
            </span>
          </button>
        </div>
      </header>

      {/* ── Toolbar: Progress, Auto-Match, Search & Filter Tabs ── */}
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
        fieldTypeCounts={fieldTypeCounts}
      />

      {/* ── Main Mapping Workspace ─────────────────────────────── */}
      <main className={styles.viewMain}>
        <FieldMappingTable
          fields={filteredFields}
          mappings={mappings}
          fieldGroups={activeFieldGroups}
          mappingType={isMfg ? 'manufacturer' : 'lead'}
          isLoadingOptions={isLoadingMappings}
          onMappingChange={setFieldMapping}
          onRenameField={renameField}
          onAutoDetect={onAutoDetect}
          onBack={onBack}
        />
      </main>

    </div>
  );
}

export default FieldMappingView;
