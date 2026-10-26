import { useState, useMemo, useEffect, useCallback } from 'react';
import { AUTO_MATCH_RULES } from '../constants/leadFields';

export function useFieldMapping({
  fields = [],
  initialMappings = {},
  availableFields = [],
  mappingType = 'lead',
  onUpdateField = null
}) {
  const displayFields = useMemo(() => {
    if (!fields || !Array.isArray(fields)) return [];
    return fields.filter(f => f && f.name && f.type);
  }, [fields]);

  const isUsingDefaults = !fields || fields.length === 0;

  const findMatch = useCallback((targetStr) => {
    if (!targetStr) return null;
    if (availableFields && availableFields.length > 0) {
      const cleanTarget = targetStr.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!cleanTarget) return null;
      for (const qf of availableFields) {
        const cleanQf = qf.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanQf === cleanTarget) return qf;
      }
      for (const qf of availableFields) {
        const cleanQf = qf.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanTarget.length >= 3 && cleanQf.includes(cleanTarget)) return qf;
        if (cleanQf.length >= 3 && cleanTarget.includes(cleanQf)) return qf;
      }
      return null;
    }
    for (const rule of AUTO_MATCH_RULES) {
      if (rule.test.test(targetStr)) return rule.match;
    }
    return null;
  }, [availableFields]);

  // Initialize mappings
  const [mappings, setMappings] = useState(() => {
    const initial = {};
    const hasInitial = initialMappings && Object.keys(initialMappings).length > 0;

    if (hasInitial) {
      Object.entries(initialMappings).forEach(([k, v]) => {
        initial[k] = (v && String(v).trim()) ? String(v).trim() : null;
      });
    }

    (fields || []).forEach((field) => {
      if (!field?.name) return;
      if (initial[field.name] !== undefined) return;

      const targetStr = `${field.name} ${field.label || ''}`.trim();
      const match = findMatch(targetStr);
      initial[field.name] = match || null;
    });
    return initial;
  });

  // Re-sync mappings if initialMappings prop updates
  useEffect(() => {
    if (initialMappings && typeof initialMappings === 'object') {
      const next = {};
      Object.entries(initialMappings).forEach(([k, v]) => {
        next[k] = (v && String(v).trim()) ? String(v).trim() : null;
      });
      (fields || []).forEach((field) => {
        if (field?.name && next[field.name] === undefined) {
          next[field.name] = null;
        }
      });
      setMappings(next);
    }
  }, [initialMappings, fields]);

  // When fields are added (e.g. user ran Auto-Detect), automatically match new fields
  useEffect(() => {
    if (fields && fields.length > 0) {
      setMappings((prev) => {
        const next = { ...prev };
        let hasChanges = false;
        fields.forEach((field) => {
          if (!field?.name) return;
          if (next[field.name] === undefined) {
            const targetStr = `${field.name} ${field.label || ''}`.trim();
            const match = findMatch(targetStr);
            next[field.name] = match || null;
            hasChanges = true;
          }
        });
        return hasChanges ? next : prev;
      });
    }
  }, [fields, findMatch]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'mapped' | 'unmapped'

  // Filter fields based on search query and mapping filter
  const filteredFields = useMemo(() => {
    return displayFields.filter((field) => {
      const fieldName = (field.name || '').toLowerCase();
      const fieldLabel = (field.label || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || fieldName.includes(query) || fieldLabel.includes(query);
      if (!matchesSearch) return false;

      const isMapped = Boolean(mappings[field.name]);
      if (filterType === 'mapped') return isMapped;
      if (filterType === 'unmapped') return !isMapped;
      if (filterType === 'text') return field.type === 'text' || field.type === 'textarea';
      if (filterType === 'checkbox') return field.type === 'checkbox';
      if (filterType === 'radio') return field.type === 'radio';
      if (filterType === 'dropdown') return field.type === 'dropdown';
      return true;
    });
  }, [displayFields, mappings, searchQuery, filterType]);

  // Counts by field type (Input, Checkbox, Radio, Dropdown)
  const fieldTypeCounts = useMemo(() => {
    const counts = { text: 0, checkbox: 0, radio: 0, dropdown: 0 };
    displayFields.forEach((f) => {
      const t = (f.type || 'text').toLowerCase();
      if (t === 'text' || t === 'textarea') counts.text++;
      else if (t === 'checkbox') counts.checkbox++;
      else if (t === 'radio') counts.radio++;
      else if (t === 'dropdown') counts.dropdown++;
    });
    return counts;
  }, [displayFields]);

  // Metrics
  const totalFieldsCount = displayFields.length;
  const mappedCount = useMemo(() => {
    return displayFields.filter((f) => Boolean(mappings[f.name])).length;
  }, [displayFields, mappings]);

  const percentMapped = totalFieldsCount > 0 ? Math.round((mappedCount / totalFieldsCount) * 100) : 0;

  // Rename field key directly from table input
  const renameField = useCallback((fieldId, newKey) => {
    const target = (fields || []).find(f => f.id === fieldId);
    if (!target) return;
    const oldKey = target.name;
    const cleanKey = (newKey || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');

    if (typeof onUpdateField === 'function') {
      onUpdateField(fieldId, { name: cleanKey });
    }

    setMappings(prev => {
      const next = { ...prev };
      if (oldKey && next[oldKey] !== undefined) {
        next[cleanKey] = next[oldKey];
        if (cleanKey !== oldKey) {
          delete next[oldKey];
        }
      }
      return next;
    });
  }, [fields, onUpdateField]);

  // Change single field mapping - if current field name is dummy, automatically adopt clean key from lead field
  const setFieldMapping = useCallback((fieldOrName, leadFieldKey) => {
    const isObject = fieldOrName && typeof fieldOrName === 'object';
    const field = isObject ? fieldOrName : (fields || []).find(f => f.name === fieldOrName || f.id === fieldOrName);
    const pdfFieldName = field ? field.name : fieldOrName;

    // Check if current field name is an internal dummy ID
    const isDummy =
      /^(text|field|date|checkbox|radio|dropdown|size)_\d+(_copy)?$/i.test(pdfFieldName || '') ||
      /^acro_/i.test(pdfFieldName || '') ||
      /^existing_/i.test(pdfFieldName || '') ||
      /^SIZE_\d+/i.test(pdfFieldName || '');

    // If the user picked a lead field and the current field key is a dummy ID, automatically set a clean key from lead field
    let effectiveKey = pdfFieldName;
    if (leadFieldKey && isDummy && field) {
      const leaf = String(leadFieldKey).includes('.')
        ? String(leadFieldKey).split('.').pop()
        : String(leadFieldKey);
      effectiveKey = leaf.replace(/[^a-zA-Z0-9_-]/g, '_');
      if (typeof onUpdateField === 'function') {
        onUpdateField(field.id, { name: effectiveKey });
      }
    }

    setMappings((prev) => {
      const updated = { ...prev };
      if (!leadFieldKey) {
        updated[effectiveKey] = null;
        if (effectiveKey !== pdfFieldName) delete updated[pdfFieldName];
      } else {
        if (effectiveKey !== pdfFieldName) {
          delete updated[pdfFieldName];
        }
        updated[effectiveKey] = leadFieldKey;
      }
      return updated;
    });
  }, [fields, onUpdateField]);

  // Smart auto-match using dictionary
  const autoMatchAll = useCallback(() => {
    const newMappings = { ...mappings };
    displayFields.forEach((field) => {
      const targetStr = `${field.name} ${field.label || ''}`.trim();
      const matchedRule = findMatch(targetStr);
      if (matchedRule) {
        const isDummy =
          /^(text|field|date|checkbox|radio|dropdown|size)_\d+(_copy)?$/i.test(field.name || '') ||
          /^acro_/i.test(field.name || '') ||
          /^existing_/i.test(field.name || '') ||
          /^SIZE_\d+/i.test(field.name || '');

        let targetKey = field.name;
        if (isDummy) {
          const leaf = String(matchedRule).includes('.')
            ? String(matchedRule).split('.').pop()
            : String(matchedRule);
          targetKey = leaf.replace(/[^a-zA-Z0-9_-]/g, '_');
          if (typeof onUpdateField === 'function') {
            onUpdateField(field.id, { name: targetKey });
          }
        }

        newMappings[targetKey] = matchedRule;
        if (targetKey !== field.name) {
          delete newMappings[field.name];
        }
      } else if (newMappings[field.name] === undefined) {
        newMappings[field.name] = null;
      }
    });
    setMappings(newMappings);
  }, [displayFields, mappings, onUpdateField, findMatch]);

  // Clear all mappings
  const clearAllMappings = useCallback(() => {
    const cleared = {};
    displayFields.forEach((f) => {
      if (f.name) cleared[f.name] = null;
    });
    setMappings(cleared);
  }, [displayFields]);

  return {
    mappings,
    setMappings,
    displayFields,
    filteredFields,
    isUsingDefaults,
    totalFieldsCount,
    mappedCount,
    percentMapped,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    fieldTypeCounts,
    renameField,
    setFieldMapping,
    autoMatchAll,
    clearAllMappings
  };
}
