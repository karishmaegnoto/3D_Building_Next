import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  FileText,
  Image as ImageIcon,
  MousePointer,
  PenTool,
  Trash2,
  Type
} from 'lucide-react';
import { FIELD_TYPES } from '../../types/fields';

const TOOLS = [
  { id: 'select', label: 'Select / Move', icon: MousePointer, hotkey: 'V' },
  { id: FIELD_TYPES.TEXT, label: 'Text Field', icon: Type, hotkey: 'T' },
  { id: FIELD_TYPES.DESCRIPTION, label: 'Description', icon: FileText, hotkey: 'E' },
  { id: FIELD_TYPES.TEXTAREA, label: 'Multi-line Text', icon: AlignLeft, hotkey: 'M' },
  { id: FIELD_TYPES.CHECKBOX, label: 'Checkbox', icon: CheckSquare, hotkey: 'C' },
  { id: FIELD_TYPES.RADIO, label: 'Radio Button', icon: CircleDot, hotkey: 'R' },
  { id: FIELD_TYPES.DROPDOWN, label: 'Dropdown Menu', icon: ChevronDown, hotkey: 'D' },
  { id: FIELD_TYPES.DATE, label: 'Date Field', icon: Calendar, hotkey: 'K' },
  { id: FIELD_TYPES.SIGNATURE, label: 'Signature Field', icon: PenTool, hotkey: 'S' },
  { id: FIELD_TYPES.IMAGE, label: 'Image', icon: ImageIcon, hotkey: 'G' }
];

export function FieldRibbon({
  activeTool,
  setActiveTool,
  continuousPlacement,
  setContinuousPlacement,
  onAutoDetect,
  isDetecting,
  fieldsCount,
  onClearFields
}) {
  return (
    <div className="field-ribbon-bar" role="toolbar" aria-label="PDF Form Field Tools">
      <div className="ribbon-tools-group">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              id={`tool-${tool.id}`}
              type="button"
              className={`ribbon-tool-btn ${isActive ? 'active' : ''}`}
              title={`${tool.label} (${tool.hotkey})`}
              onClick={() => setActiveTool(tool.id)}
            >
              <Icon size={16} />
              <span className="ribbon-tool-label">{tool.label}</span>
              <span className="ribbon-hotkey">{tool.hotkey}</span>
            </button>
          );
        })}
      </div>

      <div className="ribbon-options-group">
        {onClearFields && fieldsCount > 0 && (
          <button
            type="button"
            className="clear-all-fields-btn"
            onClick={onClearFields}
            title="Remove all fields and start fresh"
          >
            <Trash2 size={13} />
            <span>Clear Fields ({fieldsCount})</span>
          </button>
        )}

        <label className="continuous-placement-toggle" title="Keep tool active after placing a field">
          <input
            type="checkbox"
            checked={continuousPlacement}
            onChange={(e) => setContinuousPlacement(e.target.checked)}
          />
          <span>Continuous Add</span>
        </label>

        {activeTool !== 'select' ? (
          <div className="placement-status-pill">
            <span>Click or drag on PDF to place {activeTool}</span>
            <button
              type="button"
              className="cancel-tool-btn"
              onClick={() => setActiveTool('select')}
              title="Cancel tool (Esc)"
            >
              Cancel (Esc)
            </button>
          </div>
        ) : (
          <div className="ribbon-hint-pill" title="Click on any text on the PDF to edit it right in its cell">
            <span>Click any text on PDF to edit in-place</span>
          </div>
        )}
      </div>
    </div>
  );
}
