import { useCallback, useEffect, useState } from 'react';
import { normalizeAnnotationToField, detectDocumentFontFamily } from '../utils/fieldUtils';
import { pdfjsLib } from '../utils/pdfSetup';

export function usePdfDocument(initialFile = null) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [rawBuffer, setRawBuffer] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageSizes, setPageSizes] = useState({});
  const [initialFields, setInitialFields] = useState([]);
  const [detectedPdfFont, setDetectedPdfFont] = useState('Helvetica');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };


  const processPdfBuffer = useCallback(async (buffer, name = 'document.pdf', sizeStr = '') => {
    setLoading(true);
    setLoadingMessage('Parsing PDF pages and form fields...');
    setError(null);

    try {
      // Clone buffer to avoid detached ArrayBuffer issues if worker transfers it
      const bufferCopy = buffer.slice(0);
      const loadingTask = pdfjsLib.getDocument({
        data: bufferCopy,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/cmaps/',
        cMapPacked: true
      });

      const doc = await loadingTask.promise;
      const totalPages = doc.numPages;

      // Extract page dimensions and existing AcroForm annotations
      const sizes = {};
      const extractedFields = [];

      for (let p = 1; p <= totalPages; p++) {
        const page = await doc.getPage(p);
        const viewport = page.getViewport({ scale: 1.0 });
        sizes[p] = {
          width: viewport.width,
          height: viewport.height,
          rotation: viewport.rotation
        };

        // Extract AcroForm annotations
        try {
          let annotations = [];
          try {
            annotations = await page.getAnnotations();
          } catch {
            annotations = await page.getAnnotations({ intent: 'display' }).catch(() => []);
          }
          for (const annot of (annotations || [])) {
            const field = normalizeAnnotationToField(annot, p, viewport.height);
            if (field) {
              extractedFields.push(field);
            }
          }
        } catch (annotErr) {
          console.warn(`Could not extract annotations on page ${p}:`, annotErr);
        }
      }

      // Detect dominant font family from PDF text content
      try {
        const detectedFont = await detectDocumentFontFamily(doc);
        setDetectedPdfFont(detectedFont || 'Helvetica');
      } catch (fontErr) {
        console.warn('Could not detect font from PDF:', fontErr);
      }

      setRawBuffer(buffer);
      setPdfDoc(doc);
      setNumPages(totalPages);
      setPageSizes(sizes);
      setInitialFields(extractedFields);
      setFileName(name);
      setFileSize(sizeStr || formatFileSize(buffer.byteLength));
      setLoading(false);
      setLoadingMessage('');
      return { doc, extractedFields, totalPages };
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setError(err.message || 'Invalid or corrupted PDF file. Please try another document.');
      setLoading(false);
      setLoadingMessage('');
      throw err;
    }
  }, []);

  const loadFromFile = useCallback(async (file) => {
    if (!file) return;

    // Validate mime / extension
    const fileName = file.name || 'document.pdf';
    const isPdf = file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf') || Boolean(file.size);
    if (!isPdf) {
      setError('Selected file is not a valid PDF. Please choose a .pdf document.');
      return;
    }

    setLoading(true);
    setLoadingMessage(`Reading ${fileName}...`);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      return await processPdfBuffer(arrayBuffer, fileName, formatFileSize(file.size));
    } catch (err) {
      setError(`Failed to read file: ${err.message}`);
      setLoading(false);
    }
  }, [processPdfBuffer]);


  const resetDocument = useCallback(() => {
    setPdfDoc(null);
    setRawBuffer(null);
    setNumPages(0);
    setPageSizes({});
    setInitialFields([]);
    setFileName('');
    setFileSize('');
    setError(null);
  }, []);

  // Auto-load initialFile if passed
  useEffect(() => {
    if (initialFile) {
      loadFromFile(initialFile).catch(err => {
        console.warn('Initial file load error:', err);
      });
    }
  }, [initialFile, loadFromFile]);

  return {
    pdfDoc,
    rawBuffer,
    numPages,
    pageSizes,
    initialFields,
    detectedPdfFont,
    fileName,
    fileSize,
    loading,
    loadingMessage,
    error,
    loadFromFile,
    processPdfBuffer,
    resetDocument
  };
}
