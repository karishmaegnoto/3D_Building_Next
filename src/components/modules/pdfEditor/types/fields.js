export const FIELD_TYPES = {
  TEXT: 'text',
  DESCRIPTION: 'description',
  TEXTAREA: 'textarea',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  DROPDOWN: 'dropdown',
  DATE: 'date',
  SIGNATURE: 'signature',
  IMAGE: 'image'
};

export const FIELD_LABELS = {
  [FIELD_TYPES.TEXT]: 'Text Field',
  [FIELD_TYPES.DESCRIPTION]: 'Description',
  [FIELD_TYPES.TEXTAREA]: 'Multi-line Text',
  [FIELD_TYPES.CHECKBOX]: 'Checkbox',
  [FIELD_TYPES.RADIO]: 'Radio Button',
  [FIELD_TYPES.DROPDOWN]: 'Dropdown List',
  [FIELD_TYPES.DATE]: 'Date Field',
  [FIELD_TYPES.SIGNATURE]: 'Signature Field',
  [FIELD_TYPES.IMAGE]: 'Image'
};

// Default dimensions in PDF points (72 DPI)
export const DEFAULT_FIELD_DIMENSIONS = {
  [FIELD_TYPES.TEXT]: { width: 140, height: 11.5 },
  [FIELD_TYPES.DESCRIPTION]: { width: 180, height: 11.5 },
  [FIELD_TYPES.TEXTAREA]: { width: 220, height: 60 },
  [FIELD_TYPES.CHECKBOX]: { width: 18, height: 18 },
  [FIELD_TYPES.RADIO]: { width: 18, height: 18 },
  [FIELD_TYPES.DROPDOWN]: { width: 130, height: 16 },
  [FIELD_TYPES.DATE]: { width: 90, height: 16 },
  [FIELD_TYPES.SIGNATURE]: { width: 160, height: 44 },
  [FIELD_TYPES.IMAGE]: { width: 140, height: 90 }
};

export const MIN_FIELD_DIMENSIONS = {
  [FIELD_TYPES.TEXT]: { width: 25, height: 11 },
  [FIELD_TYPES.DESCRIPTION]: { width: 25, height: 11 },
  [FIELD_TYPES.TEXTAREA]: { width: 40, height: 20 },
  [FIELD_TYPES.CHECKBOX]: { width: 12, height: 12 },
  [FIELD_TYPES.RADIO]: { width: 12, height: 12 },
  [FIELD_TYPES.DROPDOWN]: { width: 75, height: 12 },
  [FIELD_TYPES.DATE]: { width: 55, height: 12 },
  [FIELD_TYPES.SIGNATURE]: { width: 50, height: 20 },
  [FIELD_TYPES.IMAGE]: { width: 25, height: 25 }
};

export const DEFAULT_FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24];

export const FONT_FAMILIES = [
  { id: 'Helvetica', label: 'Helvetica' },
  { id: 'Arial', label: 'Arial' },
  { id: 'Times New Roman', label: 'Times New Roman' },
  { id: 'Courier', label: 'Courier (Monospace)' },
  { id: 'Georgia', label: 'Georgia' },
  { id: 'Verdana', label: 'Verdana' },
  { id: 'Calibri', label: 'Calibri' },
  { id: 'Inter', label: 'Inter' }
];

export const TEXT_ALIGNMENTS = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' }
];
