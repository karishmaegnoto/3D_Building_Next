import React, { useRef, useState } from 'react';
import { FIELD_TYPES, MIN_FIELD_DIMENSIONS, DEFAULT_FIELD_DIMENSIONS } from '../../types/fields.js';
import {
  createDefaultField,
  generateFieldId,
  getSmartFieldPlacement,
  detectCellBoundsAtPoint,
  detectAdjacentLabel,
  makeUniqueFieldName,
  getNextDescriptionFieldName
} from '../../utils/fieldUtils.js';
import { clampFieldToPage, screenToPdf } from '../../utils/pdfCoordinates.js';
import { FieldItem } from './FieldItem';

export function FieldOverlay({
  pageNumber,
  pageWidth,
  pageHeight,
  scale,
  fields,
  selectedFieldId,
  activeTool,
  detectedPdfFont = 'Helvetica',
  canvasRef = null,
  pageTextItems = [],
  onSelectField,
  onAddField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onOpenSignatureModal
}) {
  const overlayRef = useRef(null);
  const [drawingRect, setDrawingRect] = useState(null);

  // Filter fields belonging only to this page
  const pageFields = fields.filter(f => f.pageNumber === pageNumber);

  const isPlacementMode = activeTool && activeTool !== 'select';

  // Handle placement & click-anywhere mouse down
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    if (e.target !== overlayRef.current) return;

    // In select mode (default pointer), clicking empty space simply deselects
    if (!isPlacementMode) {
      onSelectField(null);
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const rect = overlayRef.current.getBoundingClientRect();
    const startScreenX = e.clientX - rect.left;
    const startScreenY = e.clientY - rect.top;

    const startPdfX = screenToPdf(startScreenX, scale);
    const startPdfY = screenToPdf(startScreenY, scale);

    const initialDraw = {
      startX: startPdfX,
      startY: startPdfY,
      currentX: startPdfX,
      currentY: startPdfY
    };

    setDrawingRect(initialDraw);

    const onMouseMove = (moveEvent) => {
      const currentScreenX = moveEvent.clientX - rect.left;
      const currentScreenY = moveEvent.clientY - rect.top;

      const currentPdfX = screenToPdf(currentScreenX, scale);
      const currentPdfY = screenToPdf(currentScreenY, scale);

      setDrawingRect(prev => ({
        ...prev,
        currentX: currentPdfX,
        currentY: currentPdfY
      }));
    };

    const onMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setDrawingRect(null);

      const upScreenX = upEvent.clientX - rect.left;
      const upScreenY = upEvent.clientY - rect.top;
      const upPdfX = screenToPdf(upScreenX, scale);
      const upPdfY = screenToPdf(upScreenY, scale);

      const dragWidth = Math.abs(upPdfX - startPdfX);
      const dragHeight = Math.abs(upPdfY - startPdfY);

      const currentTool = (activeTool && activeTool !== 'select') ? activeTool : FIELD_TYPES.TEXT;
      const canvas = canvasRef?.current;

      // 1. If user dragged a meaningful box, create field with dragged dimensions
      if (dragWidth > 15 && dragHeight > 10) {
        const minDim = MIN_FIELD_DIMENSIONS[currentTool] || { width: 30, height: 11.5 };
        let finalWidth = Math.max(minDim.width, dragWidth);
        let finalHeight = Math.max(minDim.height, dragHeight);
        let finalX = Math.min(startPdfX, upPdfX);
        let finalY = Math.min(startPdfY, upPdfY);

        // Auto-detect cell borders if text, description, date, or dropdown field
        if (currentTool === FIELD_TYPES.TEXT || currentTool === FIELD_TYPES.DESCRIPTION || currentTool === FIELD_TYPES.DATE || currentTool === FIELD_TYPES.DROPDOWN) {
          const midY = finalY + finalHeight / 2;
          const detected = detectCellBoundsAtPoint(canvas, finalX + 10, midY, scale, pageWidth, pageHeight);
          if (detected && detected.found) {
            finalY = detected.y;
            finalHeight = detected.height;
          } else {
            finalY = Math.round((finalY + 0.5) * 10) / 10;
            finalHeight = Math.max(8, Math.round((finalHeight - 0.5) * 10) / 10);
          }
        }

        const clamped = clampFieldToPage(
          { x: finalX, y: finalY, width: finalWidth, height: finalHeight },
          pageWidth,
          pageHeight
        );

        const customProps = { fontFamily: detectedPdfFont || 'Helvetica' };
        let fieldType = currentTool;

        if (currentTool === FIELD_TYPES.DESCRIPTION) {
          const descName = getNextDescriptionFieldName(fields);
          customProps.name = descName;
          customProps.originalName = descName;
          customProps.label = descName;
        } else if (currentTool === FIELD_TYPES.RADIO) {
          const pageRadios = (fields || []).filter(
            f => f.type === FIELD_TYPES.RADIO && f.pageNumber === pageNumber
          );
          const lastRadio = pageRadios[pageRadios.length - 1];
          if (lastRadio && lastRadio.groupName) {
            customProps.groupName = lastRadio.groupName;
            customProps.name = `${lastRadio.groupName}_${pageRadios.length + 1}`;
            customProps.optionValue = `Option ${pageRadios.length + 1}`;
            customProps.label = `Option ${pageRadios.length + 1}`;
          }
        } else {
          // Auto-detect adjacent label (e.g. "Order Date:", "Customer Name:")
          const detectedLabel = detectAdjacentLabel(pageTextItems, clamped);
          if (detectedLabel) {
            customProps.label = detectedLabel.label;
            customProps.name = makeUniqueFieldName(detectedLabel.name, fields);
            customProps.originalName = customProps.name;
            if (/date|dob/i.test(detectedLabel.name) && currentTool === FIELD_TYPES.TEXT) {
              fieldType = FIELD_TYPES.DATE;
            }
          }
        }

        const newField = createDefaultField(
          fieldType,
          pageNumber,
          clamped.x,
          clamped.y,
          { width: clamped.width, height: clamped.height },
          customProps
        );

        onAddField(newField);
        onSelectField(newField.id);
        return;
      }

      // 2. Click on empty space: Create field matching current active tool
      const defaultDim = DEFAULT_FIELD_DIMENSIONS[currentTool] || { width: 140, height: 11.5 };
      let width = defaultDim.width;
      let height = defaultDim.height;
      let x = Math.max(0, Math.round(startPdfX * 10) / 10);
      let y = Math.max(0, Math.round((startPdfY - height) * 10) / 10);
      const customProps = { fontFamily: detectedPdfFont || 'Helvetica' };

      if (currentTool === FIELD_TYPES.TEXT || currentTool === FIELD_TYPES.DESCRIPTION || currentTool === FIELD_TYPES.DATE || currentTool === FIELD_TYPES.DROPDOWN) {
        // Detect actual physical cell borders from PDF canvas
        const detected = detectCellBoundsAtPoint(canvas, startPdfX, startPdfY, scale, pageWidth, pageHeight);
        if (detected && detected.found) {
          y = detected.y;
          height = detected.height;
          x = Math.max(0, Math.round(startPdfX * 10) / 10);
          const maxAllowedWidth = currentTool === FIELD_TYPES.DESCRIPTION ? 260 : 130;
          width = Math.min(maxAllowedWidth, Math.max(45, Math.round((pageWidth - x - 20) * 10) / 10));
        } else {
          const smart = getSmartFieldPlacement(startPdfX, startPdfY, pageWidth, pageHeight, pageNumber);
          x = smart.x;
          y = Math.round((smart.y + 0.5) * 10) / 10;
          width = currentTool === FIELD_TYPES.DESCRIPTION ? Math.max(180, smart.width) : smart.width;
          height = Math.max(8, Math.round((smart.height - 0.5) * 10) / 10);
          if (smart.label && currentTool !== FIELD_TYPES.DESCRIPTION) customProps.label = smart.label;
        }
      } else {
        x = Math.max(0, Math.round((startPdfX - width / 2) * 10) / 10);
        y = Math.max(0, Math.round((startPdfY - height / 2) * 10) / 10);
      }

      const clamped = clampFieldToPage(
        { x, y, width, height },
        pageWidth,
        pageHeight
      );

      let fieldType = currentTool;
      if (currentTool === FIELD_TYPES.DESCRIPTION) {
        const descName = getNextDescriptionFieldName(fields);
        customProps.name = descName;
        customProps.originalName = descName;
        customProps.label = descName;
      } else if (currentTool === FIELD_TYPES.RADIO) {
        const pageRadios = (fields || []).filter(
          f => f.type === FIELD_TYPES.RADIO && f.pageNumber === pageNumber
        );
        const lastRadio = pageRadios[pageRadios.length - 1];
        if (lastRadio && lastRadio.groupName) {
          customProps.groupName = lastRadio.groupName;
          customProps.name = `${lastRadio.groupName}_${pageRadios.length + 1}`;
          customProps.optionValue = `Option ${pageRadios.length + 1}`;
          customProps.label = `Option ${pageRadios.length + 1}`;
        }
      } else {
        // Auto-detect adjacent label if not already found by smart table placement
        const detectedLabel = detectAdjacentLabel(pageTextItems, clamped);
        if (detectedLabel) {
          customProps.label = detectedLabel.label;
          customProps.name = makeUniqueFieldName(detectedLabel.name, fields);
          customProps.originalName = customProps.name;
          if (/date|dob/i.test(detectedLabel.name) && currentTool === FIELD_TYPES.TEXT) {
            fieldType = FIELD_TYPES.DATE;
          }
        }
      }

      const newField = createDefaultField(
        fieldType,
        pageNumber,
        clamped.x,
        clamped.y,
        { width: clamped.width, height: clamped.height },
        customProps
      );

      onAddField(newField);
      onSelectField(newField.id);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Preview box calculation for drawing
  const getPreviewBoxStyle = () => {
    if (!drawingRect) return null;

    const minX = Math.min(drawingRect.startX, drawingRect.currentX);
    const minY = Math.min(drawingRect.startY, drawingRect.currentY);
    const w = Math.max(Math.abs(drawingRect.currentX - drawingRect.startX), 1);
    const h = Math.max(Math.abs(drawingRect.currentY - drawingRect.startY), 1);

    return {
      left: `${minX * scale}px`,
      top: `${minY * scale}px`,
      width: `${w * scale}px`,
      height: `${h * scale}px`
    };
  };

  return (
    <div
      ref={overlayRef}
      id={`field-overlay-p${pageNumber}`}
      className={`pdf-field-overlay ${isPlacementMode ? 'placement-mode' : 'select-mode'}`}
      style={{
        width: `${pageWidth * scale}px`,
        height: `${pageHeight * scale}px`
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Existing and newly added fields */}
      {pageFields.map(field => (
        <FieldItem
          key={field.id}
          field={field}
          scale={scale}
          isSelected={selectedFieldId === field.id}
          onSelect={onSelectField}
          onUpdate={onUpdateField}
          onDelete={onDeleteField}
          onDuplicate={onDuplicateField}
          onOpenSignatureModal={onOpenSignatureModal}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
        />
      ))}

      {/* Dragging placement preview box */}
      {drawingRect && (
        <div className="field-placement-preview" style={getPreviewBoxStyle()}>
          <span className="placement-label">{activeTool}</span>
        </div>
      )}
    </div>
  );
}
