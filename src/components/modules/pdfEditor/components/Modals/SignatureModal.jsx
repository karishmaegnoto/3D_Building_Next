import React, { useEffect, useRef, useState } from 'react';
import { Check, Edit3, Eraser, Type, X } from 'lucide-react';

export function SignatureModal({
  isOpen,
  field,
  onClose,
  onSaveSignature
}) {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' | 'type'
  const [typedName, setTypedName] = useState(field?.signerName || 'Jane Doe');
  const [selectedFont, setSelectedFont] = useState('Caveat');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!isOpen || activeTab !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Drawing event handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Generate PNG data URL and save
  const handleApply = () => {
    let signatureDataUrl = null;

    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas && hasDrawn) {
        signatureDataUrl = canvas.toDataURL('image/png');
      }
    } else {
      // Create offscreen canvas for typed cursive font
      const offscreen = document.createElement('canvas');
      offscreen.width = 400;
      offscreen.height = 120;
      const ctx = offscreen.getContext('2d');

      ctx.font = `42px "${selectedFont}", cursive`;
      ctx.fillStyle = '#1e293b';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(typedName || 'Signature', 200, 60);

      signatureDataUrl = offscreen.toDataURL('image/png');
    }

    if (signatureDataUrl) {
      onSaveSignature(signatureDataUrl, typedName);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog signature-modal modal-content"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="modal-header">
          <div className="modal-title">
            <Edit3 size={18} />
            <span>Create Signature</span>
          </div>
          <button type="button" className="close-panel-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher: Draw vs Type */}
        <div className="modal-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'draw' ? 'active' : ''}`}
            onClick={() => setActiveTab('draw')}
          >
            <Edit3 size={15} />
            <span>Draw</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'type' ? 'active' : ''}`}
            onClick={() => setActiveTab('type')}
          >
            <Type size={15} />
            <span>Type</span>
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'draw' ? (
            <div className="draw-signature-wrap">
              <div className="canvas-container">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={180}
                  className="signature-canvas"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="signature-baseline" />
                <span className="sign-hint-text">Sign using mouse or touch</span>
              </div>
              <div className="canvas-actions">
                <button
                  type="button"
                  className="secondary-btn clear-btn"
                  onClick={clearCanvas}
                  disabled={!hasDrawn}
                >
                  <Eraser size={14} />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="type-signature-wrap">
              <div className="type-input-group">
                <label>Your Full Name</label>
                <input
                  type="text"
                  className="prop-input name-input"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your name..."
                />
              </div>

              <div className="font-options-list">
                {[
                  { font: 'Caveat', label: 'Caveat (Natural Cursive)' },
                  { font: 'Dancing Script', label: 'Dancing Script (Fluid Calligraphy)' },
                  { font: 'Great Vibes', label: 'Great Vibes (Formal Script)' }
                ].map((f) => (
                  <div
                    key={f.font}
                    className={`font-preview-card ${selectedFont === f.font ? 'selected' : ''}`}
                    onClick={() => setSelectedFont(f.font)}
                  >
                    <div className="font-card-header">
                      <span>{f.label}</span>
                      {selectedFont === f.font && <Check size={14} className="check-icon" />}
                    </div>
                    <div
                      className="cursive-preview"
                      style={{ fontFamily: `"${f.font}", cursive` }}
                    >
                      {typedName || 'Your Signature'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            id="btn-apply-signature"
            type="button"
            className="primary-btn apply-btn"
            onClick={handleApply}
            disabled={activeTab === 'draw' && !hasDrawn && !field?.signatureDataUrl}
          >
            <Check size={15} />
            <span>Apply Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
}
