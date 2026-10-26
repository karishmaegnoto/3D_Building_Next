import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown, Copy, Image as ImageIcon, Move, PenTool, Trash2 } from 'lucide-react';
import { FIELD_TYPES, MIN_FIELD_DIMENSIONS } from '../../types/fields';
import { clampFieldToPage, fieldPdfToScreen, screenToPdf } from '../../utils/pdfCoordinates';
import { sanitizeFieldName, formatDateDisplay, parseToIsoDate, isoToDisplayDate } from '../../utils/fieldUtils';

export function FieldItem({
  field,
  scale,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenSignatureModal,
  pageWidth,
  pageHeight
}) {
  const itemRef = useRef(null);
  const imageInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (dataUrl) {
        onUpdate(field.id, {
          imageUrl: dataUrl,
          value: dataUrl,
          label: (!field.label || /^(image|field)_\d+/i.test(field.label))
            ? file.name.replace(/\.[^/.]+$/, "")
            : field.label
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const screenCoords = fieldPdfToScreen(field, scale);

  // Dragging logic
  const handleDragStart = (e) => {
    // Only drag on left click
    if (e.button !== 0) return;

    // If clicking action buttons or resize handles, don't initiate drag
    if (
      e.target.closest('.field-action-btn') ||
      e.target.closest('.resize-handle')
    ) {
      return;
    }

    onSelect(field.id);

    const isDragHandle = Boolean(e.target.closest('.field-drag-handle'));
    const isFieldContent = Boolean(e.target.closest('.field-content-wrap'));
    const isInputElement = ['input', 'textarea'].includes(e.target.tagName?.toLowerCase()) || isFieldContent;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialFieldX = field.x;
    const initialFieldY = field.y;
    let hasMoved = false;

    const onMouseMove = (moveEvent) => {
      const deltaScreenX = moveEvent.clientX - startX;
      const deltaScreenY = moveEvent.clientY - startY;

      // Small 4px drag threshold for inputs so normal clicks place the text cursor
      if (isInputElement && !isDragHandle && !hasMoved && Math.hypot(deltaScreenX, deltaScreenY) < 4) {
        return;
      }

      if (!hasMoved) {
        hasMoved = true;
        setIsDragging(true);
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
      }

      const deltaPdfX = screenToPdf(deltaScreenX, scale);
      const deltaPdfY = screenToPdf(deltaScreenY, scale);

      const newPdfX = initialFieldX + deltaPdfX;
      const newPdfY = initialFieldY + deltaPdfY;

      const clamped = clampFieldToPage(
        { x: newPdfX, y: newPdfY, width: field.width, height: field.height },
        pageWidth,
        pageHeight
      );

      onUpdate(field.id, { x: clamped.x, y: clamped.y }, false);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (hasMoved) {
        // Commit to history after drag completes
        onUpdate(field.id, {}, true);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Resizing logic with 8 handles
  const handleResizeStart = (handle, e) => {
    e.stopPropagation();
    e.preventDefault();

    setIsResizing(true);
    setResizeHandle(handle);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialRect = { ...field };
    const minDim = MIN_FIELD_DIMENSIONS[field.type] || { width: 30, height: 16 };

    const onMouseMove = (moveEvent) => {
      const deltaPdfX = screenToPdf(moveEvent.clientX - startX, scale);
      const deltaPdfY = screenToPdf(moveEvent.clientY - startY, scale);

      let { x, y, width, height } = initialRect;

      if (handle.includes('e')) {
        width = Math.max(minDim.width, initialRect.width + deltaPdfX);
      }
      if (handle.includes('s')) {
        height = Math.max(minDim.height, initialRect.height + deltaPdfY);
      }
      if (handle.includes('w')) {
        const potentialWidth = initialRect.width - deltaPdfX;
        if (potentialWidth >= minDim.width) {
          width = potentialWidth;
          x = initialRect.x + deltaPdfX;
        }
      }
      if (handle.includes('n')) {
        const potentialHeight = initialRect.height - deltaPdfY;
        if (potentialHeight >= minDim.height) {
          height = potentialHeight;
          y = initialRect.y + deltaPdfY;
        }
      }

      const clamped = clampFieldToPage({ x, y, width, height }, pageWidth, pageHeight);
      onUpdate(field.id, clamped, false);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      onUpdate(field.id, {}, true);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (isSelected && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected]);

  // Auto-expand dropdown if width is too narrow (< 70pt) to fit text + chevron
  useEffect(() => {
    if (field.type === FIELD_TYPES.DROPDOWN && field.width && field.width < 70) {
      onUpdate(field.id, { width: 90 });
    }
  }, [field.id, field.type, field.width, onUpdate]);

  // Field Value change handler
  const handleValueChange = (newVal) => {
    const isDefaultLabel = !field.label || /^(text|field|date|checkbox|radio|dropdown)\s*(field)?\s*\d+/i.test(field.label);
    const updates = { value: newVal, isNewEmpty: false };
    if (isDefaultLabel && newVal.trim().length > 0 && newVal.trim().length < 32) {
      updates.label = newVal.trim();
      if (/^(text|field|date|checkbox|radio|dropdown)_\d+(_copy)?$/i.test(field.name || '')) {
        updates.name = sanitizeFieldName(newVal.trim());
      }
    }
    onUpdate(field.id, updates);
  };

  const handleCheckedChange = (newChecked) => {
    onUpdate(field.id, { checked: newChecked });
  };

  // Render internal widget based on field type
  const renderWidget = () => {
    const isSingleLine = (
      field.type === FIELD_TYPES.TEXT ||
      field.type === FIELD_TYPES.DESCRIPTION ||
      field.type === FIELD_TYPES.DATE ||
      field.type === FIELD_TYPES.DROPDOWN
    );
    const defaultPt = field.type === FIELD_TYPES.DROPDOWN ? 8 : (isSingleLine ? 9 : 12);
    // Cap font size so it fits physical box height cleanly
    const maxFsForBox = field.type === FIELD_TYPES.DROPDOWN
      ? Math.max(6.5, Math.floor((field.height || 14) * 0.56))
      : Math.max(7, Math.floor((field.height || 14) * 0.72));
    const safeBasePt = field.fontSize ? Number(field.fontSize) : Math.min(defaultPt, maxFsForBox);
    const fontSize = safeBasePt * scale;
    const alignment = field.alignment || 'left';
    const isBold = Boolean(field.bold);
    const isItalic = Boolean(field.italic);
    const isUppercase = Boolean(field.uppercase);
    const verticalOffset = field.verticalOffset !== undefined ? field.verticalOffset : 1.5;
    const padBottom = Math.max(0, verticalOffset * scale);
    const padTop = Math.max(0, -verticalOffset * scale);
    const textTransform = isUppercase ? 'uppercase' : 'none';
    const fontWeight = isBold ? '700' : '400';
    const fontStyle = isItalic ? 'italic' : 'normal';

    const verticalAlign = field.verticalAlign || 'bottom';
    const inputHeight = Math.max(10, Math.round(fontSize * 1.25 + padBottom + padTop));

    const positionStyle = {
      position: 'absolute',
      left: 0,
      right: 0,
      width: '100%',
      height: `${inputHeight}px`,
      maxHeight: '100%',
      margin: 0,
      boxSizing: 'border-box'
    };

    if (verticalAlign === 'top') {
      positionStyle.top = 0;
      positionStyle.bottom = 'auto';
      positionStyle.transform = 'none';
      positionStyle.paddingTop = `${Math.max(padTop, 1)}px`;
      positionStyle.paddingBottom = '0px';
    } else if (verticalAlign === 'center') {
      positionStyle.top = '50%';
      positionStyle.bottom = 'auto';
      positionStyle.transform = 'translateY(-50%)';
      positionStyle.paddingTop = '0px';
      positionStyle.paddingBottom = '0px';
    } else {
      // default: bottom
      positionStyle.bottom = 0;
      positionStyle.top = 'auto';
      positionStyle.transform = 'none';
      positionStyle.paddingTop = `${padTop}px`;
      positionStyle.paddingBottom = `${padBottom}px`;
    }

    switch (field.type) {
      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.DESCRIPTION:
        return (
          <input
            ref={inputRef}
            type="text"
            className="field-input text-field"
            value={field.value ?? ''}
            placeholder={field.placeholder || ''}
            readOnly={field.readOnly}
            style={{
              ...positionStyle,
              fontSize: `${fontSize}px`,
              fontFamily: field.fontFamily || 'Helvetica, Arial, sans-serif',
              textAlign: alignment,
              color: field.textColor || '#000000',
              backgroundColor: 'transparent',
              fontWeight,
              fontStyle,
              textTransform,
              lineHeight: 1.15,
              paddingLeft: '3px',
              paddingRight: '3px',
              border: 'none',
              outline: 'none'
            }}
            onChange={(e) => handleValueChange(e.target.value)}
            onFocus={() => onSelect(field.id)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(field.id);
            }}
          />
        );

      case FIELD_TYPES.TEXTAREA:
        return (
          <textarea
            className="field-input textarea-field"
            value={field.value || ''}
            placeholder={field.placeholder || ''}
            readOnly={field.readOnly}
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: field.fontFamily || 'Helvetica, Arial, sans-serif',
              textAlign: alignment,
              color: field.textColor || '#000000',
              backgroundColor: 'transparent',
              fontWeight,
              fontStyle,
              textTransform
            }}
            onChange={(e) => handleValueChange(e.target.value)}
            onFocus={() => onSelect(field.id)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(field.id);
            }}
          />
        );

      case FIELD_TYPES.CHECKBOX:
        return (
          <div
            className={`field-checkbox ${field.checked ? 'is-checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(field.id);
              if (!field.readOnly) {
                handleCheckedChange(!field.checked);
              }
            }}
          >
            {field.checked && (
              <svg viewBox="0 0 24 24" className="checkbox-check-icon">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        );

      case FIELD_TYPES.RADIO:
        return (
          <div
            className={`field-radio ${field.checked ? 'is-checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(field.id);
              if (!field.readOnly) {
                handleCheckedChange(!field.checked);
              }
            }}
          >
            {field.checked && <div className="radio-dot" />}
          </div>
        );

      case FIELD_TYPES.DROPDOWN: {
        const options = Array.isArray(field.options) && field.options.length > 0
          ? field.options
          : ['Option 1', 'Option 2', 'Option 3'];
        const placeholder = field.placeholder || 'Select...';
        const displayVal = field.value || '';

        return (
          <div
            className="field-dropdown-wrapper"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              padding: 0,
              backgroundColor: field.backgroundColor === 'transparent' ? 'transparent' : (field.backgroundColor || '#ffffff'),
              border: '1px solid #71717a',
              overflow: 'hidden'
            }}
          >
            {/* 1. Visible, perfectly vertically centered text (never clipped) */}
            <span
              style={{
                flex: 1,
                minWidth: 0,
                padding: '0 4px',
                fontSize: `${fontSize}px`,
                fontFamily: field.fontFamily || 'Helvetica, Arial, sans-serif',
                fontWeight,
                fontStyle,
                color: displayVal ? (field.textColor || '#000000') : '#52525b',
                textAlign: alignment,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1,
                display: 'block',
                pointerEvents: 'none'
              }}
            >
              {displayVal || placeholder}
            </span>

            {/* 2. Classic Square Button with Down Triangle (▼) */}
            <div
              style={{
                width: `${Math.max(14, Math.min(18, screenCoords.height))}px`,
                height: '100%',
                backgroundColor: '#e4e4e7',
                borderLeft: '1px solid #71717a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '3.5px solid transparent',
                  borderRight: '3.5px solid transparent',
                  borderTop: '4.5px solid #000000'
                }}
              />
            </div>

            {/* 3. Invisible native select for clicking and picking options */}
            <select
              className="field-dropdown-native-select"
              value={displayVal}
              disabled={field.readOnly}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: field.readOnly ? 'default' : 'pointer',
                zIndex: 2,
                border: 'none',
                outline: 'none',
                margin: 0,
                padding: 0
              }}
              onChange={(e) => handleValueChange(e.target.value)}
              onFocus={() => onSelect(field.id)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(field.id);
              }}
            >
              <option value="" disabled={field.required}>
                {placeholder}
              </option>
              {options.map((opt, i) => (
                <option
                  key={i}
                  value={opt}
                  style={{
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    fontSize: '11px'
                  }}
                >
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );
      }

      case FIELD_TYPES.DATE: {
        const rawVal = field.value || '';
        const dateFormat = field.dateFormat || 'DD/MM/YYYY';
        const displayVal = rawVal ? formatDateDisplay(rawVal, dateFormat) : '';
        const isoVal = parseToIsoDate(rawVal);
        const placeholder = field.placeholder || dateFormat;
        const buttonWidth = Math.max(14, Math.min(18, screenCoords.height));
        const iconSize = Math.max(10, Math.min(13, screenCoords.height * 0.65));

        return (
          <div
            style={{
              ...positionStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: field.backgroundColor || '#ffffff',
              border: isSelected ? 'none' : '1px solid #71717a',
              overflow: 'hidden',
              cursor: field.readOnly ? 'default' : 'pointer',
              userSelect: 'none',
              padding: 0
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(field.id);
            }}
          >
            {/* 1. Date text representation in DD/MM/YYYY */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: `${fontSize}px`,
                fontFamily: field.fontFamily || 'Helvetica, Arial, sans-serif',
                textAlign: alignment,
                color: displayVal ? (field.textColor || '#000000') : '#94a3b8',
                fontWeight,
                fontStyle,
                lineHeight: 1.15,
                paddingLeft: '4px',
                paddingRight: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {displayVal || placeholder}
            </div>

            {/* 2. Calendar button with icon */}
            <div
              title="Click to select date"
              style={{
                width: `${buttonWidth}px`,
                height: '100%',
                backgroundColor: '#f1f5f9',
                borderLeft: '1px solid #71717a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#334155',
                pointerEvents: 'none'
              }}
            >
              <Calendar size={iconSize} strokeWidth={2} />
            </div>

            {/* 3. Invisible native date input for triggering browser calendar picker */}
            <input
              ref={dateInputRef}
              type="date"
              className="field-date-native-input"
              value={isoVal}
              disabled={field.readOnly}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: field.readOnly ? 'default' : 'pointer',
                zIndex: 2,
                border: 'none',
                outline: 'none',
                margin: 0,
                padding: 0
              }}
              onChange={(e) => {
                const formatted = isoToDisplayDate(e.target.value, dateFormat);
                handleValueChange(formatted);
              }}
              onFocus={() => onSelect(field.id)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(field.id);
                try {
                  e.target.showPicker?.();
                } catch (err) {}
              }}
            />
          </div>
        );
      }

      case FIELD_TYPES.SIGNATURE:
        return (
          <div
            className={`field-signature-box ${field.signatureDataUrl ? 'has-signature' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(field.id);
              onOpenSignatureModal(field);
            }}
          >
            {field.signatureDataUrl ? (
              <img
                src={field.signatureDataUrl}
                alt="Signature"
                className="signature-preview-img"
              />
            ) : (
              <div className="signature-empty-hint">
                <PenTool size={Math.max(12, 14 * scale)} />
                <span style={{ fontSize: `${Math.max(10, 11 * scale)}px` }}>
                  Sign here
                </span>
              </div>
            )}
          </div>
        );

      case FIELD_TYPES.IMAGE: {
        const hasImg = Boolean(field.imageUrl || field.value);
        const objFit = field.objectFit || 'contain';
        const opacity = field.opacity !== undefined ? field.opacity : 1;
        const borderRadius = field.borderRadius ? `${field.borderRadius}px` : '0px';

        return (
          <div
            className={`field-image-box ${hasImg ? 'has-image' : 'empty-image'}`}
            style={{
              width: '100%',
              height: '100%',
              borderRadius,
              opacity,
              border: hasImg && field.borderWidth ? `${field.borderWidth}px solid ${field.borderColor || '#000000'}` : undefined
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(field.id);
              if (!hasImg && imageInputRef.current) {
                imageInputRef.current.click();
              }
            }}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageFileChange}
            />

            {hasImg ? (
              <>
                <img
                  src={field.imageUrl || field.value}
                  alt={field.altText || field.label || 'Field Image'}
                  className="image-preview-render"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: objFit,
                    borderRadius,
                    display: 'block',
                    pointerEvents: 'none'
                  }}
                />
                {isSelected && (
                  <div className="image-hover-actions">
                    <button
                      type="button"
                      className="image-change-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        imageInputRef.current?.click();
                      }}
                      title="Change image file"
                    >
                      <ImageIcon size={12} />
                      <span>Change</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="image-empty-placeholder">
                <ImageIcon size={Math.max(16, 20 * scale)} />
                <span style={{ fontSize: `${Math.max(10, 11 * scale)}px`, fontWeight: 600 }}>
                  Click to add image
                </span>
                <span style={{ fontSize: `${Math.max(8, 9 * scale)}px`, opacity: 0.75 }}>
                  PNG, JPG, WEBP
                </span>
              </div>
            )}
          </div>
        );
      }

      default:
        return <div className="field-default-box">{field.name}</div>;
    }
  };

  return (
    <div
      ref={itemRef}
      id={`field-item-${field.id}`}
      className={`field-overlay-item ${isSelected ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''} ${isResizing ? 'is-resizing' : ''
        } type-${field.type} ${field.isExistingAcroField ? 'is-existing-acro' : 'is-custom-field'}`}
      style={{
        left: `${screenCoords.x}px`,
        top: `${screenCoords.y}px`,
        width: `${screenCoords.width}px`,
        height: `${screenCoords.height}px`,
        backgroundColor: field.backgroundColor === 'transparent' ? 'transparent' : (field.backgroundColor || '#ffffff')
      }}
      onMouseDown={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(field.id);
      }}
    >
      {/* Field Content */}
      <div
        className="field-content-wrap"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
        onClick={() => {
          if (inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        {renderWidget()}
      </div>

      {/* Visual Move Handle when selected */}
      {isSelected && (
        <div
          className="field-drag-handle"
          title="Drag to move field with mouse"
          onMouseDown={handleDragStart}
        >
          <Move size={11} />
        </div>
      )}

      {/* Field Type Badge on hover or selection (hidden for text, description, and date) */}
      {isSelected && field.type !== FIELD_TYPES.TEXT && field.type !== FIELD_TYPES.DESCRIPTION && field.type !== FIELD_TYPES.DATE && (
        <div className="field-type-badge">
          <span>{field.name || field.type}</span>
          {field.required && <span className="field-required-star">*</span>}
        </div>
      )}

      {/* Quick Action Floating Bar when selected (suppressed for compact text, description & date fields so it doesn't cover row above) */}
      {isSelected && field.type !== FIELD_TYPES.TEXT && field.type !== FIELD_TYPES.DESCRIPTION && field.type !== FIELD_TYPES.DATE && (
        <div className="field-quick-actions" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="field-action-btn"
            title="Duplicate Field (Ctrl+D)"
            onClick={() => onDuplicate(field.id)}
          >
            <Copy size={12} />
          </button>
          <button
            type="button"
            className="field-action-btn delete-btn"
            title="Delete Field (Delete)"
            onClick={() => onDelete(field.id)}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Resize Handles when selected (Width & Height controls) */}
      {isSelected && (
        <>
          <div className="resize-handle handle-nw" onMouseDown={(e) => handleResizeStart('nw', e)} />
          <div className="resize-handle handle-n" onMouseDown={(e) => handleResizeStart('n', e)} />
          <div className="resize-handle handle-ne" onMouseDown={(e) => handleResizeStart('ne', e)} />
          <div className="resize-handle handle-e" onMouseDown={(e) => handleResizeStart('e', e)} />
          <div className="resize-handle handle-se" onMouseDown={(e) => handleResizeStart('se', e)} />
          <div className="resize-handle handle-s" onMouseDown={(e) => handleResizeStart('s', e)} />
          <div className="resize-handle handle-sw" onMouseDown={(e) => handleResizeStart('sw', e)} />
          <div className="resize-handle handle-w" onMouseDown={(e) => handleResizeStart('w', e)} />
        </>
      )}
    </div>
  );
}
