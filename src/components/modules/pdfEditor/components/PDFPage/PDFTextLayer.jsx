import React, { useEffect, useState } from 'react';
import { convertTextItemToField, isTextCoveredByField, cleanFontFamilyName } from '../../utils/fieldUtils.js';

export function PDFTextLayer({
  pdfDoc,
  pageNumber,
  scale,
  pageHeight,
  fields,
  onAddTextAsField,
  activeTool
}) {
  const [textItems, setTextItems] = useState([]);

  useEffect(() => {
    if (!pdfDoc) return;

    let isMounted = true;

    const extractText = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (!isMounted) return;

        const content = await page.getTextContent();
        if (!isMounted) return;

        const styles = content.styles || {};
        const items = [];
        for (let i = 0; i < content.items.length; i++) {
          const item = content.items[i];
          const text = (item.str || '').trim();
          if (!text) continue;

          const fontObj = styles[item.fontName];
          const itemFont = fontObj?.fontFamily ? cleanFontFamilyName(fontObj.fontFamily) : 'Helvetica';

          const left = item.transform[4];
          const baselineY = item.transform[5];
          const itemHeight = item.height || 10;
          const top = pageHeight - baselineY - itemHeight;
          const width = item.width || 12;

          items.push({
            id: `txt_${pageNumber}_${i}`,
            str: item.str,
            text: item.str,
            fontFamily: itemFont,
            x: Math.round(left * 10) / 10,
            y: Math.round(top * 10) / 10,
            width: Math.round(width * 10) / 10,
            height: Math.round(itemHeight * 10) / 10
          });

        }

        if (isMounted) {
          setTextItems(items);
        }
      } catch (err) {
        console.warn(`Could not extract text items on page ${pageNumber}:`, err);
      }
    };

    extractText();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, pageNumber, pageHeight]);

  // Filter out text items that are already covered by an existing field
  const uncoveredItems = textItems.filter(item => !isTextCoveredByField(item, fields, pageNumber));

  // Only enable clickable targets when text or date tool is explicitly active
  const isInteractive = activeTool === 'text' || activeTool === 'date';
  if (!isInteractive || uncoveredItems.length === 0) {
    return null;
  }

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    e.preventDefault();



    const newField = convertTextItemToField(item, pageNumber);
    onAddTextAsField(newField);
  };

  return (
    <div
      className="pdf-text-click-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 15
      }}
    >
      {uncoveredItems.map((item) => (
        <div
          key={item.id}
          className="pdf-text-target-box"
          style={{
            position: 'absolute',
            left: `${item.x * scale}px`,
            top: `${item.y * scale}px`,
            width: `${Math.max(item.width * scale, 16)}px`,
            height: `${Math.max(item.height * scale, 12)}px`,
            pointerEvents: 'auto'
          }}
          title={`Click to edit: "${item.str}"`}
          onClick={(e) => handleItemClick(e, item)}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleItemClick(e, item);
          }}
        >
          <span className="text-target-indicator" />
        </div>
      ))}
    </div>
  );
}
