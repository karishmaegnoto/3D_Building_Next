import React, { useEffect, useRef, useState } from 'react';
import { Layers, X } from 'lucide-react';

export function ThumbnailItem({
  pdfDoc,
  pageNumber,
  pageSize,
  isActive,
  fieldCount,
  onClick
}) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isMounted = true;
    let renderTask = null;

    const renderThumbnail = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (!isMounted) return;

        // Render at small fixed width (e.g. 120px)
        const targetWidth = 120;
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const scale = targetWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        renderTask = page.render({ canvasContext: ctx, viewport });

        await renderTask.promise;
        if (isMounted) setRendered(true);
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.warn(`Thumbnail p${pageNumber} error:`, err);
        }
      }
    };

    renderThumbnail();

    return () => {
      isMounted = false;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div
      id={`thumb-item-${pageNumber}`}
      className={`thumbnail-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="thumbnail-canvas-wrap">
        <canvas ref={canvasRef} className="thumbnail-canvas" />
        {fieldCount > 0 && (
          <span className="thumbnail-field-count" title={`${fieldCount} form fields on this page`}>
            {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
          </span>
        )}
      </div>
      <div className="thumbnail-page-label">Page {pageNumber}</div>
    </div>
  );
}

export function ThumbnailsSidebar({
  pdfDoc,
  numPages,
  pageSizes,
  currentPage,
  onSelectPage,
  fields,
  isOpen,
  onClose
}) {
  if (!isOpen) return null;

  const pages = Array.from({ length: numPages || 0 }, (_, i) => i + 1);

  return (
    <aside className="thumbnails-sidebar" aria-label="Page Thumbnails">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <Layers size={16} />
          <span>Pages ({numPages})</span>
        </div>
        <button type="button" className="close-panel-btn" onClick={onClose} title="Hide Sidebar">
          <X size={15} />
        </button>
      </div>

      <div className="thumbnails-list">
        {pages.map((p) => {
          const pageFieldCount = fields.filter((f) => f.pageNumber === p).length;
          return (
            <ThumbnailItem
              key={p}
              pdfDoc={pdfDoc}
              pageNumber={p}
              pageSize={pageSizes[p]}
              isActive={currentPage === p}
              fieldCount={pageFieldCount}
              onClick={() => onSelectPage(p)}
            />
          );
        })}
      </div>
    </aside>
  );
}
