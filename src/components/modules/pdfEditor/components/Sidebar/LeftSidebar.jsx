import React from 'react';
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  FileText,
  Image as ImageIcon,
  Layers,
  MousePointer,
  PenTool,
  Trash2,
  Type,
  X
} from 'lucide-react';
import { FIELD_TYPES } from '../../types/fields';
import { ThumbnailItem } from './ThumbnailsSidebar';

const TOOLS = [
  { id: 'select', label: 'Select / Move', icon: MousePointer, hotkey: 'V', category: 'pointer' },
  { id: FIELD_TYPES.TEXT, label: 'Text Field', icon: Type, hotkey: 'T', category: 'field' },
  { id: FIELD_TYPES.DESCRIPTION, label: 'Description', icon: FileText, hotkey: 'E', category: 'field' },
  { id: FIELD_TYPES.TEXTAREA, label: 'Multi-line Text', icon: AlignLeft, hotkey: 'M', category: 'field' },
  { id: FIELD_TYPES.CHECKBOX, label: 'Checkbox', icon: CheckSquare, hotkey: 'C', category: 'field' },
  { id: FIELD_TYPES.RADIO, label: 'Radio Button', icon: CircleDot, hotkey: 'R', category: 'field' },
  { id: FIELD_TYPES.DROPDOWN, label: 'Dropdown Menu', icon: ChevronDown, hotkey: 'D', category: 'field' },
  { id: FIELD_TYPES.DATE, label: 'Date Field', icon: Calendar, hotkey: 'K', category: 'field' },
  { id: FIELD_TYPES.SIGNATURE, label: 'Signature Field', icon: PenTool, hotkey: 'S', category: 'field' },
  { id: FIELD_TYPES.IMAGE, label: 'Image', icon: ImageIcon, hotkey: 'G', category: 'field' }
];

export function LeftSidebar({
  activeTool,
  setActiveTool,
  continuousPlacement,
  setContinuousPlacement,
  onAutoDetect,
  isDetecting,
  fieldsCount,
  onClearFields,
  pdfDoc,
  numPages,
  pageSizes,
  currentPage,
  onSelectPage,
  fields,
  isOpen = true,
  onClose,
  activeTab = 'tools',
  setActiveTab
}) {
  if (!isOpen) return null;

  const pages = Array.from({ length: numPages || 0 }, (_, i) => i + 1);
  const pointerTool = TOOLS.find(t => t.category === 'pointer');
  const fieldTools = TOOLS.filter(t => t.category === 'field');

  return (
    <aside className="left-tools-sidebar" aria-label="Tool Palette & Navigation">
      {/* Top Tabs: Form Tools vs Page Thumbnails */}
      <div className="left-sidebar-tabs">
        <button
          type="button"
          id="tab-tools"
          className={`sidebar-tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('tools')}
          title="Form Field Tools"
        >
          <PenTool size={13} />
          <span>Tools</span>
        </button>

        <button
          type="button"
          id="tab-pages"
          className={`sidebar-tab-btn ${activeTab === 'pages' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('pages')}
          title="Page Thumbnails"
        >
          <Layers size={13} />
          <span>Pages ({numPages || 1})</span>
        </button>

        {onClose && (
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            title="Hide Sidebar"
            aria-label="Close Left Sidebar"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* TAB 1: FORM TOOLS PALETTE */}
      {activeTab === 'tools' && (
        <div className="tools-panel-body">
          {/* Pointer / Select Tool */}
          {pointerTool && (
            <div className="sidebar-tools-section">
              <div className="sidebar-section-title">POINTER</div>
              <button
                type="button"
                id={`tool-${pointerTool.id}`}
                className={`sidebar-tool-item ${activeTool === pointerTool.id ? 'active' : ''}`}
                onClick={() => setActiveTool(pointerTool.id)}
                title={`${pointerTool.label} (${pointerTool.hotkey})`}
              >
                <pointerTool.icon size={16} />
                <span className="tool-name">{pointerTool.label}</span>
                <span className="tool-hotkey">{pointerTool.hotkey}</span>
              </button>
            </div>
          )}

          {/* Form Fields Tools */}
          <div className="sidebar-tools-section">
            <div className="sidebar-section-title">FORM FIELDS</div>
            <div className="sidebar-tools-list">
              {fieldTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    id={`tool-${tool.id}`}
                    type="button"
                    className={`sidebar-tool-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTool(tool.id)}
                    title={`${tool.label} (${tool.hotkey})`}
                  >
                    <Icon size={16} />
                    <span className="tool-name">{tool.label}</span>
                    <span className="tool-hotkey">{tool.hotkey}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workflow & Options */}
          <div className="sidebar-tools-section">
            <div className="sidebar-section-title">OPTIONS</div>
            <label className="sidebar-checkbox-row" title="Keep tool active after placing a field">
              <input
                type="checkbox"
                checked={continuousPlacement}
                onChange={(e) => setContinuousPlacement(e.target.checked)}
              />
              <span>Continuous Add</span>
            </label>

            {onClearFields && fieldsCount > 0 && (
              <button
                type="button"
                className="sidebar-clear-btn"
                onClick={onClearFields}
                title="Remove all fields and start fresh"
              >
                <Trash2 size={13} />
                <span>Clear Fields ({fieldsCount})</span>
              </button>
            )}
          </div>

          {/* Active Placement Status Banner or Edit Hint */}
          {activeTool !== 'select' ? (
            <div className="sidebar-status-card placing">
              <div className="status-badge">TOOL ACTIVE</div>
              <p className="status-text">
                Click or drag on PDF to place <strong>{activeTool}</strong>
              </p>
              <button
                type="button"
                className="sidebar-cancel-tool-btn"
                onClick={() => setActiveTool('select')}
                title="Cancel tool (Esc)"
              >
                Cancel Tool (Esc)
              </button>
            </div>
          ) : (
            <div className="sidebar-status-card hint">
              <p className="hint-text">💡 Click any text or box on PDF to edit in-place</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAGE THUMBNAILS */}
      {activeTab === 'pages' && (
        <div className="thumbnails-panel-body">
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
        </div>
      )}
    </aside>
  );
}
