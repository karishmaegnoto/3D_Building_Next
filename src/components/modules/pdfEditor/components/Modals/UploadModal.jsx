import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';

export function UploadModal({
  isOpen,
  onClose,
  onUploadFile,
  loading,
  error
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    onUploadFile(file).then(() => {
      onClose();
    }).catch(() => {
      // Error handled by parent
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog upload-modal modal-content"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="modal-header">
          <div className="modal-title">
            <Upload size={18} />
            <span>Open PDF Document</span>
          </div>
          <button type="button" className="close-panel-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Error Alert */}
          {error && (
            <div className="modal-alert error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            id="pdf-dropzone"
            className={`dropzone-box ${isDragOver ? 'drag-over' : ''} ${loading ? 'loading' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              id="input-file-picker"
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div className="dropzone-icon">
              <Upload size={32} />
            </div>

            <div className="dropzone-text">
              <h3>{loading ? 'Processing Document...' : 'Drag & Drop your PDF here'}</h3>
              <p>or click to browse your computer files</p>
              <span className="dropzone-badge">Supports Standard & Form-fillable PDFs (.pdf)</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
