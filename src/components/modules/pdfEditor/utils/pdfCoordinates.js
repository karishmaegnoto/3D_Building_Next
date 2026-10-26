
export function pdfToScreen(val, scale) {
  return val * scale;
}


export function screenToPdf(val, scale) {
  return val / scale;
}


export function fieldPdfToScreen(field, scale) {
  return {
    x: field.x * scale,
    y: field.y * scale,
    width: field.width * scale,
    height: field.height * scale
  };
}


export function screenRectToPdf(rect, scale) {
  return {
    x: rect.x / scale,
    y: rect.y / scale,
    width: rect.width / scale,
    height: rect.height / scale
  };
}


export function toPdfLibCoordinates(rect, pageHeight) {
  return {
    x: rect.x,
    y: pageHeight - (rect.y + rect.height),
    width: rect.width,
    height: rect.height
  };
}


export function annotationRectToPdfRect(rect, pageHeight) {
  const [x1, y1, x2, y2] = rect;
  const width = Math.max(Math.abs(x2 - x1), 4);
  const height = Math.max(Math.abs(y2 - y1), 4);
  const x = Math.min(x1, x2);
  const maxY = Math.max(y1, y2);
  const y = pageHeight - maxY;

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    width: Math.round(width * 10) / 10,
    height: Math.round(height * 10) / 10
  };
}


export function clampFieldToPage(rect, pageWidth, pageHeight) {
  const width = Math.min(rect.width, pageWidth);
  const height = Math.min(rect.height, pageHeight);
  const x = Math.max(0, Math.min(rect.x, pageWidth - width));
  const y = Math.max(0, Math.min(rect.y, pageHeight - height));

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    width: Math.round(width * 10) / 10,
    height: Math.round(height * 10) / 10
  };
}
