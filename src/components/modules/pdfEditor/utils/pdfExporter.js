import { PDFDocument, rgb, TextAlignment, StandardFonts, PDFName, PDFArray, PDFHexString } from 'pdf-lib';
import { FIELD_TYPES } from '../types/fields.js';
import { toPdfLibCoordinates } from './pdfCoordinates.js';
import { formatDateDisplay } from './fieldUtils.js';

async function getPdfLibFont(pdfDoc, fontFamily, isBold, isItalic) {
  const fam = (fontFamily || '').toLowerCase();
  try {
    if (fam.includes('times')) {
      if (isBold && isItalic) return await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
      if (isBold) return await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      if (isItalic) return await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      return await pdfDoc.embedFont(StandardFonts.TimesRoman);
    }
    if (fam.includes('courier') || fam.includes('mono')) {
      if (isBold && isItalic) return await pdfDoc.embedFont(StandardFonts.CourierBoldOblique);
      if (isBold) return await pdfDoc.embedFont(StandardFonts.CourierBold);
      if (isItalic) return await pdfDoc.embedFont(StandardFonts.CourierOblique);
      return await pdfDoc.embedFont(StandardFonts.Courier);
    }
    // Default to Helvetica for sans-serif / Arial / Helvetica / Inter / Calibri / etc.
    if (isBold && isItalic) return await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
    if (isBold) return await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    if (isItalic) return await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    return await pdfDoc.embedFont(StandardFonts.Helvetica);
  } catch (err) {
    console.warn('Could not embed font:', err);
    return null;
  }
}

export function hexToPdfRgb(hex, fallback = rgb(0, 0, 0)) {
  if (!hex || typeof hex !== 'string' || hex === 'transparent') return null;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return rgb(r, g, b);
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
  }
  return fallback;
}

function convertImageToPngDataUrl(src) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(null);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 300;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Canvas image conversion failed:', err);
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = src;
  });
}

async function embedImageToPdf(pdfDoc, page, field, coords) {
  const imgUrl = field.imageUrl || field.value;
  if (!imgUrl) return;

  try {
    let embeddedImg = null;
    if (typeof imgUrl === 'string' && (imgUrl.startsWith('data:image/jpeg') || imgUrl.startsWith('data:image/jpg'))) {
      embeddedImg = await pdfDoc.embedJpg(imgUrl);
    } else if (typeof imgUrl === 'string' && imgUrl.startsWith('data:image/png')) {
      embeddedImg = await pdfDoc.embedPng(imgUrl);
    } else {
      const pngData = await convertImageToPngDataUrl(imgUrl);
      if (pngData) {
        embeddedImg = await pdfDoc.embedPng(pngData);
      }
    }

    if (embeddedImg) {
      if (field.backgroundColor && field.backgroundColor !== 'transparent') {
        const bgRgb = hexToPdfRgb(field.backgroundColor);
        if (bgRgb) {
          page.drawRectangle({
            x: coords.x,
            y: coords.y,
            width: coords.width,
            height: coords.height,
            color: bgRgb
          });
        }
      }

      let drawX = coords.x;
      let drawY = coords.y;
      let drawW = coords.width;
      let drawH = coords.height;

      const objFit = field.objectFit || 'contain';
      if (objFit === 'contain' && embeddedImg.width && embeddedImg.height) {
        const imgRatio = embeddedImg.width / embeddedImg.height;
        const boxRatio = coords.width / coords.height;
        if (imgRatio > boxRatio) {
          drawW = coords.width;
          drawH = coords.width / imgRatio;
          drawY = coords.y + (coords.height - drawH) / 2;
        } else {
          drawH = coords.height;
          drawW = coords.height * imgRatio;
          drawX = coords.x + (coords.width - drawW) / 2;
        }
      }

      const opacity = field.opacity !== undefined ? Math.max(0, Math.min(1, Number(field.opacity))) : 1;

      page.drawImage(embeddedImg, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH,
        opacity
      });

      if (field.borderWidth && Number(field.borderWidth) > 0 && field.borderColor && field.borderColor !== 'transparent') {
        const borderRgb = hexToPdfRgb(field.borderColor, rgb(0, 0, 0));
        if (borderRgb) {
          page.drawRectangle({
            x: coords.x,
            y: coords.y,
            width: coords.width,
            height: coords.height,
            borderWidth: Number(field.borderWidth),
            borderColor: borderRgb
          });
        }
      }
    }
  } catch (err) {
    console.warn(`Could not embed image field "${field.name}":`, err);
  }
}

export async function exportPdfDocument(originalBuffer, fields, options = {}) {
  const { flatten = false, fileName = 'document_edited.pdf' } = options;

  if (!originalBuffer) {
    throw new Error('No PDF document loaded.');
  }

  // Load the original PDF into pdf-lib
  const pdfDoc = await PDFDocument.load(originalBuffer, { ignoreEncryption: true });
  const numPages = pdfDoc.getPageCount();

  // Sanitize /Annots on all pages:
  for (let i = 0; i < numPages; i++) {
    const page = pdfDoc.getPage(i);
    const annotsRef = page.node.get(PDFName.of('Annots'));
    if (annotsRef) {
      const lookedUp = pdfDoc.context.lookup(annotsRef);
      if (!(lookedUp instanceof PDFArray)) {
        page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([]));
      }
    }
  }

  const form = pdfDoc.getForm();

  // Deduplicate new field names if any collide
  const registeredNames = new Set();
  try {
    const existingPdfFields = form.getFields();
    for (const f of existingPdfFields) {
      registeredNames.add(f.getName());
    }
  } catch (e) {
    console.warn('Could not read existing field names:', e);
  }

  function getUniqueFieldName(baseName) {
    let name = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!name) name = 'field';
    let counter = 1;
    let candidate = name;
    while (registeredNames.has(candidate)) {
      candidate = `${name}_${counter++}`;
    }
    registeredNames.add(candidate);
    return candidate;
  }

  // Group fields into existing vs new
  for (const field of fields) {
    const pageIndex = (field.pageNumber || 1) - 1;
    if (pageIndex < 0 || pageIndex >= numPages) continue;

    const page = pdfDoc.getPage(pageIndex);
    const pageHeight = page.getHeight();
    const coords = toPdfLibCoordinates(field, pageHeight);

    if (field.isExistingAcroField) {
      // Update pre-existing AcroForm field
      try {
        const existingField = form.getField(field.originalName || field.name);
        if (existingField) {
          // If the field was renamed by user/mapping, update its AcroForm name in the PDF dictionary
          if (field.name && field.name !== (field.originalName || existingField.getName())) {
            try {
              existingField.acroField.dict.set(PDFName.of('T'), PDFHexString.fromText(field.name));
            } catch (renameErr) {
              console.warn('Could not rename AcroField in PDF:', renameErr);
            }
          }

          // Update field rectangle if position or dimensions changed
          try {
            const widgets = existingField.acroField.getWidgets();
            if (widgets && widgets.length > 0) {
              widgets[0].setRectangle({
                x: coords.x,
                y: coords.y,
                width: coords.width,
                height: coords.height
              });
            }
          } catch (rectErr) {
            console.warn('Could not update field rectangle:', rectErr);
          }

          if (field.type === FIELD_TYPES.CHECKBOX) {
            if (field.checked) {
              existingField.check();
            } else {
              existingField.uncheck();
            }
          } else if (field.type === FIELD_TYPES.RADIO) {
            try {
              const radioGroup = form.getRadioGroup(field.groupName || field.name);
              if (field.checked && field.optionValue) {
                radioGroup.select(field.optionValue);
              }
            } catch (err) {
              console.warn('Radio update failed:', err);
            }
          } else if (field.type === FIELD_TYPES.DROPDOWN) {
            try {
              const dropdown = form.getDropdown(field.name);
              if (field.value) {
                dropdown.select(field.value);
              }
            } catch (err) {
              console.warn('Dropdown update failed:', err);
            }
          } else if (field.type === FIELD_TYPES.IMAGE) {
            if (field.imageUrl || field.value) {
              await embedImageToPdf(pdfDoc, page, field, coords);
            }
          } else {
            // Text, textarea, date
            try {
              const textField = form.getTextField(field.name);
              const isSingleLine = field.type === FIELD_TYPES.TEXT || field.type === FIELD_TYPES.DESCRIPTION || field.type === FIELD_TYPES.DATE;
              const effectiveFontSize = field.fontSize ? Number(field.fontSize) : (isSingleLine ? 9 : 12);
              try {
                textField.setFontSize(effectiveFontSize);
              } catch (e) {
                console.warn('Could not update font size:', e);
              }
              if (field.alignment === 'center') {
                try {
                  textField.setAlignment(TextAlignment.Center);
                } catch (e) {
                  console.warn('Could not update alignment:', e);
                }
              } else if (field.alignment === 'right') {
                try {
                  textField.setAlignment(TextAlignment.Right);
                } catch (e) {
                  console.warn('Could not update alignment:', e);
                }
              }
              let textVal = String(field.value ?? '');
              if (field.uppercase) {
                textVal = textVal.toUpperCase();
              }
              textField.setText(textVal);
              try {
                const fontObj = await getPdfLibFont(pdfDoc, field.fontFamily, field.bold, field.italic);
                if (fontObj) {
                  textField.defaultUpdateAppearances(fontObj);
                }
              } catch (fontErr) {
                console.warn('Could not apply font to existing text field:', fontErr);
              }
            } catch (err) {
              console.warn('Text field update failed:', err);
            }
          }
        }
      } catch (err) {
        console.warn(`Could not find or update field "${field.name}":`, err);
      }
    } else {
      // Add newly created field
      const isDefaultName = /^(text|field|date|checkbox|radio|dropdown|size)_\d+(_copy)?$/i.test(field.name || '');
      const customLabel = field.label && !/^(text|field|date|checkbox|radio|dropdown|size)\s*(field)?\s*\d+/i.test(field.label) ? field.label : null;
      const customValue = field.value && typeof field.value === 'string' && field.value.trim().length > 0 && field.value.length < 40 ? field.value.trim() : null;
      const effectiveName = (isDefaultName && (customLabel || customValue)) ? (customLabel || customValue) : (field.name || `field_${field.type}`);
      const safeName = getUniqueFieldName(effectiveName);

      try {
        switch (field.type) {
          case FIELD_TYPES.TEXT:
          case FIELD_TYPES.DESCRIPTION: {
            const bgRgb = hexToPdfRgb(field.backgroundColor, rgb(1, 1, 1));
            if (flatten && field.backgroundColor !== 'transparent' && bgRgb) {
              page.drawRectangle({
                x: coords.x,
                y: coords.y,
                width: coords.width,
                height: coords.height,
                color: bgRgb,
                borderWidth: 0
              });
            }
            const effectiveFontSize = field.fontSize ? Number(field.fontSize) : 9;
            const tf = form.createTextField(safeName);
            const textRgb = hexToPdfRgb(field.textColor, rgb(0, 0, 0));
            tf.addToPage(page, {
              x: coords.x,
              y: coords.y,
              width: coords.width,
              height: coords.height,
              borderWidth: 0,
              textColor: textRgb || rgb(0, 0, 0)
            });
            try {
              tf.setFontSize(effectiveFontSize);
            } catch (e) {
              console.warn('Could not set font size:', e);
            }
            try {
              const fontObj = await getPdfLibFont(pdfDoc, field.fontFamily, field.bold, field.italic);
              if (fontObj) {
                tf.defaultUpdateAppearances(fontObj);
              }
            } catch (fontErr) {
              console.warn('Could not apply font to text field:', fontErr);
            }
            if (field.alignment === 'center') {
              try {
                tf.setAlignment(TextAlignment.Center);
              } catch (e) {
                console.warn('Could not set alignment:', e);
              }
            } else if (field.alignment === 'right') {
              try {
                tf.setAlignment(TextAlignment.Right);
              } catch (e) {
                console.warn('Could not set alignment:', e);
              }
            }
            let textVal = String(field.value ?? '');
            if (field.uppercase) {
              textVal = textVal.toUpperCase();
            }
            try {
              tf.setText(textVal);
            } catch (txtErr) {
              console.warn('Could not set text value on field:', txtErr);
            }
            break;
          }

          case FIELD_TYPES.TEXTAREA: {
            const bgRgb = hexToPdfRgb(field.backgroundColor, rgb(1, 1, 1));
            if (flatten && field.backgroundColor !== 'transparent' && bgRgb) {
              page.drawRectangle({
                x: coords.x,
                y: coords.y,
                width: coords.width,
                height: coords.height,
                color: bgRgb,
                borderWidth: 0
              });
            }
            const ta = form.createTextField(safeName);
            ta.enableMultiline();
            const textRgb = hexToPdfRgb(field.textColor, rgb(0, 0, 0));
            ta.addToPage(page, {
              x: coords.x,
              y: coords.y,
              width: coords.width,
              height: coords.height,
              borderWidth: 1,
              borderColor: rgb(0.7, 0.75, 0.8),
              textColor: textRgb || rgb(0, 0, 0)
            });
            if (field.fontSize) {
              try {
                ta.setFontSize(field.fontSize);
              } catch (e) {
                console.warn('Could not set font size on textarea:', e);
              }
            }
            try {
              const fontObj = await getPdfLibFont(pdfDoc, field.fontFamily, field.bold, field.italic);
              if (fontObj) {
                ta.defaultUpdateAppearances(fontObj);
              }
            } catch (fontErr) {
              console.warn('Could not apply font to textarea:', fontErr);
            }
            let taVal = String(field.value ?? '');
            if (field.uppercase) {
              taVal = taVal.toUpperCase();
            }
            ta.setText(taVal);
            break;
          }

          case FIELD_TYPES.CHECKBOX: {
            const cb = form.createCheckBox(safeName);
            if (field.checked) cb.check();
            cb.addToPage(page, {
              x: coords.x,
              y: coords.y,
              width: coords.width,
              height: coords.height,
              borderWidth: 1.5,
              borderColor: rgb(0, 0, 0)
            });
            break;
          }

          case FIELD_TYPES.RADIO: {
            const groupName = field.groupName || safeName;
            let radioGroup;
            try {
              radioGroup = form.getRadioGroup(groupName);
            } catch {
              radioGroup = form.createRadioGroup(groupName);
            }
            const optVal = field.optionValue || 'Choice';
            radioGroup.addOptionToPage(optVal, page, {
              x: coords.x,
              y: coords.y,
              width: coords.width,
              height: coords.height,
              borderWidth: 1.5,
              borderColor: rgb(0, 0, 0)
            });
            if (field.checked) {
              radioGroup.select(optVal);
            }
            break;
          }

          case FIELD_TYPES.DROPDOWN: {
            if (flatten) {
              page.drawRectangle({
                x: coords.x,
                y: coords.y,
                width: coords.width,
                height: coords.height,
                color: rgb(1, 1, 1),
                borderWidth: 0
              });
            }
            const dd = form.createDropdown(safeName);
            const opts = Array.isArray(field.options) && field.options.length > 0 ? field.options : ['Option 1', 'Option 2'];
            dd.setOptions(opts);
            if (field.value && opts.includes(field.value)) {
              dd.select(field.value);
            } else if (opts.length > 0) {
              dd.select(opts[0]);
            }
            dd.addToPage(page, {
              x: coords.x,
              y: coords.y,
              width: coords.width,
              height: coords.height,
              borderWidth: 1,
              borderColor: rgb(0.7, 0.75, 0.8)
            });
            break;
          }

          case FIELD_TYPES.DATE: {
            const bgRgb = hexToPdfRgb(field.backgroundColor, rgb(1, 1, 1));
            if (flatten && field.backgroundColor !== 'transparent' && bgRgb) {
              page.drawRectangle({
                x: coords.x,
                y: coords.y,
                width: coords.width,
                height: coords.height,
                color: bgRgb,
                borderWidth: 0
              });
            }
            const effectiveFontSize = field.fontSize ? Number(field.fontSize) : 9;
            const df = form.createTextField(safeName);
            const textRgb = hexToPdfRgb(field.textColor, rgb(0, 0, 0));
            df.addToPage(page, {
              x: coords.x,
              y: coords.y,
              width: coords.width,
              height: coords.height,
              borderWidth: 0,
              textColor: textRgb || rgb(0, 0, 0)
            });
            try {
              df.setFontSize(effectiveFontSize);
            } catch (e) {
              console.warn('Could not set font size on date field:', e);
            }
            try {
              const fontObj = await getPdfLibFont(pdfDoc, field.fontFamily, field.bold, field.italic);
              if (fontObj) {
                df.defaultUpdateAppearances(fontObj);
              }
            } catch (fontErr) {
              console.warn('Could not apply font to date field:', fontErr);
            }
            try {
              const exportVal = field.value
                ? formatDateDisplay(field.value, field.dateFormat || 'DD/MM/YYYY')
                : '';
              df.setText(exportVal);
            } catch (txtErr) {
              console.warn('Could not set text value on date field:', txtErr);
            }
            break;
          }

          case FIELD_TYPES.SIGNATURE: {
            if (field.signatureDataUrl) {
              // User drew or typed a signature - embed image directly
              try {
                const pngImage = await pdfDoc.embedPng(field.signatureDataUrl);
                page.drawImage(pngImage, {
                  x: coords.x,
                  y: coords.y,
                  width: coords.width,
                  height: coords.height
                });
              } catch (sigErr) {
                console.warn('Could not embed signature PNG, falling back to field:', sigErr);
                const sigField = form.createTextField(safeName);
                sigField.setText(field.signerName || '[Signature]');
                sigField.addToPage(page, {
                  x: coords.x,
                  y: coords.y,
                  width: coords.width,
                  height: coords.height,
                  borderWidth: 1
                });
              }
            } else {
              // Empty signature placeholder field
              const sigField = form.createTextField(safeName);
              sigField.setText(field.signerName || '');
              sigField.addToPage(page, {
                x: coords.x,
                y: coords.y,
                width: coords.width,
                height: coords.height,
                borderWidth: 1,
                borderColor: rgb(0.7, 0.75, 0.8)
              });
            }
            break;
          }

          case FIELD_TYPES.IMAGE: {
            if (field.imageUrl || field.value) {
              await embedImageToPdf(pdfDoc, page, field, coords);
            }
            try {
              const btn = form.createButton(safeName);
              btn.addToPage(field.label || 'Image', page, {
                x: coords.x,
                y: coords.y,
                width: coords.width,
                height: coords.height,
                borderWidth: 0,
              });
              try {
                btn.acroField.dict.set(PDFName.of('TU'), PDFHexString.fromText('image'));
              } catch (tuErr) {
                console.warn('Could not set TU on image button:', tuErr);
              }
            } catch (btnErr) {
              console.warn('Could not create AcroForm button for image field:', btnErr);
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error(`Failed to create new field "${safeName}":`, err);
      }
    }
  }

  // Handle Flatten option
  if (flatten) {
    try {
      form.flatten();
    } catch (flattenErr) {
      console.warn('Form flattening error:', flattenErr);
    }
  }

  // Save the modified PDF with resilient fallback
  let pdfBytes;
  try {
    pdfBytes = await pdfDoc.save();
  } catch (saveErr) {
    console.warn('Standard appearance update failed, saving with updateFieldAppearances: false fallback:', saveErr);
    pdfBytes = await pdfDoc.save({ updateFieldAppearances: false });
  }

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return { pdfBytes, blob };
}

export function triggerPdfDownload(blob, fileName = 'document.pdf') {
  // Ensure valid .pdf extension and clean alphanumeric filename
  let cleanName = (fileName || 'document.pdf').trim();
  if (!cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName = `${cleanName}.pdf`;
  }
  // Sanitize filename to avoid OS reserved characters
  cleanName = cleanName.replace(/[<>:"/\\|?*]+/g, '_');

  // Ensure blob has application/pdf MIME type
  const pdfBlob = blob.type === 'application/pdf'
    ? blob
    : new Blob([blob], { type: 'application/pdf' });

  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = cleanName;
  a.setAttribute('download', cleanName);
  document.body.appendChild(a);
  a.click();

  // Keep object URL alive for 60 seconds so Chrome/Edge finishes writing the file with the correct name and extension
  setTimeout(() => {
    try {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, 60000);

  return true;
}
