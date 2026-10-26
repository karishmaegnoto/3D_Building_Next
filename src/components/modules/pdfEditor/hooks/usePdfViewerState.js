import { useCallback, useState } from 'react';

export const ZOOM_PRESETS = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1.0 },
  { label: '125%', value: 1.25 },
  { label: '150%', value: 1.5 },
  { label: '160%', value: 1.6 },
  { label: '200%', value: 2.0 },
  { label: 'Fit to Width', value: 'fit-width' },
  { label: 'Fit to Page', value: 'fit-page' }
];

export function usePdfViewerState(numPages = 1) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.6);
  const [fitMode, setFitMode] = useState('custom');
  const [rotation, setRotation] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const zoomIn = useCallback(() => {
    setFitMode('custom');
    setZoom(prev => Math.min(Math.round((prev + 0.15) * 100) / 100, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setFitMode('custom');
    setZoom(prev => Math.max(Math.round((prev - 0.15) * 100) / 100, 0.4));
  }, []);

  const setZoomLevel = useCallback((level) => {
    setFitMode('custom');
    setZoom(Math.max(0.3, Math.min(3.0, level)));
  }, []);

  const handleFitMode = useCallback((mode, containerWidth, containerHeight, pageWidth, pageHeight) => {
    setFitMode(mode);
    if (!containerWidth || !pageWidth) return;

    if (mode === 'fit-width') {
      const padding = 60; // account for margins
      const availableWidth = Math.max(200, containerWidth - padding);
      const calculatedScale = Math.round((availableWidth / pageWidth) * 100) / 100;
      setZoom(Math.max(0.4, Math.min(2.5, calculatedScale)));
    } else if (mode === 'fit-page') {
      const padW = 60;
      const padH = 60;
      const scaleW = (containerWidth - padW) / pageWidth;
      const scaleH = (containerHeight - padH) / pageHeight;
      const calculatedScale = Math.round(Math.min(scaleW, scaleH) * 100) / 100;
      setZoom(Math.max(0.4, Math.min(2.5, calculatedScale)));
    }
  }, []);

  const rotateClockwise = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const rotateCounterClockwise = useCallback(() => {
    setRotation(prev => (prev + 270) % 360);
  }, []);

  const goToPage = useCallback((page) => {
    const p = Math.max(1, Math.min(numPages || 1, parseInt(page, 10) || 1));
    setCurrentPage(p);
  }, [numPages]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(numPages || 1, prev + 1));
  }, [numPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  return {
    currentPage,
    setCurrentPage,
    zoom,
    setZoomLevel,
    zoomIn,
    zoomOut,
    fitMode,
    setFitMode,
    handleFitMode,
    rotation,
    rotateClockwise,
    rotateCounterClockwise,
    goToPage,
    nextPage,
    prevPage,
    showSearch,
    setShowSearch,
    searchTerm,
    setSearchTerm,
    sidebarOpen,
    setSidebarOpen
  };
}
