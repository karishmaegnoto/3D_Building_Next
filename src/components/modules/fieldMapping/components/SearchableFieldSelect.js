"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import styles from '../fieldMapping.module.scss';

export function SearchableFieldSelect({
  value = '',
  onChange,
  groups = [],
  isLoading = false,
  placeholder = '-- Do Not Map --',
  ariaLabel = 'Select field mapping',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openUpward, setOpenUpward] = useState(false);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  const isMapped = Boolean(value);

  // Find currently selected field info
  const selectedField = useMemo(() => {
    if (!value) return null;
    for (const group of groups) {
      if (Array.isArray(group.fields)) {
        const found = group.fields.find((f) => f.key === value);
        if (found) return found;
      }
    }
    return { key: value, label: value };
  }, [groups, value]);

  const displayLabel = selectedField ? (selectedField.label || selectedField.key) : placeholder;

  // Filter groups and fields based on search query
  const filteredGroups = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return groups;

    return groups
      .map((g) => {
        const matchingFields = (g.fields || []).filter((f) => {
          const labelMatch = f.label && f.label.toLowerCase().includes(q);
          const keyMatch = f.key && f.key.toLowerCase().includes(q);
          const groupMatch = g.group && g.group.toLowerCase().includes(q);
          return labelMatch || keyMatch || groupMatch;
        });

        return {
          ...g,
          fields: matchingFields,
        };
      })
      .filter((g) => g.fields.length > 0);
  }, [groups, searchTerm]);

  const totalMatches = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + (g.fields?.length || 0), 0);
  }, [filteredGroups]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Open upward if near the bottom of viewport and more space above
      setOpenUpward(spaceBelow < 250 && rect.top > spaceBelow);
    }
    setIsOpen((prev) => !prev);
    setSearchTerm('');
  };

  const handleSelect = (key) => {
    onChange?.(key);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
    setIsOpen(false);
    setSearchTerm('');
  };

  const showDoNotMapOption =
    !searchTerm ||
    '-- do not map --'.includes(searchTerm.toLowerCase()) ||
    'unmap'.includes(searchTerm.toLowerCase()) ||
    'none'.includes(searchTerm.toLowerCase()) ||
    'clear'.includes(searchTerm.toLowerCase());

  return (
    <div
      ref={containerRef}
      className={`${styles.searchableSelectContainer} ${isOpen ? styles.dropdownIsOpen : ''}`}
    >
      {/* ── Trigger Button ── */}
      <button
        type="button"
        className={`${styles.selectTrigger} ${isMapped ? styles.selectTriggerMapped : styles.selectTriggerUnmapped} ${isOpen ? styles.selectTriggerActive : ''}`}
        onClick={handleToggle}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <span className={styles.selectTriggerText} title={displayLabel}>
          {displayLabel}
        </span>

        <div className={styles.selectTriggerRight}>
          {isMapped && (
            <span
              role="button"
              className={styles.triggerClearBtn}
              onClick={handleClear}
              title="Clear mapping"
            >
              <X size={11} />
            </span>
          )}
          <ChevronDown
            size={13}
            className={`${styles.selectTriggerChevron} ${isOpen ? styles.chevronRotated : ''}`}
          />
        </div>
      </button>

      {/* ── Dropdown Menu ── */}
      {isOpen && (
        <div
          className={`${styles.searchableDropdownMenu} ${openUpward ? styles.dropdownUpward : styles.dropdownDownward}`}
        >
          {/* Search Box Header */}
          <div className={styles.dropdownSearchHeader}>
            <div className={styles.dropdownSearchBox}>
              <Search size={12} className={styles.dropdownSearchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                className={styles.dropdownSearchInput}
                placeholder="Search fields or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  type="button"
                  className={styles.dropdownSearchClearBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                  title="Clear search"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div ref={listRef} className={styles.dropdownOptionsList}>
            {isLoading && (
              <div className={styles.dropdownLoadingMsg}>
                Loading template fields...
              </div>
            )}

            {/* Top Option: -- Do Not Map -- */}
            {showDoNotMapOption && (
              <div
                className={`${styles.dropdownOptionItem} ${styles.dropdownOptionDoNotMap} ${!value ? styles.dropdownOptionSelected : ''}`}
                onClick={() => handleSelect('')}
              >
                <span className={styles.dropdownOptionLabel}>-- Do Not Map --</span>
                {!value && <Check size={12} className={styles.dropdownCheckIcon} />}
              </div>
            )}

            {/* Categorized Groups */}
            {filteredGroups.map((group) => (
              <div key={group.group} className={styles.dropdownGroupBlock}>
                <div className={styles.dropdownGroupTitle}>
                  {group.group}
                </div>
                {group.fields.map((lf) => {
                  const isSelected = value === lf.key;
                  return (
                    <div
                      key={lf.key}
                      className={`${styles.dropdownOptionItem} ${isSelected ? styles.dropdownOptionSelected : ''}`}
                      onClick={() => handleSelect(lf.key)}
                      title={lf.key}
                    >
                      <span className={styles.dropdownOptionLabel}>
                        {lf.label || lf.key}
                      </span>
                      {isSelected && (
                        <Check size={12} className={styles.dropdownCheckIcon} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* No Results Message */}
            {!isLoading && totalMatches === 0 && !showDoNotMapOption && (
              <div className={styles.dropdownEmptySearch}>
                No fields found matching &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableFieldSelect;
