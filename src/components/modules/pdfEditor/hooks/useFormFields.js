import { useCallback, useEffect, useRef, useState } from 'react';
import { duplicateField as cloneField } from '../utils/fieldUtils';

export function useFormFields(initialFields = [], documentSource = null) {
  const [fields, setFieldsState] = useState(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'text' | etc.
  const [continuousPlacement, setContinuousPlacement] = useState(false);

  // Undo / Redo history
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  // Reset fields whenever a new PDF document is loaded (new documentSource or initialFields)
  const prevDocRef = useRef(documentSource);
  const prevInitialFieldsRef = useRef(initialFields);

  useEffect(() => {
    const isNewDoc = documentSource !== prevDocRef.current;
    const isNewInitialFields = initialFields !== prevInitialFieldsRef.current;

    if (isNewDoc || isNewInitialFields) {
      prevDocRef.current = documentSource;
      prevInitialFieldsRef.current = initialFields;
      setFieldsState(initialFields || []);
      setSelectedFieldId(null);
      setPast([]);
      setFuture([]);
    }
  }, [documentSource, initialFields]);

  const saveHistorySnapshot = useCallback((newPastState) => {
    setPast(prev => [...prev.slice(-30), newPastState]);
    setFuture([]);
  }, []);

  const addField = useCallback((newField) => {
    setFieldsState(prev => {
      saveHistorySnapshot(prev);
      return [...prev, newField];
    });
    setSelectedFieldId(newField.id);

    // If continuous placement is not checked, revert to selection tool
    if (!continuousPlacement) {
      setActiveTool('select');
    }
  }, [continuousPlacement, saveHistorySnapshot]);

  const updateField = useCallback((id, updates, commitHistory = true) => {
    setFieldsState(prev => {
      if (commitHistory) {
        saveHistorySnapshot(prev);
      }
      const target = prev.find(f => f.id === id);
      const isRadio = target && target.type === 'radio';
      const targetGroup = (updates.groupName !== undefined ? updates.groupName : target?.groupName)?.trim();
      const isTargetChecked = updates.checked !== undefined ? updates.checked : target?.checked;
      const isRadioCheckedInGroup = isRadio && isTargetChecked === true && Boolean(targetGroup);

      return prev.map(f => {
        if (f.id === id) {
          return { ...f, ...updates };
        }
        if (isRadioCheckedInGroup && f.type === 'radio' && f.id !== id) {
          const fGroup = (f.groupName || '').trim();
          if (fGroup && fGroup.toLowerCase() === targetGroup.toLowerCase()) {
            return { ...f, checked: false };
          }
        }
        return f;
      });
    });
  }, [saveHistorySnapshot]);

  const deleteField = useCallback((id) => {
    setFieldsState(prev => {
      saveHistorySnapshot(prev);
      return prev.filter(f => f.id !== id);
    });
    setSelectedFieldId(curr => (curr === id ? null : curr));
  }, [saveHistorySnapshot]);

  const duplicateField = useCallback((id) => {
    setFieldsState(prev => {
      const target = prev.find(f => f.id === id);
      if (!target) return prev;
      saveHistorySnapshot(prev);
      const cloned = cloneField(target, 16, prev);
      setSelectedFieldId(cloned.id);
      return [...prev, cloned];
    });
  }, [saveHistorySnapshot]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture(prev => [fields, ...prev]);
    setPast(newPast);
    setFieldsState(previous);
  }, [fields, past]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast(prev => [...prev, fields]);
    setFuture(newFuture);
    setFieldsState(next);
  }, [fields, future]);

  // Keyboard shortcuts: Delete, Escape, Arrow nudges
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable;

      // Escape to deselect or cancel tool mode
      if (e.key === 'Escape') {
        if (activeTool !== 'select') {
          setActiveTool('select');
        } else if (selectedFieldId) {
          setSelectedFieldId(null);
        }
        return;
      }

      // Delete / Backspace key to remove selected field (only when not typing in an input)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFieldId && !isInputFocused) {
        e.preventDefault();
        deleteField(selectedFieldId);
        return;
      }

      // Ctrl+Z / Ctrl+Y for Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !isInputFocused) {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y' && !isInputFocused) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+D to duplicate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedFieldId && !isInputFocused) {
        e.preventDefault();
        duplicateField(selectedFieldId);
        return;
      }

      // Arrow keys to nudge selected field
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedFieldId && !isInputFocused) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setFieldsState(prev => {
          saveHistorySnapshot(prev);
          return prev.map(f => {
            if (f.id !== selectedFieldId) return f;
            let { x, y } = f;
            if (e.key === 'ArrowUp') y -= step;
            if (e.key === 'ArrowDown') y += step;
            if (e.key === 'ArrowLeft') x -= step;
            if (e.key === 'ArrowRight') x += step;
            return { ...f, x: Math.max(0, x), y: Math.max(0, y) };
          });
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, deleteField, duplicateField, redo, saveHistorySnapshot, selectedFieldId, undo]);

  const selectedField = fields.find(f => f.id === selectedFieldId) || null;

  return {
    fields,
    setFields: setFieldsState,
    selectedFieldId,
    selectedField,
    setSelectedFieldId,
    activeTool,
    setActiveTool,
    continuousPlacement,
    setContinuousPlacement,
    addField,
    updateField,
    deleteField,
    duplicateField,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
}
