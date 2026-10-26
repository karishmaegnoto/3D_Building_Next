import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Maximize2,
  Minimize2,
  PanelLeft,
  Redo2,
  RotateCw,
  Save,
  Sliders,
  Undo2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { ZOOM_PRESETS } from '../../hooks/usePdfViewerState';

export function HeaderToolbar({
  onBack,
  fileName,
  fileSize,
  currentPage,
  numPages,
  onGoToPage,
  onPrevPage,
  onNextPage,
  zoom,
  onZoomIn,
  onZoomOut,
  onSetZoomLevel,
  fitMode,
  onSetFitMode,
  onRotate,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  sidebarOpen,
  onToggleSidebar,
  propertiesOpen,
  onToggleProperties,
  onOpenUpload,
  onOpenMapping,
  onDownloadPdf,
  onExportPdf,
  isExporting,
  lastExported,
  onPreviewExported
}) {
  const [pageInputVal, setPageInputVal] = useState(String(currentPage));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef(null);

  // Sync page input when currentPage updates
  React.useEffect(() => {
    setPageInputVal(String(currentPage));
  }, [currentPage]);

  const handlePageSubmit = (e) => {
    if (e.key === 'Enter') {
      const page = parseInt(pageInputVal, 10);
      if (!isNaN(page)) {
        onGoToPage(page);
      }
    }
  };

  const handleZoomSelect = (val) => {
    if (val === 'fit-width' || val === 'fit-page') {
      onSetFitMode(val);
    } else {
      onSetZoomLevel(parseFloat(val));
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  };

  const zoomPercentLabel = fitMode !== 'custom'
    ? fitMode === 'fit-width' ? 'Fit Width' : 'Fit Page'
    : `${Math.round(zoom * 100)}%`;

  return (
    <header className="acrobat-header" role="banner">
      {/* Left section: App Brand, File Info, Upload */}
      <div className="header-section header-left">
        {onBack && (
          <button
            type="button"
            className="header-btn"
            title="Back to Template Setup"
            onClick={onBack}
            style={{ marginRight: 6, gap: 5, fontWeight: 500 }}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
        )}

        <div className="brand-logo" title="Quote PDF Editor">
          <div className="brand-icon">
            <FileText size={18} />
          </div>
          <span className="brand-title">Quote PDF Editor</span>
        </div>

        <div className="file-info-badge" title={fileName}>
          <span className="file-name-text">{fileName || 'Untitled.pdf'}</span>
          {fileSize && <span className="file-size-tag">{fileSize}</span>}
        </div>
      </div>

      {/* Center section: Page Navigation & Undo / Redo */}
      <div className="header-section header-center">
        <div className="page-nav-controls">
          <button
            id="btn-prev-page"
            type="button"
            className="header-btn icon-only"
            disabled={currentPage <= 1}
            onClick={onPrevPage}
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="page-number-box">
            <input
              id="input-current-page"
              type="text"
              className="page-input"
              value={pageInputVal}
              onChange={(e) => setPageInputVal(e.target.value)}
              onKeyDown={handlePageSubmit}
              onBlur={() => onGoToPage(parseInt(pageInputVal, 10) || 1)}
              aria-label="Current Page"
            />
            <span className="page-total">/ {numPages || 1}</span>
          </div>

          <button
            id="btn-next-page"
            type="button"
            className="header-btn icon-only"
            disabled={currentPage >= numPages}
            onClick={onNextPage}
            title="Next Page (Right Arrow)"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="header-divider" />

        <div className="history-controls">
          <button
            id="btn-undo"
            type="button"
            className="header-btn icon-only"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            id="btn-redo"
            type="button"
            className="header-btn icon-only"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>

      {/* Right section: Zoom, Rotation, Fullscreen, Panes & Save/Download */}
      <div className="header-section header-right">
        {/* Zoom controls */}
        <div className="zoom-controls">
          <button
            id="btn-zoom-out"
            type="button"
            className="header-btn icon-only"
            onClick={onZoomOut}
            title="Zoom Out (Ctrl -)"
          >
            <ZoomOut size={16} />
          </button>

          <div className="zoom-dropdown-wrap">
            <select
              id="select-zoom-preset"
              className="zoom-select"
              value={fitMode !== 'custom' ? fitMode : zoom}
              onChange={(e) => handleZoomSelect(e.target.value)}
              aria-label="Zoom Level"
            >
              {ZOOM_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
            <span className="zoom-display-badge">{zoomPercentLabel}</span>
          </div>

          <button
            id="btn-zoom-in"
            type="button"
            className="header-btn icon-only"
            onClick={onZoomIn}
            title="Zoom In (Ctrl +)"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="header-divider" />

        {/* Rotate Button */}
        <button
          id="btn-rotate"
          type="button"
          className="header-btn icon-only"
          onClick={onRotate}
          title="Rotate Clockwise 90°"
        >
          <RotateCw size={16} />
        </button>

        {/* Toggle Thumbnails Sidebar */}
        <button
          id="btn-toggle-thumbnails"
          type="button"
          className={`header-btn icon-only ${sidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title="Toggle Page Thumbnails"
        >
          <PanelLeft size={16} />
        </button>

        {/* Toggle Properties Panel */}
        <button
          id="btn-toggle-properties"
          type="button"
          className={`header-btn icon-only ${propertiesOpen ? 'active' : ''}`}
          onClick={onToggleProperties}
          title="Toggle Field Properties"
        >
          <Sliders size={16} />
        </button>

        {/* Fullscreen toggle */}
        <button
          id="btn-fullscreen"
          type="button"
          className="header-btn icon-only"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        {/* Save Template Button */}
        <button
          id="btn-save-template"
          type="button"
          className="header-btn primary-action-btn"
          disabled={isExporting}
          onClick={() => onExportPdf?.()}
          title="Save Quote Template to Server"
        >
          <Save size={15} />
          <span>{isExporting ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </header>
  );
}
