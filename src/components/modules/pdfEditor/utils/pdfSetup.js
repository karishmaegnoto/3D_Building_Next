import * as pdfjsLib from 'pdfjs-dist';

// Use static public worker for rock-solid reliability in Next.js dev and production
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/crm/pdf.worker.min.mjs';
}

export { pdfjsLib };
