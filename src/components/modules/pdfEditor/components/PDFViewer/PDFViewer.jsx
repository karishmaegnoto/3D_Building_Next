import React, { useEffect, useRef } from 'react';
import { PDFPage } from '../PDFPage/PDFPage';

export function PDFViewer({
  pdfDoc,
  detectedPdfFont = 'Helvetica',
  numPages,
  pageSizes,
  currentPage,
  setCurrentPage,
  zoom,
  rotation,
  fitMode,
  handleFitMode,
  fields,
  selectedFieldId,
  activeTool,
  onSelectField,
  onAddField,
  onAddTextAsField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onOpenSignatureModal
}) {
  const containerRef = useRef(null);

  // ResizeObserver to automatically update zoom when in Fit-Width or Fit-Page modes
  useEffect(() => {
    if (!containerRef.current || fitMode === 'custom') return;

    const container = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const firstPageSize = pageSizes[1] || { width: 612, height: 792 };
        handleFitMode(fitMode, width, height, firstPageSize.width, firstPageSize.height);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [fitMode, handleFitMode, pageSizes]);

  // Track scroll position to update current active page
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestPage = 1;
      let minDistance = Infinity;

      for (let p = 1; p <= numPages; p++) {
        const pageEl = document.getElementById(`pdf-page-${p}`);
        if (pageEl) {
          const pageRect = pageEl.getBoundingClientRect();
          const pageCenter = pageRect.top + pageRect.height / 2;
          const distance = Math.abs(containerCenter - pageCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestPage = p;
          }
        }
      }

      if (closestPage !== currentPage) {
        setCurrentPage(closestPage);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [numPages, currentPage, setCurrentPage]);

  // Handle programmatically scrolling to currentPage when user changes it in toolbar
  useEffect(() => {
    const pageEl = document.getElementById(`pdf-page-${currentPage}`);
    const container = containerRef.current;
    if (pageEl && container) {
      const pageRect = pageEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const isVisible = pageRect.top >= containerRect.top && pageRect.bottom <= containerRect.bottom;

      if (!isVisible) {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPage]);

  const pagesArray = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div
      ref={containerRef}
      className={`pdf-viewer-workspace ${activeTool !== 'select' ? 'mode-placement' : 'mode-select'}`}
      onClick={(e) => {
        // If user clicks on empty gray workspace outside any page, deselect
        if (e.target === containerRef.current) {
          onSelectField(null);
        }
      }}
    >
      <div className="pdf-pages-container">
        {pagesArray.map((pageNum) => (
          <PDFPage
            key={pageNum}
            pdfDoc={pdfDoc}
            pageNumber={pageNum}
            scale={zoom}
            rotation={rotation}
            pageSize={pageSizes[pageNum]}
            detectedPdfFont={detectedPdfFont}
            fields={fields}
            selectedFieldId={selectedFieldId}
            activeTool={activeTool}
            onSelectField={onSelectField}
            onAddField={onAddField}
            onAddTextAsField={onAddTextAsField}
            onUpdateField={onUpdateField}
            onDeleteField={onDeleteField}
            onDuplicateField={onDuplicateField}
            onOpenSignatureModal={onOpenSignatureModal}
          />
        ))}
      </div>
    </div>
  );
}
