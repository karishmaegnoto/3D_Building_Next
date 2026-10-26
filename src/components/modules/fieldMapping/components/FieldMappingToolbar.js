import React from 'react';
import { Search, RotateCcw, X } from 'lucide-react';
import styles from '../fieldMapping.module.scss';

export function FieldMappingToolbar({
  mappedCount,
  totalFieldsCount,
  percentMapped,
  isUsingDefaults,
  onAutoDetect,
  onAutoMatch,
  onClearAll,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  fieldTypeCounts = { text: 0, checkbox: 0, radio: 0, dropdown: 0 }
}) {
  return (
    <div className={styles.toolbarWrapper}>
      {/* ── Progress & Action Bar ────────────────────────────── */}
      <div className={styles.progressRow}>
        <div className={styles.statsPill}>
          <span className={styles.statsText}>
            <strong>{mappedCount}</strong> of <strong>{totalFieldsCount}</strong> fields mapped
          </span>
          <div className={styles.statsProgressTrack}>
            <div
              className={styles.statsProgressFill}
              style={{ width: `${percentMapped}%` }}
            />
          </div>
          <span className={styles.statsBadge}>{percentMapped}%</span>
        </div>

        <div className={styles.quickActions}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.clearBtn}`}
            onClick={onClearAll}
            disabled={mappedCount === 0}
            title="Clear all mappings"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────── */}
      <div className={styles.filtersRow}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search PDF fields..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.searchClearBtn}
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className={styles.filterTabs}>
          <button
            type="button"
            className={`${styles.filterTab} ${filterType === 'all' ? styles.filterTabActive : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All ({totalFieldsCount})
          </button>

          {fieldTypeCounts?.text > 0 && (
            <button
              type="button"
              className={`${styles.filterTab} ${filterType === 'text' ? styles.filterTabActive : ''}`}
              onClick={() => onFilterChange('text')}
            >
              Text ({fieldTypeCounts.text})
            </button>
          )}

          {fieldTypeCounts?.checkbox > 0 && (
            <button
              type="button"
              className={`${styles.filterTab} ${filterType === 'checkbox' ? styles.filterTabActive : ''}`}
              onClick={() => onFilterChange('checkbox')}
            >
              Checkboxes ({fieldTypeCounts.checkbox})
            </button>
          )}

          {fieldTypeCounts?.radio > 0 && (
            <button
              type="button"
              className={`${styles.filterTab} ${filterType === 'radio' ? styles.filterTabActive : ''}`}
              onClick={() => onFilterChange('radio')}
            >
              Radios ({fieldTypeCounts.radio})
            </button>
          )}

          {fieldTypeCounts?.dropdown > 0 && (
            <button
              type="button"
              className={`${styles.filterTab} ${filterType === 'dropdown' ? styles.filterTabActive : ''}`}
              onClick={() => onFilterChange('dropdown')}
            >
              Dropdowns ({fieldTypeCounts.dropdown})
            </button>
          )}

          <button
            type="button"
            className={`${styles.filterTab} ${filterType === 'mapped' ? styles.filterTabActive : ''}`}
            onClick={() => onFilterChange('mapped')}
          >
            Mapped ({mappedCount})
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${filterType === 'unmapped' ? styles.filterTabActive : ''}`}
            onClick={() => onFilterChange('unmapped')}
          >
            Unmapped ({totalFieldsCount - mappedCount})
          </button>
        </div>
      </div>
    </div>
  );
}
