import React, { useEffect, useRef, useState } from 'react';
import { FieldOverlay } from '../FieldOverlay/FieldOverlay';
import { PDFTextLayer } from './PDFTextLayer';
import { extractPageTextItems } from '../../utils/fieldUtils';

export function PDFPage({
  pdfDoc,
  pageNumber,
  scale,
  rotation,
  pageSize,
  detectedPdfFont = 'Helvetica',
  fields,
  selectedFieldId,
  activeTool,
  onSelectField,
  onAddField,
  onAddTextAsField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onOpenSignatureModal,
  isVisible = true
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  const [pageTextItems, setPageTextItems] = useState([]);

  const pageWidth = pageSize?.width || 612;
  const pageHeight = pageSize?.height || 792;

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isMounted = true;

    const renderPage = async () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch { }
      }

      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (!isMounted) return;
        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

        const renderContext = {
          canvasContext: ctx,
          viewport,
          transform: transform || undefined,
          intent: 'display',
          annotationMode: 0
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;

        await task.promise;
        if (isMounted) {
          setIsRendered(true);
        }
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error(`Page ${pageNumber} render error:`, err);
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch { }
      }
    };
  }, [pdfDoc, pageNumber, scale, rotation]);

  useEffect(() => {
    let isMounted = true;
    if (pdfDoc && pageNumber) {
      extractPageTextItems(pdfDoc, pageNumber, pageHeight).then(items => {
        if (isMounted) {
          setPageTextItems(items);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [pdfDoc, pageNumber, pageHeight]);

  const displayWidth = pageWidth * scale;
  const displayHeight = pageHeight * scale;

  return (
    <div
      id={`pdf-page-${pageNumber}`}
      ref={containerRef}
      className="pdf-page-wrapper"
      data-page-number={pageNumber}
      style={{
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        minWidth: `${displayWidth}px`,
        minHeight: `${displayHeight}px`,
        flexShrink: 0
      }}
    >
      <canvas ref={canvasRef} className="pdf-page-canvas" />

      <PDFTextLayer
        pdfDoc={pdfDoc}
        pageNumber={pageNumber}
        scale={scale}
        pageHeight={pageHeight}
        fields={fields}
        onAddTextAsField={onAddTextAsField || onAddField}
        activeTool={activeTool}
      />

      <FieldOverlay
        pageNumber={pageNumber}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        scale={scale}
        fields={fields}
        selectedFieldId={selectedFieldId}
        activeTool={activeTool}
        detectedPdfFont={detectedPdfFont}
        canvasRef={canvasRef}
        pdfDoc={pdfDoc}
        pageTextItems={pageTextItems}
        onSelectField={onSelectField}
        onAddField={onAddField}
        onUpdateField={onUpdateField}
        onDeleteField={onDeleteField}
        onDuplicateField={onDuplicateField}
        onOpenSignatureModal={onOpenSignatureModal}
      />

      <div className="pdf-page-tag">
        Page {pageNumber}
      </div>
    </div>
  );
}
