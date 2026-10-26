import { DEFAULT_FIELD_DIMENSIONS, FIELD_LABELS, FIELD_TYPES } from '../types/fields.js';
import { annotationRectToPdfRect } from './pdfCoordinates.js';

let idCounter = 1;

export function generateFieldId(type = 'field') {
  return `${type}_${Date.now()}_${idCounter++}`;
}

export function sanitizeFieldName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function cleanFontFamilyName(rawFont) {
  if (!rawFont || typeof rawFont !== 'string') return 'Helvetica';
  const stripped = rawFont.replace(/^[A-Z]{6}\+/, '').trim();

  if (/helvetica/i.test(stripped)) return 'Helvetica';
  if (/times/i.test(stripped)) return 'Times New Roman';
  if (/courier/i.test(stripped)) return 'Courier';
  if (/georgia/i.test(stripped)) return 'Georgia';
  if (/verdana/i.test(stripped)) return 'Verdana';
  if (/calibri/i.test(stripped)) return 'Calibri';
  if (/roboto/i.test(stripped)) return 'Roboto';
  if (/inter/i.test(stripped)) return 'Inter';
  if (/arial/i.test(stripped)) return 'Arial';
  if (/sans-serif/i.test(stripped)) return 'Helvetica';
  if (/serif/i.test(stripped)) return 'Times New Roman';
  if (/monospace/i.test(stripped)) return 'Courier';

  return stripped.split(/[-_,]/)[0] || 'Helvetica';
}

export async function detectDocumentFontFamily(pdfDoc) {
  if (!pdfDoc) return 'Helvetica';
  try {
    const fontCounts = {};
    const maxPages = Math.min(pdfDoc.numPages || 1, 3);

    for (let p = 1; p <= maxPages; p++) {
      const page = await pdfDoc.getPage(p);
      const content = await page.getTextContent();
      if (!content || !content.items) continue;

      const styles = content.styles || {};
      for (let i = 0; i < content.items.length; i++) {
        const item = content.items[i];
        if (!item.str || !item.str.trim()) continue;
        const fontObj = styles[item.fontName];
        const rawFamily = fontObj?.fontFamily || item.fontName;
        if (rawFamily) {
          const cleanName = cleanFontFamilyName(rawFamily);
          fontCounts[cleanName] = (fontCounts[cleanName] || 0) + item.str.length;
        }
      }
    }

    let bestFont = 'Helvetica';
    let maxCount = 0;
    for (const [font, count] of Object.entries(fontCounts)) {
      if (count > maxCount) {
        maxCount = count;
        bestFont = font;
      }
    }
    return bestFont;
  } catch (err) {
    console.warn('Could not detect PDF font family:', err);
    return 'Helvetica';
  }
}

export function createDefaultField(type, pageNumber, x, y, customDimensions = null, customProps = {}) {
  const defaultDim = DEFAULT_FIELD_DIMENSIONS[type] || { width: 150, height: 28 };
  const width = customDimensions?.width ?? defaultDim.width;
  const height = customDimensions?.height ?? defaultDim.height;
  const id = generateFieldId(type);
  const friendlyLabel = FIELD_LABELS[type] || 'Field';

  const isDescription = type === FIELD_TYPES.DESCRIPTION;
  const defaultName = isDescription ? `Description${idCounter}` : `${type}_${idCounter}`;
  const defaultLabel = isDescription ? `Description ${idCounter}` : `${friendlyLabel} ${idCounter}`;

  const baseField = {
    id,
    pageNumber,
    type,
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    width: Math.round(width * 10) / 10,
    height: Math.round(height * 10) / 10,
    name: defaultName,
    originalName: defaultName,
    label: defaultLabel,
    value: '',
    fontFamily: customProps.fontFamily || 'Helvetica',
    required: false,
    readOnly: false,
    isExistingAcroField: false,
    ...customProps
  };

  switch (type) {
    case FIELD_TYPES.TEXT:
    case FIELD_TYPES.DESCRIPTION:
      return {
        ...baseField,
        placeholder: '',
        fontSize: 9,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        alignment: 'left',
        verticalAlign: 'bottom',
        verticalOffset: 1.5
      };

    case FIELD_TYPES.TEXTAREA:
      return {
        ...baseField,
        placeholder: '',
        fontSize: 12,
        alignment: 'left'
      };

    case FIELD_TYPES.CHECKBOX:
      return {
        ...baseField,
        checked: false,
        value: 'Yes',
        borderColor: '#000000',
        backgroundColor: '#ffffff'
      };

    case FIELD_TYPES.RADIO:
      return {
        ...baseField,
        groupName: customProps.groupName || `radio_group_${idCounter}`,
        optionValue: customProps.optionValue || `Option ${idCounter}`,
        checked: false,
        borderColor: '#000000',
        backgroundColor: '#ffffff'
      };

    case FIELD_TYPES.DROPDOWN:
      return {
        ...baseField,
        options: customProps.options || ['Option 1', 'Option 2', 'Option 3'],
        placeholder: customProps.placeholder || 'Select...',
        value: customProps.value || '',
        fontSize: customProps.fontSize || 8,
        textColor: customProps.textColor || '#000000',
        backgroundColor: customProps.backgroundColor || 'transparent',
        alignment: customProps.alignment || 'left'
      };

    case FIELD_TYPES.DATE:
      return {
        ...baseField,
        value: '',
        placeholder: 'DD/MM/YYYY',
        dateFormat: 'DD/MM/YYYY',
        fontSize: 9,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        verticalOffset: 1.5
      };

    case FIELD_TYPES.SIGNATURE:
      return {
        ...baseField,
        signatureDataUrl: null,
        signedAt: null,
        signerName: ''
      };

    case FIELD_TYPES.IMAGE:
      return {
        ...baseField,
        imageUrl: customProps.imageUrl || null,
        value: customProps.value || '',
        objectFit: customProps.objectFit || 'contain',
        altText: customProps.altText || 'Image',
        backgroundColor: customProps.backgroundColor || 'transparent',
        borderColor: customProps.borderColor || 'transparent',
        borderWidth: customProps.borderWidth || 0,
        borderRadius: customProps.borderRadius || 0,
        opacity: customProps.opacity !== undefined ? customProps.opacity : 1
      };

    default:
      return baseField;
  }
}

export function duplicateField(field, offset = 16, existingFields = []) {
  const newId = generateFieldId(field.type);
  let newName = `${field.name}_copy`;
  let newLabel = `${field.label || 'Field'} (Copy)`;

  if (/^description\d+$/i.test(field.name || '') || field.type === FIELD_TYPES.DESCRIPTION) {
    newName = getNextDescriptionFieldName(existingFields);
    newLabel = newName;
  }

  if (field.type === FIELD_TYPES.RADIO) {
    const group = (field.groupName || '').trim().toLowerCase();
    const sameGroupRadios = (existingFields || []).filter(
      f => f.type === FIELD_TYPES.RADIO && (f.groupName || '').trim().toLowerCase() === group
    );
    const optNum = sameGroupRadios.length + 1;
    newName = `${field.groupName || 'radio'}_${optNum}`;
    newLabel = `Option ${optNum}`;
    return {
      ...field,
      id: newId,
      name: newName,
      originalName: newName,
      label: newLabel,
      optionValue: `Option ${optNum}`,
      checked: false, // In a radio group only 1 can be checked
      x: field.x + offset,
      y: field.y + offset,
      isExistingAcroField: false
    };
  }

  return {
    ...field,
    id: newId,
    name: newName,
    originalName: newName,
    label: newLabel,
    x: field.x + offset,
    y: field.y + offset,
    isExistingAcroField: false
  };
}

/**
 * Convert PDF.js annotation to our application field model
 */
export function normalizeAnnotationToField(annotation, pageNumber, pageHeight) {
  if (!annotation) return null;
  const isWidget =
    annotation.subtype === 'Widget' ||
    annotation.type === 'Widget' ||
    annotation.annotationType === 20 ||
    Boolean(annotation.fieldType);

  if (!isWidget) return null;
  if (!annotation.rect || !Array.isArray(annotation.rect) || annotation.rect.length < 4) return null;

  const rect = annotationRectToPdfRect(annotation.rect, pageHeight);
  const name = annotation.fieldName || `existing_${annotation.id || Date.now()}`;
  const isReadOnly = Boolean(annotation.readOnly);
  const isRequired = Boolean(annotation.required);
  const rawValue = annotation.fieldValue ?? '';

  let type = FIELD_TYPES.TEXT;
  let extraProps = {};

  if (annotation.fieldType === 'Tx') {
    if (annotation.multiline) {
      type = FIELD_TYPES.TEXTAREA;
    } else if (/(date|dob)/i.test(name)) {
      type = FIELD_TYPES.DATE;
    } else {
      type = FIELD_TYPES.TEXT;
    }
    // Detect font size from default appearance (/DA) or default to 9pt for single-line text/date
    let detectedFontSize = 9;
    if (annotation.defaultAppearance) {
      const match = annotation.defaultAppearance.match(/\/([^\s]+)\s+([\d.]+)\s+Tf/);
      if (match && parseFloat(match[2]) > 0) {
        const parsed = parseFloat(match[2]);
        detectedFontSize = Math.min(Math.max(parsed, 7), 16);
      }
    }
    extraProps = {
      placeholder: '',
      fontSize: type === FIELD_TYPES.TEXTAREA ? 12 : detectedFontSize,
      alignment: annotation.textAlignment === 1 ? 'center' : annotation.textAlignment === 2 ? 'right' : 'left',
      verticalAlign: 'bottom',
      verticalOffset: 1.5
    };
  } else if (annotation.fieldType === 'Btn') {
    // Check if it's a push button (not a form data field)
    const isPush = Boolean(annotation.pushButton || (annotation.fieldFlags && (annotation.fieldFlags & 65536)));
    if (isPush) {
      return null;
    }

    const isRadio = Boolean(annotation.radioButton || (annotation.fieldFlags && (annotation.fieldFlags & 32768)));
    if (isRadio) {
      type = FIELD_TYPES.RADIO;
      extraProps = {
        groupName: annotation.fieldName || `radio_group_p${pageNumber}`,
        optionValue: annotation.buttonValue || annotation.exportValue || 'Option',
        checked: Boolean(annotation.fieldValue === annotation.buttonValue || annotation.fieldValue === 'Yes')
      };
    } else {
      // In PDF specification, any other Btn widget is a Checkbox
      type = FIELD_TYPES.CHECKBOX;
      extraProps = {
        checked: Boolean(
          annotation.fieldValue === 'Yes' ||
          annotation.fieldValue === true ||
          annotation.fieldValue === '1' ||
          annotation.exportValue === annotation.fieldValue
        )
      };
    }
  } else if (annotation.fieldType === 'Ch') {
    type = FIELD_TYPES.DROPDOWN;
    const options = (annotation.options || []).map(opt => (typeof opt === 'string' ? opt : opt.displayValue || opt.exportValue || ''));
    extraProps = {
      options: options.length > 0 ? options : ['Option 1', 'Option 2'],
      fontSize: 12
    };
  } else if (annotation.fieldType === 'Sig') {
    type = FIELD_TYPES.SIGNATURE;
  }

  // Friendly human-readable label
  let label = annotation.alternativeText || name;
  if (!annotation.alternativeText && typeof label === 'string') {
    label = label
      .replace(/^topmostSubform\[\d+\]\./i, '')
      .replace(/\[\d+\]/g, '')
      .replace(/_/g, ' ')
      .trim() || name;
  }

  return {
    id: `acro_${annotation.id || name}_p${pageNumber}`,
    pageNumber,
    type,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    name,
    originalName: name,
    label,
    value: typeof rawValue === 'string' ? rawValue : String(rawValue || ''),
    required: isRequired,
    readOnly: isReadOnly,
    isExistingAcroField: true,
    acroFieldType: annotation.fieldType,
    ...extraProps
  };
}

export function isTextCoveredByField(textItem, fields, pageNumber) {
  if (!fields || fields.length === 0) return false;
  const tLeft = textItem.x;
  const tRight = textItem.x + textItem.width;
  const tTop = textItem.y;
  const tBottom = textItem.y + textItem.height;

  return fields.some(f => {
    if (f.pageNumber !== pageNumber) return false;
    const fLeft = f.x;
    const fRight = f.x + f.width;
    const fTop = f.y;
    const fBottom = f.y + f.height;
    const xOverlap = Math.max(0, Math.min(tRight, fRight) - Math.max(tLeft, fLeft));
    const yOverlap = Math.max(0, Math.min(tBottom, fBottom) - Math.max(tTop, fTop));
    return xOverlap > textItem.width * 0.4 && yOverlap > textItem.height * 0.4;
  });
}

export const TABLE_LABELS = new Set([
  'DEALER', 'Dealer Phone No.', 'Date', 'CUSTOMER NAME', 'COUNTY', 'TAX', '(Where Delivered)',
  'ADDRESS', 'CITY', 'STATE', 'ZIP', 'PHONE', 'WORK', 'HOME', 'OTHER',
  'ROOF STYLE', 'Regular', 'Box Eave', 'Vertical', 'GAUGE',
  'UNIT SIZE', 'W.', 'L.', 'HT.', 'POWER AVAILABLE', 'Yes', 'No',
  'COLOR', 'Top', 'Sides', 'Trim', 'UNCERTIFIED', 'CERTIFIED',
  'SURFACE', 'TYPE', 'Ground', 'Cement', 'Asphalt', 'Wood', 'Other',
  'Price', 'Tax', 'Subtotal', '17% Down Payment Before',
  'Total', 'Additional Labor Charge', 'Balance Due at Installation',
  'Payment Options', 'Cash', 'Check', 'M.O.', 'P.O.', 'C.C./E-Check',
  '(with a 2% processing', 'fee)',
  'Customer:', 'CCI:', 'Email:', 'By:', 'Site Will Be Level', 'Int.'
]);

export const EXCLUDED_PATTERNS = [
  /^P\.O\.\s*Box/i,
  /carolinacarports/i,
  /^Toll\s*Free/i,
  /^Local:/i,
  /^Fax:/i,
  /^NOTE:\s*FRAME/i,
  /^Please\s*Provide/i,
  /^All\s*Orders/i,
  /^Any\s*order\s*over/i,
  /^requires\s*a/i,
  /^balance\s*due/i,
  /^BINDING\s*PURCHASE/i,
  /^CHECK\s*WITH/i,
  /^This\s*purchase/i,
  /^Terms,\s*Conditions/i,
  /^\d+\.\s*[A-Z]/i,
  /^Front\s*View/i,
  /^Left\s*Side/i,
  /^Right\s*Side/i,
  /^Back\s*View/i
];


export function convertTextItemToField(textItem, pageNumber, defaultFont = 'Helvetica') {
  const id = generateFieldId('text');
  const safeStr = (textItem.text || textItem.str || '').trim();
  const fontPt = textItem.height ? Math.min(Math.max(Math.round(textItem.height), 8), 14) : 9;
  const fontFam = textItem.fontFamily ? cleanFontFamilyName(textItem.fontFamily) : defaultFont;

  // Detect whether this item is a table title/label (black) vs a filled form value
  const isLabel = TABLE_LABELS.has(safeStr) || /^(DEALER|Dealer Phone|Date|CUSTOMER|COUNTY|TAX|ADDRESS|CITY|STATE|ZIP|PHONE|WORK|HOME|OTHER|ROOF|GAUGE|UNIT|COLOR|SURFACE|Price|Tax|Subtotal|Total|Additional|Balance|Payment|Cash|Check|Customer:|CCI:|Email:|By:|Site Will|Int\.)/i.test(safeStr);
  const textColor = isLabel ? '#000000' : '#000000';

  // In PDF forms, table rows are ~13.4pt high.
  // Constrain input height to 11.5pt with a 0.5pt top offset so it stays strictly INSIDE the row without erasing borders.
  const height = Math.min(Math.max((fontPt || 9) + 2.5, 11), 12);
  const y = Math.max(0, Math.round((textItem.y - 0.5) * 10) / 10);
  const x = Math.max(0, Math.round((textItem.x - 1.5) * 10) / 10);
  const width = Math.max(Math.round((textItem.width + 5) * 10) / 10, 36);

  const cleanName = sanitizeFieldName(safeStr.slice(0, 16)) || `text_${idCounter}`;

  return {
    id,
    pageNumber,
    type: FIELD_TYPES.TEXT,
    x,
    y,
    width,
    height,
    name: `${cleanName}_${idCounter}`,
    label: safeStr || 'Text',
    value: safeStr,
    placeholder: '',
    fontSize: fontPt,
    fontFamily: fontFam,
    textColor,
    backgroundColor: '#ffffff',
    alignment: 'left',
    verticalOffset: 1.5,
    required: false,
    readOnly: false,
    isExistingAcroField: false,
    isTextEdit: true
  };
}

export async function autoDetectDocumentFields(pdfDoc, numPages, pageSizes, existingFields = []) {
  const newFields = [];
  const existingList = [...existingFields];

  for (let p = 1; p <= numPages; p++) {
    try {
      const page = await pdfDoc.getPage(p);
      const pageHeight = pageSizes[p]?.height || page.getViewport({ scale: 1.0 }).height;

      // Extract real AcroForm widgets (Inputs, Checkboxes, Radios, Dropdowns)
      try {
        const annotations = await page.getAnnotations({ intent: 'display' });
        for (const annot of annotations) {
          const field = normalizeAnnotationToField(annot, p, pageHeight);
          if (field) {
            const alreadyExists = existingList.some(
              ef => ef.name === field.name || (Math.abs(ef.x - field.x) < 2 && Math.abs(ef.y - field.y) < 2 && ef.pageNumber === p)
            );
            if (!alreadyExists) {
              newFields.push(field);
              existingList.push(field);
            }
          }
        }
      } catch (annotErr) {
        console.warn(`Could not extract AcroForm annotations on page ${p}:`, annotErr);
      }
    } catch (err) {
      console.warn(`Auto-detect failed for page ${p}:`, err);
    }
  }

  return newFields;
}

export function getSmartFieldPlacement(clickX, clickY, pageWidth = 595, pageHeight = 842, pageNumber = 1) {
  // 1. Check Date cell on Page 1 (top row, right cell)
  if (pageNumber === 1 && clickX >= 485 && clickX <= 545 && clickY >= 120 && clickY <= 137) {
    return {
      x: 506.5,
      y: 124.0,
      width: 34,
      height: 11.5,
      fontSize: 9,
      placeholder: '',
      label: 'Date'
    };
  }

  // 2. Check if click is inside the contract table area (Page 1, only for standard A4 template 595x842)
  if (pageNumber === 1 && Math.abs(pageWidth - 595) < 5 && Math.abs(pageHeight - 842) < 5 && clickY >= 120 && clickY <= 220) {
    const tableTop = 123.7;
    const rowHeight = 13.35;
    const rowIndex = Math.floor((clickY - tableTop) / rowHeight);

    if (rowIndex >= 0 && rowIndex <= 7) {
      const snappedTop = Math.round((tableTop + rowIndex * rowHeight + 0.5) * 10) / 10;
      const width = Math.min(70, Math.max(36, Math.round((pageWidth - clickX - 20) * 10) / 10));
      return {
        x: Math.max(55, Math.round((clickX - 2) * 10) / 10),
        y: snappedTop,
        width,
        height: 11.5,
        fontSize: 9,
        placeholder: '',
        label: 'Field'
      };
    }
  }

  // 3. Generic placement anywhere else on the document
  const height = 11.5;
  // Position so input bottom sits on or near the clicked baseline (never below it)
  const y = Math.max(0, Math.round((clickY - height) * 10) / 10);
  const x = Math.max(0, Math.round(clickX * 10) / 10);
  const width = Math.min(100, Math.max(45, Math.round((pageWidth - x - 20) * 10) / 10));

  return {
    x,
    y,
    width,
    height,
    fontSize: 9,
    placeholder: '',
    label: 'Field'
  };
}

export function detectCellBoundsAtPoint(canvas, pdfX, pdfY, scale = 1.0, pageWidth = 612, pageHeight = 792) {
  if (!canvas) return null;
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) || canvas.getContext('2d');
    if (!ctx) return null;

    const canvasW = canvas.width;
    const canvasH = canvas.height;
    if (!canvasW || !canvasH) return null;

    const cssWidth = parseFloat(canvas.style.width) || (pageWidth * scale);
    const dpr = canvasW / cssWidth;

    const pixelX = Math.round(pdfX * scale * dpr);
    const pixelY = Math.round(pdfY * scale * dpr);

    if (pixelX < 0 || pixelX >= canvasW || pixelY < 0 || pixelY >= canvasH) {
      return null;
    }

    // Search vertical window: 24pt up and 24pt down
    const radiusPx = Math.round(24 * scale * dpr);
    const scanTop = Math.max(0, pixelY - radiusPx);
    const scanBottom = Math.min(canvasH - 1, pixelY + radiusPx);
    const scanH = scanBottom - scanTop + 1;

    // Sample 24px wide horizontal strip
    const scanLeft = Math.max(0, pixelX - 12);
    const scanW = Math.min(canvasW - scanLeft, 24);

    if (scanW < 4 || scanH < 10) return null;

    const imgData = ctx.getImageData(scanLeft, scanTop, scanW, scanH);
    const data = imgData.data;

    // Calculate row darkness (luminance)
    const rowLuminance = new Float32Array(scanH);
    for (let r = 0; r < scanH; r++) {
      let sum = 0;
      const rowOffset = r * scanW * 4;
      for (let c = 0; c < scanW; c++) {
        const idx = rowOffset + c * 4;
        sum += (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
      }
      rowLuminance[r] = sum / scanW;
    }

    const currentRelY = pixelY - scanTop;

    // Search UPWARDS for top border line (dark line, luminance < 195)
    let topBorderRel = -1;
    let minTopLum = 255;
    for (let r = currentRelY - 1; r >= 0; r--) {
      if (rowLuminance[r] < 195 && rowLuminance[r] < minTopLum) {
        minTopLum = rowLuminance[r];
        topBorderRel = r;
      } else if (topBorderRel !== -1 && rowLuminance[r] > minTopLum + 25) {
        break;
      }
    }

    // Search DOWNWARDS for bottom border line (dark line, luminance < 195)
    let bottomBorderRel = -1;
    let minBottomLum = 255;
    for (let r = currentRelY; r < scanH; r++) {
      if (rowLuminance[r] < 195 && rowLuminance[r] < minBottomLum) {
        minBottomLum = rowLuminance[r];
        bottomBorderRel = r;
      } else if (bottomBorderRel !== -1 && rowLuminance[r] > minBottomLum + 25) {
        break;
      }
    }

    // Case 1: Both top and bottom border lines found (enclosed cell)
    if (topBorderRel !== -1 && bottomBorderRel !== -1) {
      const topAbsPx = scanTop + topBorderRel;
      const bottomAbsPx = scanTop + bottomBorderRel;
      const heightPx = bottomAbsPx - topAbsPx;
      const heightPt = heightPx / (scale * dpr);

      if (heightPt >= 8 && heightPt <= 38) {
        const topPt = topAbsPx / (scale * dpr);
        const bottomPt = bottomAbsPx / (scale * dpr);
        const inset = Math.min(0.8, heightPt * 0.06);

        // Shift top 0.5 pt down from upper border and reduce height by 0.5 pt so it does not touch the top border line
        const snappedY = Math.round((topPt + inset + 0.5) * 10) / 10;
        const snappedHeight = Math.max(8.0, Math.round((bottomPt - topPt - inset * 2 - 0.5) * 10) / 10);

        return {
          y: snappedY,
          height: snappedHeight,
          topBorder: topPt,
          bottomBorder: bottomPt,
          cellHeight: heightPt,
          found: true
        };
      }
    }

    // Case 2: Only bottom border/underline found
    if (bottomBorderRel !== -1) {
      const bottomAbsPx = scanTop + bottomBorderRel;
      const bottomPt = bottomAbsPx / (scale * dpr);
      const defaultFieldH = 11.5;
      const snappedY = Math.round((bottomPt - defaultFieldH - 0.5) * 10) / 10;

      return {
        y: snappedY,
        height: defaultFieldH,
        bottomBorder: bottomPt,
        found: true
      };
    }

    return null;
  } catch (err) {
    console.warn('detectCellBoundsAtPoint failed:', err);
    return null;
  }
}

/**
 * Clean up raw label text from PDF (remove trailing colons, numbering, extra spaces)
 */
export function cleanLabelText(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/^[\s\d\.\)\-]+/, '') // remove leading numbering like "1.", "1)", "1 -"
    .replace(/\s*[\(\[].*?[\)\]]/g, '') // remove parenthetical like "(Y/N)", "(optional)"
    .replace(/[:_\?#*]+$/, '') // remove trailing colons, question marks, underscores
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Ensures an auto-generated field name doesn't collide with existing fields on the document
 */
export function makeUniqueFieldName(baseName, existingFields = []) {
  if (!baseName) return 'field_1';
  const clean = sanitizeFieldName(baseName) || 'field';
  let candidate = clean;
  let counter = 2;
  const existingNames = new Set((existingFields || []).map(f => (f.name || '').toLowerCase()));
  while (existingNames.has(candidate.toLowerCase())) {
    candidate = `${clean}_${counter}`;
    counter++;
  }
  return candidate;
}

/**
 * Computes the next sequential Description field name: Description1, Description2, Description3...
 */
export function getNextDescriptionFieldName(existingFields = []) {
  const existingNames = new Set(
    (existingFields || []).map(f => (f?.name || '').trim().toLowerCase())
  );
  let num = 1;
  while (existingNames.has(`description${num}`)) {
    num++;
  }
  return `Description${num}`;
}

/**
 * Extract all text items with bounding coordinates on a specific PDF page
 */
export async function extractPageTextItems(pdfDoc, pageNumber, pageHeight) {
  if (!pdfDoc) return [];
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const content = await page.getTextContent();
    if (!content || !content.items) return [];

    const items = [];
    for (let i = 0; i < content.items.length; i++) {
      const item = content.items[i];
      const text = (item.str || '').trim();
      if (!text) continue;

      const left = item.transform[4];
      const baselineY = item.transform[5];
      const itemHeight = item.height || 10;
      const top = pageHeight - baselineY - itemHeight;
      const width = item.width || 12;

      items.push({
        str: item.str.trim(),
        x: Math.round(left * 10) / 10,
        y: Math.round(top * 10) / 10,
        width: Math.round(width * 10) / 10,
        height: Math.round(itemHeight * 10) / 10
      });
    }
    return items;
  } catch (err) {
    console.warn(`Could not extract page ${pageNumber} text items:`, err);
    return [];
  }
}

/**
 * Smart detection of adjacent label text next to a newly placed field box
 * Searches immediately to the LEFT (horizontal line) or immediately ABOVE (stacked label)
 */
export function detectAdjacentLabel(textItems, fieldRect) {
  if (!textItems || textItems.length === 0) return null;

  const { x, y, width, height } = fieldRect;
  const fieldMidY = y + height / 2;

  // 1. First priority: Check LEFT of the field on the same row/line
  const leftCandidates = textItems.filter(item => {
    const itemMidY = item.y + item.height / 2;
    const vOverlap = Math.abs(itemMidY - fieldMidY) < Math.max(14, height * 0.75);
    const isToTheLeft = (item.x + item.width) <= (x + 10);
    const dist = x - (item.x + item.width);
    return vOverlap && isToTheLeft && dist >= -10 && dist <= 240;
  });

  if (leftCandidates.length > 0) {
    leftCandidates.sort((a, b) => a.x - b.x);

    // Group adjacent words immediately preceding the field (max gap between words: 28pt)
    let chain = [leftCandidates[leftCandidates.length - 1]];
    for (let i = leftCandidates.length - 2; i >= 0; i--) {
      const prev = leftCandidates[i];
      const next = chain[0];
      const gap = next.x - (prev.x + prev.width);
      if (gap <= 28) {
        chain.unshift(prev);
      } else {
        break;
      }
    }

    const fullStr = chain.map(c => c.str).join(' ').trim();
    if (fullStr && fullStr.length >= 2 && fullStr.length <= 45) {
      const cleaned = cleanLabelText(fullStr);
      if (cleaned) {
        return {
          label: cleaned,
          name: sanitizeFieldName(cleaned),
          position: 'left'
        };
      }
    }
  }

  // 2. Second priority: Check immediately ABOVE the field (stacked form label)
  const topCandidates = textItems.filter(item => {
    const isAbove = (item.y + item.height) <= (y + 5);
    const distY = y - (item.y + item.height);
    const hOverlap = (item.x + item.width >= x - 12) && (item.x <= x + width + 12);
    return isAbove && distY >= -5 && distY <= 26 && hOverlap;
  });

  if (topCandidates.length > 0) {
    topCandidates.sort((a, b) => a.x - b.x);
    const fullStr = topCandidates.map(c => c.str).join(' ').trim();
    if (fullStr && fullStr.length >= 2 && fullStr.length <= 45) {
      const cleaned = cleanLabelText(fullStr);
      if (cleaned) {
        return {
          label: cleaned,
          name: sanitizeFieldName(cleaned),
          position: 'top'
        };
      }
    }
  }

  return null;
}

export function formatDateDisplay(val, format = 'DD/MM/YYYY') {
  if (!val) return '';
  const str = String(val).trim();

  // If in YYYY-MM-DD or YYYY/MM/DD format
  const isoMatch = str.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})$/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    if (format === 'DD-MM-YYYY') return `${dd}-${mm}-${yyyy}`;
    if (format === 'DD MM YYYY') return `${dd} ${mm} ${yyyy}`;
    if (format === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
    return `${dd}/${mm}/${yyyy}`;
  }

  // If in DD-MM-YYYY or DD/MM/YYYY or DD MM YYYY format
  const dmyMatch = str.match(/^(\d{2})[-\/\s](\d{2})[-\/\s](\d{4})$/);
  if (dmyMatch) {
    const [, dd, mm, yyyy] = dmyMatch;
    if (format === 'DD-MM-YYYY') return `${dd}-${mm}-${yyyy}`;
    if (format === 'DD MM YYYY') return `${dd} ${mm} ${yyyy}`;
    if (format === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
    return `${dd}/${mm}/${yyyy}`;
  }

  return str;
}

export function parseToIsoDate(val) {
  if (!val) return '';
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const match = str.match(/^(\d{2})[-\/\s](\d{2})[-\/\s](\d{4})$/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
}

export function isoToDisplayDate(isoVal, format = 'DD/MM/YYYY') {
  if (!isoVal) return '';
  return formatDateDisplay(isoVal, format);
}



