import React, { useState } from 'react';
import { Check, ChevronDown, Layers, Sparkles, ArrowLeft, Plus } from 'lucide-react';
import { LEAD_FIELD_GROUPS } from '../constants/leadFields';
import { SearchableFieldSelect } from './SearchableFieldSelect';
import styles from '../fieldMapping.module.scss';

function getFieldTypeBadge(type = 'text', styles) {
  switch (type.toLowerCase()) {
    case 'text':
      return { label: 'TEXT', className: styles.tag_text };
    case 'checkbox':
      return { label: 'CHECKBOX', className: styles.tag_checkbox };
    case 'radio':
      return { label: 'RADIO', className: styles.tag_radio };
    case 'dropdown':
      return { label: 'DROPDOWN', className: styles.tag_dropdown };
    case 'textarea':
      return { label: 'TEXTAREA', className: styles.tag_textarea };
    case 'date':
      return { label: 'DATE', className: styles.tag_date };
    case 'signature':
      return { label: 'SIGN', className: styles.tag_signature };
    default:
      return { label: String(type).toUpperCase().slice(0, 5), className: styles.tag_text };
  }
}

export function FieldMappingTable({
  fields = [],
  mappings = {},
  fieldGroups = null,
  mappingType = 'lead',
  isLoadingOptions = false,
  onMappingChange,
  onAutoDetect,
  onBack
}) {
  const [templateModeFields, setTemplateModeFields] = useState({});

  const activeGroups = Array.isArray(fieldGroups) && fieldGroups.length > 0
    ? fieldGroups
    : LEAD_FIELD_GROUPS;

  const toggleTemplateMode = (fieldName, currentValue = '') => {
    setTemplateModeFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  if (fields.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrap}>
          <Layers size={36} className={styles.emptyIcon} />
        </div>
        <h4 className={styles.emptyTitle}>No PDF Fields Placed Yet</h4>
        <p className={styles.emptyDesc}>
          There are currently no interactive AcroForm fields detected on this PDF document.
        </p>

        <div className={styles.emptyActions}>
          {onAutoDetect && (
            <button
              type="button"
              className={styles.emptyAutoDetectBtn}
              onClick={async () => {
                await onAutoDetect();
              }}
            >
              <Sparkles size={15} />
              <span>Auto-Detect Fields from PDF</span>
            </button>
          )}

          {onBack && (
            <button
              type="button"
              className={styles.emptyBackBtn}
              onClick={onBack}
            >
              <ArrowLeft size={14} />
              <span>Back to PDF Editor</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.fourColScrollArea}>
        <div className={styles.fourColGrid}>
          {fields.map((field) => {
            const currentLeadKey = mappings[field.name] || '';
            const isMapped = Boolean(currentLeadKey);
            const badge = getFieldTypeBadge(field.type, styles);

            const isCustomTemplate =
              templateModeFields[field.name] !== undefined
                ? templateModeFields[field.name]
                : currentLeadKey.includes('{');

            return (
              <div
                key={field.id || field.name}
                className={`${styles.fieldCard} ${isMapped ? styles.fieldCardMapped : styles.fieldCardUnmapped} ${isCustomTemplate ? styles.fieldCardCustom : ''}`}
              >

                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleWrap}>
                    <span className={styles.cardFieldName} title={field.name}>
                      {field.label || field.name}
                    </span>
                    <span className={`${styles.cardTypeBadge} ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className={styles.cardHeaderActions}>

                    <button
                      type="button"
                      className={`${styles.formulaToggleBtn} ${isCustomTemplate ? styles.formulaToggleActive : ''}`}
                      onClick={() => toggleTemplateMode(field.name, currentLeadKey)}
                      title={isCustomTemplate ? 'Switch to Simple Dropdown' : 'Combine 2+ fields (Pattern mode)'}
                    >
                      <span>{'{ }'}</span>
                    </button>

                    <div className={styles.cardStatusWrap}>
                      {isMapped ? (
                        <span className={styles.cardMappedBadge} title="Mapped to CRM Lead Field">
                          <Check size={11} strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className={styles.cardUnmappedDot} title="Unmapped" />
                      )}
                    </div>
                  </div>
                </div>


                <div className={styles.cardMeta}>
                  <span className={styles.cardKeyText} title="Field API Key">
                    {field.name}
                  </span>
                  {field.pageNumber && (
                    <span className={styles.cardPageText}>P{field.pageNumber}</span>
                  )}
                </div>

                {isCustomTemplate ? (
                  <div className={styles.templateModeBox}>
                    <input
                      type="text"
                      className={styles.templatePatternInput}
                      value={currentLeadKey}
                      onChange={(e) => onMappingChange(field, e.target.value)}
                      placeholder="{field1}, {field2}..."
                      title="Type custom text or insert variables using the dropdown below"
                    />

                    <div className={styles.templateActionRow}>
                      <div className={styles.insertTagWrap}>
                        <select
                          className={styles.insertTagSelect}
                          value=""
                          onChange={(e) => {
                            const valToInsert = e.target.value;
                            if (!valToInsert) return;
                            const newPattern = currentLeadKey
                              ? `${currentLeadKey}, {${valToInsert}}`
                              : `{${valToInsert}}`;
                            onMappingChange(field, newPattern);
                          }}
                        >
                          <option value="">+ Add Variable...</option>
                          {isLoadingOptions && (
                            <option value="" disabled>Loading fields...</option>
                          )}
                          {activeGroups.map((group) => (
                            <optgroup key={group.group} label={group.group}>
                              {group.fields.map((lf) => (
                                <option key={lf.key} value={lf.key}>
                                  {lf.label || lf.key}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <Plus size={10} className={styles.insertPlusIcon} />
                      </div>

                      <button
                        type="button"
                        className={styles.switchModeBtn}
                        onClick={() => toggleTemplateMode(field.name, '')}
                        title="Switch to single dropdown"
                      >
                        Single
                      </button>
                    </div>

                  </div>
                ) : (

                  <SearchableFieldSelect
                    value={currentLeadKey}
                    onChange={(newKey) => onMappingChange(field, newKey)}
                    groups={activeGroups}
                    isLoading={isLoadingOptions}
                    ariaLabel={`Map ${field.name} to ${mappingType === 'manufacturer' ? 'Quote Field' : 'Lead Field'}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
