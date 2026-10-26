import React, { useState, useEffect } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bold,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Copy,
  Image as ImageIcon,
  Italic,
  Lock,
  Maximize2,
  Minus,
  Move,
  PenTool,
  Plus,
  Sliders,
  Sparkles,
  Trash2,
  Type,
  Upload,
  X
} from 'lucide-react';
import {
  FIELD_LABELS,
  FIELD_TYPES,
  FONT_FAMILIES
} from '../../types/fields';
import { sanitizeFieldName, formatDateDisplay, parseToIsoDate, isoToDisplayDate } from '../../utils/fieldUtils';

export function PropertiesPanel({
  selectedField,
  detectedPdfFont = 'Helvetica',
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onOpenSignatureModal,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'layout'
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [nudgeStep, setNudgeStep] = useState(1);

  // Reset tab and more options when switching to a different field
  useEffect(() => {
    setShowMoreOptions(false);
  }, [selectedField?.id]);

  if (!selectedField) {
    return (
      <aside className="properties-panel empty-state">
        <div className="panel-header">
          <div className="panel-title">
            <span>Field Properties</span>
          </div>
          {onClose && (
            <button
              type="button"
              className="close-panel-btn"
              onClick={onClose}
              title="Close Properties"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <div className="empty-panel-body">
          <div className="empty-icon-wrap">
            <Sliders size={24} />
          </div>
          <h4>No Field Selected</h4>
          <p>Click on any field on the document to customize its text, styling, size, and position.</p>
        </div>
      </aside>
    );
  }

  const handlePropChange = (key, value) => {
    onUpdateField(selectedField.id, { [key]: value });
  };

  const handleNameChange = (val) => {
    handlePropChange('name', sanitizeFieldName(val));
  };

  const handleUnifiedNameChange = (val) => {
    const cleanKey = sanitizeFieldName(val);
    onUpdateField(selectedField.id, {
      label: val,
      name: cleanKey
    });
  };

  const handleLabelChange = (newLabel) => {
    const isDefault =
      /^(text|field|date|checkbox|radio|dropdown|size|image)_\d+(_copy)?$/i.test(selectedField.name || '') ||
      /^acro_/i.test(selectedField.name || '') ||
      /^existing_/i.test(selectedField.name || '');
    const updates = { label: newLabel };
    if (isDefault && newLabel.trim()) {
      updates.name = sanitizeFieldName(newLabel);
    }
    onUpdateField(selectedField.id, updates);
  };

  const handleNudge = (dx, dy) => {
    const currentX = Number(selectedField.x) || 0;
    const currentY = Number(selectedField.y) || 0;
    const newX = Math.max(0, Math.round((currentX + dx * nudgeStep) * 10) / 10);
    const newY = Math.max(0, Math.round((currentY + dy * nudgeStep) * 10) / 10);
    onUpdateField(selectedField.id, { x: newX, y: newY });
  };

  const handleCoordChange = (prop, rawVal) => {
    const val = parseFloat(rawVal);
    if (isNaN(val)) return;
    const minVal = prop === 'width' || prop === 'height' ? 4 : 0;
    onUpdateField(selectedField.id, { [prop]: Math.max(minVal, Math.round(val * 10) / 10) });
  };

  const handleAdjustDimension = (dim, delta) => {
    const current = Number(selectedField[dim]) || (dim === 'width' ? 100 : 12);
    const minVal = dim === 'width' ? 15 : 6;
    const nextVal = Math.max(minVal, Math.round((current + delta) * 10) / 10);
    onUpdateField(selectedField.id, { [dim]: nextVal });
  };

  const handleAutoFitWidth = () => {
    const isDropdown = selectedField.type === FIELD_TYPES.DROPDOWN;
    const text = selectedField.value || selectedField.placeholder || (isDropdown ? 'Option 1' : 'Text');
    const fontPt = selectedField.fontSize || 9;
    const extraPad = isDropdown ? 26 : 14;
    const minW = isDropdown ? 75 : 36;
    const calculatedWidth = Math.max(minW, Math.ceil(text.length * fontPt * 0.65) + extraPad);
    onUpdateField(selectedField.id, { width: calculatedWidth });
  };

  const handleAdjustFontSize = (delta) => {
    const isSingleLine = (
      selectedField.type === FIELD_TYPES.TEXT ||
      selectedField.type === FIELD_TYPES.DESCRIPTION ||
      selectedField.type === FIELD_TYPES.DATE ||
      selectedField.type === FIELD_TYPES.DROPDOWN
    );
    const current = Number(selectedField.fontSize) || (isSingleLine ? 9 : 12);
    const nextVal = Math.max(6, Math.min(36, Math.round((current + delta) * 10) / 10));
    onUpdateField(selectedField.id, { fontSize: nextVal });
  };

  const handleAdjustVerticalOffset = (delta) => {
    const current = selectedField.verticalOffset !== undefined ? Number(selectedField.verticalOffset) : 1.5;
    const nextVal = Math.round((current + delta) * 10) / 10;
    onUpdateField(selectedField.id, { verticalOffset: nextVal });
  };

  const handleAddDropdownOption = () => {
    if (!newOptionInput.trim()) return;
    const currentOpts = selectedField.options || [];
    const updated = [...currentOpts, newOptionInput.trim()];
    handlePropChange('options', updated);
    setNewOptionInput('');
  };

  const handleRemoveDropdownOption = (index) => {
    const currentOpts = selectedField.options || [];
    const removedVal = currentOpts[index];
    const updated = currentOpts.filter((_, i) => i !== index);
    const updates = { options: updated };
    if (selectedField.value === removedVal) {
      updates.value = '';
    }
    onUpdateField(selectedField.id, updates);
  };

  const friendlyType = FIELD_LABELS[selectedField.type] || selectedField.type;
  const isTextField =
    selectedField.type === FIELD_TYPES.TEXT ||
    selectedField.type === FIELD_TYPES.DESCRIPTION ||
    selectedField.type === FIELD_TYPES.TEXTAREA ||
    selectedField.type === FIELD_TYPES.DATE;

  const hasTypography =
    isTextField || selectedField.type === FIELD_TYPES.DROPDOWN;

  const currentFontSize =
    selectedField.fontSize || ((selectedField.type === FIELD_TYPES.TEXT || selectedField.type === FIELD_TYPES.DESCRIPTION || selectedField.type === FIELD_TYPES.DATE) ? 9 : 12);
  const currentTextColor =
    selectedField.textColor && selectedField.textColor !== '#ffffff'
      ? selectedField.textColor
      : '#000000';
  const currentBgColor = selectedField.backgroundColor || 'transparent';
  const currentVerticalOffset =
    selectedField.verticalOffset !== undefined ? selectedField.verticalOffset : 1.5;

  return (
    <aside className="properties-panel">
      {/* 1. Header with Title & Quick Actions */}
      <div className="sp-panel-header">
        <div className="sp-header-title-wrap">
          <span className="sp-type-badge">{friendlyType}</span>
          <span className="sp-page-pill">Page {selectedField.pageNumber}</span>
        </div>
        <div className="sp-header-actions">
          <button
            type="button"
            id="btn-duplicate-field"
            className="sp-header-btn"
            onClick={() => onDuplicateField(selectedField.id)}
            title="Duplicate field"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            id="btn-delete-field"
            className="sp-header-btn sp-delete-btn"
            onClick={() => onDeleteField(selectedField.id)}
            title="Delete field"
          >
            <Trash2 size={13} />
          </button>
          {onClose && (
            <button
              type="button"
              className="sp-header-btn sp-close-btn"
              onClick={onClose}
              title="Close panel"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Simplified Segmented Tabs */}
      <div className="sp-tabs-bar">
        <button
          type="button"
          className={`sp-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <Sliders size={13} />
          <span>Properties</span>
        </button>
        <button
          type="button"
          className={`sp-tab-btn ${activeTab === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveTab('layout')}
        >
          <Move size={13} />
          <span>Size & Position</span>
        </button>
      </div>

      {/* 3. Panel Body */}
      <div className="sp-panel-body">
        {/* ========================================================================= */}
        {/* TAB 1: PROPERTIES (Text, Typography, Rules, Content)                     */}
        {/* ========================================================================= */}
        {activeTab === 'general' && (
          <div className="sp-tab-content">
            {/* Primary Field Content: Text / Value / Label */}
            {isTextField && (
              <div className="sp-card">
                <div className="sp-field-group">
                  <label htmlFor="prop-field-val" className="sp-label">
                    Text / Value
                  </label>
                  {selectedField.type === FIELD_TYPES.TEXTAREA ? (
                    <textarea
                      id="prop-field-val"
                      rows={2}
                      className="sp-input sp-textarea"
                      value={selectedField.value || ''}
                      onChange={(e) => handlePropChange('value', e.target.value)}
                      placeholder="Type text here..."
                    />
                  ) : selectedField.type === FIELD_TYPES.DATE ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        id="prop-field-val"
                        type="text"
                        className="sp-input"
                        value={selectedField.value || ''}
                        onChange={(e) => handlePropChange('value', e.target.value)}
                        placeholder="DD/MM/YYYY"
                        style={{ flex: 1 }}
                      />
                      <input
                        type="date"
                        value={parseToIsoDate(selectedField.value)}
                        onChange={(e) => {
                          const fmt = selectedField.dateFormat || 'DD/MM/YYYY';
                          handlePropChange('value', isoToDisplayDate(e.target.value, fmt));
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          padding: '0 4px',
                          colorScheme: 'dark',
                          backgroundColor: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        title="Pick date from calendar"
                      />
                    </div>
                  ) : (
                    <input
                      id="prop-field-val"
                      type="text"
                      className="sp-input"
                      value={selectedField.value || ''}
                      onChange={(e) => handlePropChange('value', e.target.value)}
                      placeholder="Type text here..."
                    />
                  )}
                </div>

                {selectedField.type === FIELD_TYPES.DATE && (
                  <div className="sp-field-group" style={{ marginTop: '8px' }}>
                    <label htmlFor="prop-field-date-format" className="sp-label">
                      Date Format
                    </label>
                    <select
                      id="prop-field-date-format"
                      className="sp-input sp-select"
                      value={selectedField.dateFormat || 'DD/MM/YYYY'}
                      onChange={(e) => {
                        const newFormat = e.target.value;
                        const updates = { dateFormat: newFormat };
                        if (selectedField.value) {
                          updates.value = formatDateDisplay(selectedField.value, newFormat);
                        }
                        onUpdateField(selectedField.id, updates);
                      }}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 01/10/2026)</option>
                      <option value="DD-MM-YYYY">DD-MM-YYYY (e.g. 01-10-2026)</option>
                      <option value="DD MM YYYY">DD MM YYYY (e.g. 01 10 2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-01)</option>
                    </select>
                  </div>
                )}

                <div className="sp-field-group" style={{ marginTop: '8px' }}>
                  <label htmlFor="prop-field-label" className="sp-label">
                    Field Name
                  </label>
                  <input
                    id="prop-field-label"
                    type="text"
                    className="sp-input"
                    value={selectedField.label !== undefined ? selectedField.label : (selectedField.name || '')}
                    onChange={(e) => handleUnifiedNameChange(e.target.value)}
                    placeholder="e.g. Full Name, Lead Owner, City"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#78716c' }}>
                    <span>API Key: <code style={{ color: '#fb923c', background: '#1c1917', padding: '1px 5px', borderRadius: '3px' }}>{selectedField.name || '(empty)'}</code></span>
                  </div>
                </div>
              </div>
            )}

            {/* Checkbox Specific Content */}
            {selectedField.type === FIELD_TYPES.CHECKBOX && (
              <div className="sp-card">
                <div className="sp-field-group">
                  <label htmlFor="prop-cb-label" className="sp-label">
                    Field Name
                  </label>
                  <input
                    id="prop-cb-label"
                    type="text"
                    className="sp-input"
                    value={selectedField.label !== undefined ? selectedField.label : (selectedField.name || '')}
                    onChange={(e) => handleUnifiedNameChange(e.target.value)}
                    placeholder="e.g. Terms Accepted"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#78716c' }}>
                    <span>API Key: <code style={{ color: '#fb923c', background: '#1c1917', padding: '1px 5px', borderRadius: '3px' }}>{selectedField.name || '(empty)'}</code></span>
                  </div>
                </div>
                <div
                  className={`sp-toggle-row ${selectedField.checked ? 'is-active' : ''}`}
                  onClick={() => handlePropChange('checked', !selectedField.checked)}
                  style={{ marginTop: '10px' }}
                >
                  <div className="sp-toggle-info">
                    <span className="sp-toggle-title">Checked by default</span>
                    <span className="sp-toggle-hint">Initial state when form loads</span>
                  </div>
                  <div className={`sp-switch ${selectedField.checked ? 'checked' : ''}`}>
                    <span className="sp-switch-thumb" />
                  </div>
                </div>
              </div>
            )}

            {/* Radio Specific Content */}
            {selectedField.type === FIELD_TYPES.RADIO && (
              <div className="sp-card">
                <div className="sp-field-group">
                  <label htmlFor="prop-radio-label" className="sp-label">
                    Field Name
                  </label>
                  <input
                    id="prop-radio-label"
                    type="text"
                    className="sp-input"
                    value={selectedField.label !== undefined ? selectedField.label : (selectedField.name || '')}
                    onChange={(e) => handleUnifiedNameChange(e.target.value)}
                    placeholder="e.g. Option 1"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#78716c' }}>
                    <span>API Key: <code style={{ color: '#fb923c', background: '#1c1917', padding: '1px 5px', borderRadius: '3px' }}>{selectedField.name || '(empty)'}</code></span>
                  </div>
                </div>
                <div className="sp-field-row" style={{ marginTop: '8px' }}>
                  <div className="sp-field-group" style={{ flex: 1 }}>
                    <label htmlFor="prop-radio-group" className="sp-label">
                      Group Name
                    </label>
                    <input
                      id="prop-radio-group"
                      type="text"
                      className="sp-input"
                      value={selectedField.groupName || ''}
                      onChange={(e) =>
                        handlePropChange('groupName', sanitizeFieldName(e.target.value))
                      }
                      placeholder="e.g. gender"
                    />
                  </div>
                  <div className="sp-field-group" style={{ flex: 1 }}>
                    <label htmlFor="prop-radio-val" className="sp-label">
                      Value
                    </label>
                    <input
                      id="prop-radio-val"
                      type="text"
                      className="sp-input"
                      value={selectedField.optionValue || ''}
                      onChange={(e) => handlePropChange('optionValue', e.target.value)}
                      placeholder="e.g. male"
                    />
                  </div>
                </div>
                <div
                  className={`sp-toggle-row ${selectedField.checked ? 'is-active' : ''}`}
                  onClick={() => handlePropChange('checked', !selectedField.checked)}
                  style={{ marginTop: '10px' }}
                >
                  <div className="sp-toggle-info">
                    <span className="sp-toggle-title">Selected by default</span>
                  </div>
                  <div className={`sp-switch ${selectedField.checked ? 'checked' : ''}`}>
                    <span className="sp-switch-thumb" />
                  </div>
                </div>
              </div>
            )}

            {/* Dropdown Specific Content */}
            {selectedField.type === FIELD_TYPES.DROPDOWN && (
              <div className="sp-card">
                <div className="sp-field-group">
                  <label htmlFor="prop-dd-label" className="sp-label">
                    Field Name
                  </label>
                  <input
                    id="prop-dd-label"
                    type="text"
                    className="sp-input"
                    value={selectedField.label !== undefined ? selectedField.label : (selectedField.name || '')}
                    onChange={(e) => handleUnifiedNameChange(e.target.value)}
                    placeholder="e.g. Select Option"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#78716c' }}>
                    <span>API Key: <code style={{ color: '#fb923c', background: '#1c1917', padding: '1px 5px', borderRadius: '3px' }}>{selectedField.name || '(empty)'}</code></span>
                  </div>
                </div>

                <div className="sp-field-group" style={{ marginTop: '10px' }}>
                  <label htmlFor="prop-dd-placeholder" className="sp-label">
                    Placeholder Text
                  </label>
                  <input
                    id="prop-dd-placeholder"
                    type="text"
                    className="sp-input"
                    value={selectedField.placeholder !== undefined ? selectedField.placeholder : 'Select...'}
                    onChange={(e) => handlePropChange('placeholder', e.target.value)}
                    placeholder="e.g. Select an option..."
                  />
                </div>

                <div className="sp-field-group" style={{ marginTop: '10px' }}>
                  <label htmlFor="prop-dd-value" className="sp-label">
                    Default / Selected Value
                  </label>
                  <select
                    id="prop-dd-value"
                    className="sp-input sp-select"
                    value={selectedField.value || ''}
                    onChange={(e) => handlePropChange('value', e.target.value)}
                  >
                    <option value="">-- None (Show Placeholder) --</option>
                    {(selectedField.options || []).map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sp-field-group" style={{ marginTop: '10px' }}>
                  <label className="sp-label">Options List</label>
                  <div className="sp-options-list">
                    {(selectedField.options || []).length === 0 ? (
                      <div className="sp-empty-options">No options added yet</div>
                    ) : (
                      (selectedField.options || []).map((opt, idx) => {
                        const isOptSelected = selectedField.value === opt;
                        return (
                          <div key={idx} className={`sp-option-item ${isOptSelected ? 'is-selected' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              className={`sp-opt-select-btn ${isOptSelected ? 'active' : ''}`}
                              onClick={() => handlePropChange('value', isOptSelected ? '' : opt)}
                              title={isOptSelected ? 'Currently selected (click to deselect)' : 'Set as selected value'}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: isOptSelected ? '#38bdf8' : '#78716c',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <Check size={12} strokeWidth={isOptSelected ? 3 : 1.5} />
                            </button>
                            <span className="sp-option-text" style={{ flex: 1, fontWeight: isOptSelected ? 600 : 400, color: isOptSelected ? '#f8fafc' : undefined }}>{opt}</span>
                            <button
                              type="button"
                              className="sp-remove-opt-btn"
                              onClick={() => handleRemoveDropdownOption(idx)}
                              title="Remove"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="sp-add-opt-row">
                    <input
                      type="text"
                      className="sp-input"
                      value={newOptionInput}
                      onChange={(e) => setNewOptionInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddDropdownOption()}
                      placeholder="Add an option..."
                    />
                    <button
                      type="button"
                      className="sp-btn-secondary"
                      onClick={handleAddDropdownOption}
                      title="Add option"
                    >
                      <Plus size={13} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Signature Specific Content */}
            {selectedField.type === FIELD_TYPES.SIGNATURE && (
              <div className="sp-card">
                <div className="sp-field-group">
                  <label htmlFor="prop-field-label" className="sp-label">
                    Display Label
                  </label>
                  <input
                    id="prop-field-label"
                    type="text"
                    className="sp-input"
                    value={selectedField.label || ''}
                    onChange={(e) => handlePropChange('label', e.target.value)}
                    placeholder="e.g. Authorized Signature"
                  />
                </div>

                <div style={{ marginTop: '12px' }}>
                  {selectedField.signatureDataUrl ? (
                    <div className="sp-sig-preview-card">
                      <div className="sp-sig-img-wrap">
                        <img
                          src={selectedField.signatureDataUrl}
                          alt="Signature Preview"
                          className="sp-sig-img"
                        />
                      </div>
                      <div className="sp-field-row" style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          className="sp-btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => onOpenSignatureModal(selectedField)}
                        >
                          <PenTool size={13} />
                          <span>Change</span>
                        </button>
                        <button
                          type="button"
                          className="sp-btn-danger"
                          onClick={() => handlePropChange('signatureDataUrl', null)}
                          title="Clear signature"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="sp-btn-primary full-width"
                      onClick={() => onOpenSignatureModal(selectedField)}
                    >
                      <PenTool size={14} />
                      <span>Sign Field Now</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Image Specific Content */}
            {selectedField.type === FIELD_TYPES.IMAGE && (
              <div className="sp-card">
                <div className="sp-field-group">
                  <label htmlFor="prop-image-label" className="sp-label">
                    Image Label
                  </label>
                  <input
                    id="prop-image-label"
                    type="text"
                    className="sp-input"
                    value={selectedField.label !== undefined ? selectedField.label : (selectedField.name || '')}
                    onChange={(e) => handleUnifiedNameChange(e.target.value)}
                    placeholder="e.g. Company Logo, Header Image"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#78716c' }}>
                    <span>API Key: <code style={{ color: '#fb923c', background: '#1c1917', padding: '1px 5px', borderRadius: '3px' }}>{selectedField.name || '(empty)'}</code></span>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label className="sp-label" style={{ marginBottom: '6px', display: 'block' }}>Image File</label>
                  {selectedField.imageUrl || selectedField.value ? (
                    <div className="sp-image-preview-card">
                      <div className="sp-image-thumb-wrap">
                        <img
                          src={selectedField.imageUrl || selectedField.value}
                          alt={selectedField.label || 'Image Preview'}
                          className="sp-image-thumb"
                          style={{
                            objectFit: selectedField.objectFit || 'contain'
                          }}
                        />
                      </div>
                      <div className="sp-field-row" style={{ marginTop: '8px', gap: '8px' }}>
                        <label className="sp-btn-primary" style={{ flex: 1, cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                          <Upload size={13} />
                          <span>Change</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  onUpdateField(selectedField.id, {
                                    imageUrl: ev.target.result,
                                    value: ev.target.result
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          className="sp-btn-danger"
                          onClick={() => onUpdateField(selectedField.id, { imageUrl: null, value: '' })}
                          title="Remove image"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label
                        className="sp-btn-primary full-width"
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 14px' }}
                      >
                        <Upload size={15} />
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                onUpdateField(selectedField.id, {
                                  imageUrl: ev.target.result,
                                  value: ev.target.result,
                                  label: (!selectedField.label || /^(image|field)_\d+/i.test(selectedField.label))
                                    ? file.name.replace(/\.[^/.]+$/, "")
                                    : selectedField.label
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <p style={{ fontSize: '11px', color: '#78716c', marginTop: '6px', textAlign: 'center' }}>
                        Supports PNG, JPG, JPEG, WEBP & SVG
                      </p>
                    </div>
                  )}
                </div>

                {/* Sizing & Fit Options */}
                <div style={{ marginTop: '14px' }}>
                  <label className="sp-label" style={{ marginBottom: '6px', display: 'block' }}>Scaling / Fit Mode</label>
                  <div className="sp-btn-group" style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { id: 'contain', label: 'Fit (Contain)' },
                      { id: 'cover', label: 'Crop (Cover)' },
                      { id: 'fill', label: 'Stretch (Fill)' }
                    ].map((fit) => (
                      <button
                        key={fit.id}
                        type="button"
                        className={`sp-btn-secondary ${((selectedField.objectFit || 'contain') === fit.id) ? 'active' : ''}`}
                        style={{
                          flex: 1,
                          fontSize: '11px',
                          padding: '6px 4px',
                          background: (selectedField.objectFit || 'contain') === fit.id ? '#2563eb' : undefined,
                          color: (selectedField.objectFit || 'contain') === fit.id ? '#ffffff' : undefined,
                          borderColor: (selectedField.objectFit || 'contain') === fit.id ? '#2563eb' : undefined
                        }}
                        onClick={() => handlePropChange('objectFit', fit.id)}
                      >
                        {fit.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border & Opacity Styling */}
                <div style={{ marginTop: '14px', borderTop: '1px solid #292524', paddingTop: '12px' }}>
                  <div className="sp-field-row" style={{ gap: '8px', marginBottom: '8px' }}>
                    <div className="sp-field-group" style={{ flex: 1 }}>
                      <label className="sp-label">Border</label>
                      <select
                        className="sp-input sp-select"
                        value={selectedField.borderWidth || 0}
                        onChange={(e) => handlePropChange('borderWidth', Number(e.target.value))}
                      >
                        <option value={0}>None</option>
                        <option value={1}>1px solid</option>
                        <option value={2}>2px solid</option>
                        <option value={3}>3px solid</option>
                      </select>
                    </div>
                    {Number(selectedField.borderWidth) > 0 && (
                      <div className="sp-field-group" style={{ width: '60px' }}>
                        <label className="sp-label">Color</label>
                        <input
                          type="color"
                          className="sp-input"
                          style={{ padding: '2px', height: '32px', cursor: 'pointer' }}
                          value={selectedField.borderColor || '#000000'}
                          onChange={(e) => handlePropChange('borderColor', e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="sp-field-row" style={{ gap: '8px' }}>
                    <div className="sp-field-group" style={{ flex: 1 }}>
                      <label className="sp-label">Opacity ({Math.round(((selectedField.opacity !== undefined ? selectedField.opacity : 1) * 100))}%)</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={selectedField.opacity !== undefined ? selectedField.opacity : 1}
                        onChange={(e) => handlePropChange('opacity', parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#2563eb' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typography & Style Toolbar (For Text/Textarea/Date/Dropdown) */}
            {hasTypography && (
              <div className="sp-card">
                <div className="sp-card-header-row">
                  <span className="sp-card-title">Typography & Style</span>
                  {detectedPdfFont && (
                    <span className="sp-val-badge" title="Font detected from PDF document">
                      PDF: {detectedPdfFont}
                    </span>
                  )}
                </div>

                {/* Font Family Selector */}
                <div className="sp-field-group" style={{ marginBottom: '8px', marginTop: '5px' }}>
                  <select
                    id="prop-field-font"
                    className="sp-input sp-select"
                    value={selectedField.fontFamily || detectedPdfFont || 'Helvetica'}
                    onChange={(e) => handlePropChange('fontFamily', e.target.value)}
                    title="Font Family"
                  >
                    {detectedPdfFont && (
                      <option value={detectedPdfFont}>
                        {detectedPdfFont} (Default from PDF)
                      </option>
                    )}
                    {FONT_FAMILIES.filter((f) => f.id !== detectedPdfFont).map((f) => (
                      <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 1: Font Size Stepper + B, I, AA */}
                <div className="sp-formatting-bar">
                  {/* Font Size Stepper */}
                  <div className="sp-fs-stepper">
                    <button
                      type="button"
                      id="btn-dec-fs"
                      className="sp-step-btn"
                      onClick={() => handleAdjustFontSize(-1)}
                      title="Smaller (-1 pt)"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="sp-fs-label">{currentFontSize} pt</span>
                    <button
                      type="button"
                      id="btn-inc-fs"
                      className="sp-step-btn"
                      onClick={() => handleAdjustFontSize(1)}
                      title="Larger (+1 pt)"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  <div className="sp-divider" />

                  {/* B, I, AA */}
                  <div className="sp-btn-group">
                    <button
                      type="button"
                      id="btn-toggle-bold"
                      className={`sp-fmt-btn ${selectedField.bold ? 'active' : ''}`}
                      onClick={() => handlePropChange('bold', !selectedField.bold)}
                      title="Bold"
                    >
                      <Bold size={13} strokeWidth={2.6} />
                    </button>
                    <button
                      type="button"
                      id="btn-toggle-italic"
                      className={`sp-fmt-btn ${selectedField.italic ? 'active' : ''}`}
                      onClick={() => handlePropChange('italic', !selectedField.italic)}
                      title="Italic"
                    >
                      <Italic size={13} strokeWidth={2.4} />
                    </button>
                    <button
                      type="button"
                      id="btn-toggle-caps"
                      className={`sp-fmt-btn sp-caps-btn ${selectedField.uppercase ? 'active' : ''}`}
                      onClick={() => handlePropChange('uppercase', !selectedField.uppercase)}
                      title="ALL CAPS"
                    >
                      <span>AA</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: Horizontal & Vertical Alignment */}
                <div className="sp-formatting-bar" style={{ marginTop: '6px' }}>
                  {/* Horizontal Alignment */}
                  <div className="sp-btn-group" style={{ flex: 1, justifyContent: 'center' }}>
                    <button
                      type="button"
                      id="btn-align-left"
                      className={`sp-fmt-btn ${(!selectedField.alignment || selectedField.alignment === 'left') ? 'active' : ''}`}
                      onClick={() => handlePropChange('alignment', 'left')}
                      title="Align Left"
                    >
                      <AlignLeft size={13} />
                    </button>
                    <button
                      type="button"
                      id="btn-align-center"
                      className={`sp-fmt-btn ${selectedField.alignment === 'center' ? 'active' : ''}`}
                      onClick={() => handlePropChange('alignment', 'center')}
                      title="Align Center"
                    >
                      <AlignCenter size={13} />
                    </button>
                    <button
                      type="button"
                      id="btn-align-right"
                      className={`sp-fmt-btn ${selectedField.alignment === 'right' ? 'active' : ''}`}
                      onClick={() => handlePropChange('alignment', 'right')}
                      title="Align Right"
                    >
                      <AlignRight size={13} />
                    </button>
                  </div>

                  <div className="sp-divider" />

                  {/* Vertical Alignment (Top, Center, Bottom) */}
                  <div className="sp-btn-group" style={{ flex: 1, justifyContent: 'center' }}>
                    <button
                      type="button"
                      id="btn-valign-top"
                      className={`sp-fmt-btn ${selectedField.verticalAlign === 'top' ? 'active' : ''}`}
                      onClick={() => handlePropChange('verticalAlign', 'top')}
                      title="Align Top"
                    >
                      <AlignVerticalJustifyStart size={13} />
                    </button>
                    <button
                      type="button"
                      id="btn-valign-center"
                      className={`sp-fmt-btn ${selectedField.verticalAlign === 'center' ? 'active' : ''}`}
                      onClick={() => handlePropChange('verticalAlign', 'center')}
                      title="Align Middle / Center"
                    >
                      <AlignVerticalJustifyCenter size={13} />
                    </button>
                    <button
                      type="button"
                      id="btn-valign-bottom"
                      className={`sp-fmt-btn ${(!selectedField.verticalAlign || selectedField.verticalAlign === 'bottom') ? 'active' : ''}`}
                      onClick={() => handlePropChange('verticalAlign', 'bottom')}
                      title="Align Bottom (Default)"
                    >
                      <AlignVerticalJustifyEnd size={13} />
                    </button>
                  </div>
                </div>

                {/* Text Color Swatches */}
                <div className="sp-color-row">
                  <span className="sp-sub-label">Color:</span>
                  <div className="sp-swatch-list">
                    {[
                      { color: '#000000', title: 'Black' },
                      { color: '#334155', title: 'Slate' },
                      { color: '#c02131', title: 'Red' },
                      { color: '#1d4ed8', title: 'Blue' },
                      { color: '#10b981', title: 'Emerald' }
                    ].map((s) => (
                      <button
                        key={s.color}
                        type="button"
                        className={`sp-swatch-dot ${currentTextColor.toLowerCase() === s.color ? 'active' : ''}`}
                        style={{ backgroundColor: s.color }}
                        onClick={() => handlePropChange('textColor', s.color)}
                        title={s.title}
                      />
                    ))}
                    {/* Custom Picker Thumb */}
                    <div className="sp-custom-color-thumb" title="Custom Color">
                      <input
                        id="prop-field-color"
                        type="color"
                        value={currentTextColor}
                        onChange={(e) => handlePropChange('textColor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Field Rules: Required & Read-Only Toggles */}
            <div className="sp-card">
              <div className="sp-card-title">Field Rules</div>
              <div className="sp-toggles-stack">
                <div
                  className={`sp-toggle-row ${selectedField.required ? 'is-active' : ''}`}
                  onClick={() => handlePropChange('required', !selectedField.required)}
                >
                  <div className="sp-toggle-info">
                    <span className="sp-toggle-title">Required Field</span>
                    <span className="sp-toggle-hint">Cannot be left blank</span>
                  </div>
                  <div className={`sp-switch ${selectedField.required ? 'checked' : ''}`}>
                    <span className="sp-switch-thumb" />
                  </div>
                </div>

                <div
                  className={`sp-toggle-row ${selectedField.readOnly ? 'is-active' : ''}`}
                  onClick={() => handlePropChange('readOnly', !selectedField.readOnly)}
                >
                  <div className="sp-toggle-info">
                    <span className="sp-toggle-title">Read Only</span>
                    <span className="sp-toggle-hint">Locked for editing</span>
                  </div>
                  <div className={`sp-switch ${selectedField.readOnly ? 'checked' : ''}`}>
                    <span className="sp-switch-thumb" />
                  </div>
                </div>
              </div>
            </div>

            {/* More Settings (Collapsible Accordion) */}
            <div className="sp-more-accordion">
              <button
                type="button"
                className="sp-more-toggle-btn"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
              >
                <span>{showMoreOptions ? 'Fewer Options' : 'More Options'}</span>
                {showMoreOptions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {showMoreOptions && (
                <div className="sp-more-content">
                  {/* Placeholder hint (for text fields) */}
                  {isTextField && (
                    <div className="sp-field-group">
                      <label htmlFor="prop-field-ph" className="sp-label">
                        Placeholder Hint
                      </label>
                      <input
                        id="prop-field-ph"
                        type="text"
                        className="sp-input"
                        value={selectedField.placeholder || ''}
                        onChange={(e) => handlePropChange('placeholder', e.target.value)}
                        placeholder="Leave blank or type hint..."
                      />
                    </div>
                  )}

                  {/* Baseline Offset / Vertical Lift */}
                  {isTextField && (
                    <div className="sp-field-group" style={{ marginTop: '8px' }}>
                      <div className="sp-label-with-curr">
                        <label htmlFor="prop-field-voffset" className="sp-label">
                          Baseline Lift
                        </label>
                        <span className="sp-val-badge">{currentVerticalOffset} pt</span>
                      </div>
                      <div className="sp-dim-stepper-row">
                        <button
                          type="button"
                          id="btn-dec-voffset"
                          className="sp-step-btn"
                          onClick={() => handleAdjustVerticalOffset(-0.5)}
                          title="Lower text (-0.5 pt)"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <input
                          id="prop-field-voffset"
                          type="number"
                          className="sp-input text-center"
                          value={currentVerticalOffset}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) handlePropChange('verticalOffset', val);
                          }}
                          step="0.5"
                        />
                        <button
                          type="button"
                          id="btn-inc-voffset"
                          className="sp-step-btn"
                          onClick={() => handleAdjustVerticalOffset(0.5)}
                          title="Lift text (+0.5 pt)"
                        >
                          <ArrowUp size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Background Color */}
                  {isTextField && (
                    <div className="sp-field-group" style={{ marginTop: '8px' }}>
                      <label className="sp-label">Background Color</label>
                      <div className="sp-swatch-list">
                        <button
                          type="button"
                          className={`sp-swatch-dot trans ${currentBgColor === 'transparent' ? 'active' : ''}`}
                          onClick={() => handlePropChange('backgroundColor', 'transparent')}
                          title="Transparent"
                        >
                          Ø
                        </button>
                        <button
                          type="button"
                          className={`sp-swatch-dot ${currentBgColor === '#ffffff' ? 'active' : ''}`}
                          style={{ backgroundColor: '#ffffff' }}
                          onClick={() => handlePropChange('backgroundColor', '#ffffff')}
                          title="White"
                        />
                        <button
                          type="button"
                          className={`sp-swatch-dot ${currentBgColor === '#fff2cc' ? 'active' : ''}`}
                          style={{ backgroundColor: '#fff2cc' }}
                          onClick={() => handlePropChange('backgroundColor', '#fff2cc')}
                          title="Cream Yellow"
                        />
                        <div className="sp-custom-color-thumb" title="Custom Background">
                          <input
                            id="prop-field-bg"
                            type="color"
                            value={currentBgColor === 'transparent' ? '#ffffff' : currentBgColor}
                            onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="sp-tab-content">
            {/* Dimensions (Width & Height) */}
            <div className="sp-card">
              <div className="sp-card-header-row">
                <span className="sp-card-title">Dimensions</span>
                {hasTypography && (
                  <button
                    type="button"
                    className="sp-autofit-btn"
                    onClick={handleAutoFitWidth}
                    title="Auto-fit width to text length"
                  >
                    <Sparkles size={11} />
                    <span>Auto-Fit</span>
                  </button>
                )}
              </div>

              <div className="sp-field-row" style={{ marginTop: '6px' }}>
                {/* Width */}
                <div className="sp-field-group" style={{ flex: 1 }}>
                  <label htmlFor="dim-width-input" className="sp-label">
                    Width (pt)
                  </label>
                  <div className="sp-dim-stepper-row">
                    <button
                      type="button"
                      id="btn-dec-width"
                      className="sp-step-btn"
                      onClick={() => handleAdjustDimension('width', -5)}
                      title="-5 pt"
                    >
                      <Minus size={11} />
                    </button>
                    <input
                      id="dim-width-input"
                      type="number"
                      className="sp-input text-center"
                      value={Math.round(selectedField.width ?? 0)}
                      onChange={(e) => handleCoordChange('width', e.target.value)}
                      step="1"
                      min="15"
                    />
                    <button
                      type="button"
                      id="btn-inc-width"
                      className="sp-step-btn"
                      onClick={() => handleAdjustDimension('width', 5)}
                      title="+5 pt"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>

                {/* Height */}
                <div className="sp-field-group" style={{ flex: 1 }}>
                  <label htmlFor="dim-height-input" className="sp-label">
                    Height (pt)
                  </label>
                  <div className="sp-dim-stepper-row">
                    <button
                      type="button"
                      id="btn-dec-height"
                      className="sp-step-btn"
                      onClick={() => handleAdjustDimension('height', -1)}
                      title="-1 pt"
                    >
                      <Minus size={11} />
                    </button>
                    <input
                      id="dim-height-input"
                      type="number"
                      className="sp-input text-center"
                      value={Math.round((selectedField.height ?? 0) * 10) / 10}
                      onChange={(e) => handleCoordChange('height', e.target.value)}
                      step="0.5"
                      min="6"
                    />
                    <button
                      type="button"
                      id="btn-inc-height"
                      className="sp-step-btn"
                      onClick={() => handleAdjustDimension('height', 1)}
                      title="+1 pt"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Width Presets */}
              <div className="sp-quick-pills-row" style={{ marginTop: '8px' }}>
                <span className="sp-sub-label">Width:</span>
                {[60, 100, 150, 200, 260].map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`sp-quick-pill ${Math.round(selectedField.width) === w ? 'active' : ''}`}
                    onClick={() => onUpdateField(selectedField.id, { width: w })}
                  >
                    {w}
                  </button>
                ))}
              </div>

              {/* Quick Height Presets */}
              <div className="sp-quick-pills-row" style={{ marginTop: '6px' }}>
                <span className="sp-sub-label">Height:</span>
                {[10, 11, 12, 14, 18].map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`sp-quick-pill ${Math.round(selectedField.height) === h ? 'active' : ''}`}
                    onClick={() => onUpdateField(selectedField.id, { height: h })}
                  >
                    {h}pt
                  </button>
                ))}
                <button
                  type="button"
                  className="sp-quick-pill"
                  style={{ color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.1)' }}
                  onClick={() => onUpdateField(selectedField.id, { height: 11.5, verticalOffset: 1.5 })}
                  title="Fit height snugly inside table cell borders without overflowing"
                >
                  📐 Fit Cell (11.5pt)
                </button>
              </div>
            </div>

            {/* Position Coordinates (X, Y) */}
            <div className="sp-card">
              <div className="sp-card-title">Coordinates</div>
              <div className="sp-field-row" style={{ marginTop: '6px' }}>
                <div className="sp-field-group" style={{ flex: 1 }}>
                  <label htmlFor="field-coord-x" className="sp-label">
                    X (pt)
                  </label>
                  <input
                    id="field-coord-x"
                    type="number"
                    className="sp-input text-center"
                    value={Math.round(selectedField.x ?? 0)}
                    onChange={(e) => handleCoordChange('x', e.target.value)}
                    step="1"
                    min="0"
                  />
                </div>
                <div className="sp-field-group" style={{ flex: 1 }}>
                  <label htmlFor="field-coord-y" className="sp-label">
                    Y (pt)
                  </label>
                  <input
                    id="field-coord-y"
                    type="number"
                    className="sp-input text-center"
                    value={Math.round(selectedField.y ?? 0)}
                    onChange={(e) => handleCoordChange('y', e.target.value)}
                    step="1"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Mini Precision Move / Nudge Controller */}
            <div className="sp-card">
              <div className="sp-card-header-row">
                <span className="sp-card-title">Fine Adjustment</span>
                <div className="sp-step-toggle-bar">
                  {[1, 5, 10].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`sp-step-pill ${nudgeStep === s ? 'active' : ''}`}
                      onClick={() => setNudgeStep(s)}
                    >
                      {s}pt
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Sleek Directional Pad */}
              <div className="sp-mini-dpad-wrap">
                <button
                  type="button"
                  id="btn-nudge-up"
                  className="sp-dpad-btn up"
                  onClick={() => handleNudge(0, -1)}
                  title={`Move Up (${nudgeStep} pt)`}
                >
                  <ArrowUp size={13} />
                </button>
                <div className="sp-dpad-mid-row">
                  <button
                    type="button"
                    id="btn-nudge-left"
                    className="sp-dpad-btn left"
                    onClick={() => handleNudge(-1, 0)}
                    title={`Move Left (${nudgeStep} pt)`}
                  >
                    <ArrowLeft size={13} />
                  </button>
                  <div className="sp-dpad-center">
                    <Move size={12} />
                  </div>
                  <button
                    type="button"
                    id="btn-nudge-right"
                    className="sp-dpad-btn right"
                    onClick={() => handleNudge(1, 0)}
                    title={`Move Right (${nudgeStep} pt)`}
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>
                <button
                  type="button"
                  id="btn-nudge-down"
                  className="sp-dpad-btn down"
                  onClick={() => handleNudge(0, 1)}
                  title={`Move Down (${nudgeStep} pt)`}
                >
                  <ArrowDown size={13} />
                </button>
              </div>

              <div className="sp-hint-text">
                Tip: You can also use arrow keys on your keyboard
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default PropertiesPanel;
