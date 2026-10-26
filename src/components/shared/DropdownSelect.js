"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./DropdownSelect.module.scss";

export default function DropdownSelect({
  id,
  label,
  placeholder = "Select",
  options = [],
  value = [],
  onChange,
  max = Infinity,
  disabled = false,
  showSearch = false,
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  onLimit,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open ]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((o) => String(o.label || "").toLowerCase().includes(term));
  }, [options, query]);

  const selectedLabels = useMemo(
    () =>
      value
        .map((v) => options.find((o) => String(o.value) === String(v))?.label)
        .filter(Boolean),
    [options, value]
  );

  const toggle = (optionValue) => {
    const str = String(optionValue);
    const has = value.map(String).includes(str);
    if (has) {
      onChange(value.filter((v) => String(v) !== str));
      return;
    }
    if (value.length >= max) {
      if (onLimit) onLimit();
      return;
    }
    onChange([...value, optionValue]);
  };

  return (
    <div ref={wrapRef} className={`${styles.ddSelect} ${className}`}>
      <button
        type="button"
        id={id}
        className={`${styles.ddSelectBox} ${open ? styles.open : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        <span className={selectedLabels.length === 0 ? styles.ddPlaceholder : styles.ddValue}>
          {selectedLabels.length === 0 ? placeholder : selectedLabels.join(", ")}
        </span>
        <span className={`${styles.ddCaret} ${open ? styles.open : ""}`} aria-hidden="true" />
      </button>
      {label && (
        <label className={styles.ddLabel} htmlFor={id}>
          {label}
        </label>
      )}
      {open && !disabled && (
        <div className={styles.ddMenu} role="listbox" aria-label={label || placeholder}>
          {showSearch && (
            <input
              className={styles.ddSearch}
              placeholder={searchPlaceholder}
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={searchPlaceholder}
            />
          )}
          <div className={styles.ddList}>
            {visible.map((o) => {
              const checked = value.map(String).includes(String(o.value));
              return (
                <label key={String(o.value)} className={styles.ddItem}>
                  <input
                    type="checkbox"
                    className={styles.ddCheck}
                    checked={checked}
                    onChange={() => toggle(o.value)}
                  />
                  <span className={styles.ddItemLabel}>{o.label}</span>
                </label>
              );
            })}
            {visible.length === 0 && <div className={styles.ddEmpty}>{emptyText}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
