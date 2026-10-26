"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import styles from "./quoteList.module.scss";
import {createdByOptions,leadSourceOptions,leadOwnerOptions,stateOptions,manufacturerOptions,leadStatusOptions,webformOptions,dateFilterOptions,statusBadgeClass,formatOwner,mockQuotes,ROWS_PER_PAGE,
} from "./quoteListData";

const EMPTY_FILTERS = {
  createdBy: "",
  dateType: "",
  fromDate: "",
  fromBDate: "",
  toDate: "",
  leadSource: [],
  leadOwner: "",
  stateId: "",
  zipcode: "",
  manufacturer: "",
  leadStatus: [],
  webform: "",
  modifiedOwner: "",
  modifiedDateType: "",
  modifiedFromDate: "",
  modifiedFromBDate: "",
  modifiedToDate: "",
};

function truncateName(name) {
  const full = String(name || "");
  return full.length > 30 ? `${full.substring(0, 30)}..` : full;
}

function parseAddedDate(value) {
  // PHP displays MM/DD/YYYY
  const parts = String(value || "").split(/[-/]/);
  if (parts.length !== 3) return null;
  const date = new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function matchesDateFilter(dateStr, type, single, fromB, to) {
  if (!type) return true;
  const value = parseAddedDate(dateStr);
  if (!value) return true;
  const today = startOfDay(new Date());

  if (type === "today") return value.getTime() === today.getTime();

  if (type === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return value.getTime() === yesterday.getTime();
  }

  if (type === "on" || type === "before" || type === "after") {
    if (!single) return true;
    const target = startOfDay(new Date(`${single}T00:00:00`));
    if (Number.isNaN(target.getTime())) return true;
    if (type === "on") return value.getTime() === target.getTime();
    if (type === "before") return value < target;
    return value > target;
  }

  if (type === "between") {
    if (!fromB || !to) return true;
    const from = startOfDay(new Date(`${fromB}T00:00:00`));
    const end = startOfDay(new Date(`${to}T00:00:00`));
    if (Number.isNaN(from.getTime()) || Number.isNaN(end.getTime())) return true;
    return value >= from && value <= end;
  }

  // Relative ranges - this/last week, month, year
  const start = new Date(today);
  const end = new Date(today);
  if (type === "this_week") {
    start.setDate(today.getDate() - today.getDay());
  } else if (type === "last_week") {
    end.setDate(today.getDate() - today.getDay() - 1);
    start.setDate(today.getDate() - today.getDay() - 7);
  } else if (type === "this_month") {
    start.setDate(1);
  } else if (type === "last_month") {
    start.setMonth(today.getMonth() - 1, 1);
    end.setMonth(today.getMonth(), 0);
  } else if (type === "this_year") {
    start.setMonth(0, 1);
  } else if (type === "last_year") {
    start.setFullYear(today.getFullYear() - 1, 0, 1);
    end.setFullYear(today.getFullYear() - 1, 11, 31);
  } else {
    return true;
  }
  return value >= startOfDay(start) && value <= startOfDay(end);
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <path d="M18,24a5,5,0,1,1,5-5A5,5,0,0,1,18,24Zm0-8.75A3.75,3.75,0,1,0,21.75,19,3.75,3.75,0,0,0,18,15.25Z" transform="translate(-4.875 -5.25)" fill="rgba(255,255,255,0.6)" />
      <path d="M21.619,22.375,20,20.756V18h1.25v2.244l1.25,1.25Z" transform="translate(-7.5 -6.75)" fill="rgba(255,255,255,0.6)" />
      <path d="M19,4.5a1.25,1.25,0,0,0-1.25-1.25h-2.5V2H14V3.25H9V2H7.75V3.25H5.25A1.25,1.25,0,0,0,4,4.5V17a1.25,1.25,0,0,0,1.25,1.25h2.5V17H5.25V4.5h2.5V5.75H9V4.5h5V5.75h1.25V4.5h2.5V8.25H19Z" transform="translate(-1.5 -0.75)" fill="rgba(255,255,255,0.6)" />
      <rect width="20" height="20" fill="none" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <path d="M12.75,19h-2.5A1.25,1.25,0,0,1,9,17.75V13.006L4.369,8.375A1.25,1.25,0,0,1,4,7.494V5.25A1.25,1.25,0,0,1,5.25,4h12.5A1.25,1.25,0,0,1,19,5.25V7.494a1.25,1.25,0,0,1-.369.881L14,13.006V17.75A1.25,1.25,0,0,1,12.75,19ZM5.25,5.25V7.494l5,5V17.75h2.5V12.494l5-5V5.25Z" transform="translate(-1.5 -1.5)" fill="#fff" />
      <rect width="20" height="20" fill="none" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <path d="M18,8.875,17.125,8,13,12.125,8.875,8,8,8.875,12.125,13,8,17.125,8.875,18,13,13.875,17.125,18,18,17.125,13.875,13Z" transform="translate(-3 -3)" fill="#fff" />
      <rect width="20" height="20" fill="none" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8.23734 7L14 1.23734L12.7627 0L7 5.76266L1.23751 0L0 1.23734L5.76266 7L0 12.7627L1.23751 14L7 8.23734L12.7627 14L14 12.7627L8.23734 7Z" fill="white" fillOpacity="0.7" />
    </svg>
  );
}

function SortAscIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <path d="M26.7076 20.7076C26.6147 20.8005 26.5044 20.8743 26.383 20.9246C26.2616 20.9749 26.1315 21.0008 26.0001 21.0008C25.8687 21.0008 25.7385 20.9749 25.6171 20.9246C25.4957 20.8743 25.3854 20.8005 25.2926 20.7076L16.0001 11.4138L6.70757 20.7076C6.51993 20.8952 6.26543 21.0006 6.00007 21.0006C5.7347 21.0006 5.48021 20.8952 5.29257 20.7076C5.10493 20.5199 4.99951 20.2654 4.99951 20.0001C4.99951 19.7347 5.10493 19.4802 5.29257 19.2926L15.2926 9.29255C15.3854 9.19958 15.4957 9.12582 15.6171 9.07549C15.7385 9.02517 15.8687 8.99927 16.0001 8.99927C16.1315 8.99927 16.2616 9.02517 16.383 9.07549C16.5044 9.12582 16.6147 9.19958 16.7076 9.29255L26.7076 19.2926C26.8005 19.3854 26.8743 19.4957 26.9246 19.6171C26.975 19.7385 27.0009 19.8686 27.0009 20.0001C27.0009 20.1315 26.975 20.2616 26.9246 20.383C26.8743 20.5044 26.8005 20.6147 26.7076 20.7076Z" fill={active ? "#ffffff" : "#8a8a8a"} />
    </svg>
  );
}

function SortDescIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <path d="M26.7076 12.7074L16.7076 22.7074C16.6147 22.8004 16.5044 22.8742 16.383 22.9245C16.2616 22.9748 16.1315 23.0007 16.0001 23.0007C15.8687 23.0007 15.7385 22.9748 15.6171 22.9245C15.4957 22.8742 15.3854 22.8004 15.2926 22.7074L5.29257 12.7074C5.10493 12.5198 4.99951 12.2653 4.99951 11.9999C4.99951 11.7346 5.10493 11.4801 5.29257 11.2924C5.48021 11.1048 5.7347 10.9994 6.00007 10.9994C6.26543 10.9994 6.51993 11.1048 6.70757 11.2924L16.0001 20.5862L25.2926 11.2924C25.3855 11.1995 25.4958 11.1258 25.6172 11.0756C25.7386 11.0253 25.8687 10.9994 26.0001 10.9994C26.1315 10.9994 26.2616 11.0253 26.383 11.0756C26.5044 11.1258 26.6147 11.1995 26.7076 11.2924C26.8005 11.3854 26.8742 11.4957 26.9245 11.617C26.9747 11.7384 27.0006 11.8686 27.0006 11.9999C27.0006 12.1313 26.9747 12.2614 26.9245 12.3828C26.8742 12.5042 26.8005 12.6145 26.7076 12.7074Z" fill={active ? "#ffffff" : "#8a8a8a"} />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <rect width="1.25" height="7.5" transform="translate(7.5 7.5)" fill="#131416" />
      <rect width="1.25" height="7.5" transform="translate(11.25 7.5)" fill="#131416" />
      <path d="M4,6V7.25H5.25v12.5A1.25,1.25,0,0,0,6.5,21h10a1.25,1.25,0,0,0,1.25-1.25V7.25H19V6ZM6.5,19.75V7.25h10v12.5Z" transform="translate(-1.5 -2.25)" fill="#131416" />
      <rect width="5" height="1.25" transform="translate(7.5 1.25)" fill="#131416" />
      <rect width="20" height="20" fill="none" />
    </svg>
  );
}

function MultiSelect({ id, label, options, values, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const search = query.trim().toLowerCase();
  const visible = search
    ? options.filter((o) => o.toLowerCase().includes(search))
    : options;

  function toggle(value) {
    onChange(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
    );
  }

  const display =
    values.length === 0
      ? "Select"
      : values.length <= 2
        ? values.join(", ")
        : `${values.length} selected`;

  return (
    <div className={styles.field} ref={ref}>
      <button
        type="button"
        className={styles.select}
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.msDisplay}>{display}</span>
      </button>
      <label className={styles.floatingLabel} htmlFor={id}>{label}</label>
      {open && (
        <div className={styles.msMenu} role="listbox" aria-label={label}>
          <input
            className={styles.msSearch}
            placeholder="Search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={`Search ${label}`}
          />
          <div className={styles.msList}>
            {visible.map((option) => (
              <label key={option} className={styles.msItem}>
                <span className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={values.includes(option)}
                    onChange={() => toggle(option)}
                    aria-label={option}
                  />
                  <span className={styles.checkmark} aria-hidden="true" />
                </span>
                <span>{option}</span>
              </label>
            ))}
            {visible.length === 0 && (
              <div className={styles.msEmpty}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DateFields({ idPrefix, dateType, single, fromB, to, onChange }) {
  const showSingle = dateType === "on" || dateType === "before" || dateType === "after";
  const showDouble = dateType === "between";
  return (
    <>
      {showSingle && (
        <div className={styles.dateOption}>
          <input
            className={styles.input}
            id={`${idPrefix}-single`}
            name={`${idPrefix}-single`}
            autoComplete="off"
            value={single}
            onChange={(e) => onChange("single", e.target.value)}
            placeholder="YY-MM-DD"
            type="text"
            aria-label="Filter date"
          />
          <CalendarIcon />
        </div>
      )}
      {showDouble && (
        <>
          <div className={styles.dateOption}>
            <input
              className={styles.input}
              id={`${idPrefix}-from`}
              name={`${idPrefix}-from`}
              autoComplete="off"
              value={fromB}
              onChange={(e) => onChange("fromB", e.target.value)}
              placeholder="From"
              type="text"
              aria-label="From date"
            />
            <CalendarIcon />
          </div>
          <div className={styles.dateOption}>
            <input
              className={styles.input}
              id={`${idPrefix}-to`}
              name={`${idPrefix}-to`}
              autoComplete="off"
              value={to}
              onChange={(e) => onChange("to", e.target.value)}
              placeholder="To"
              type="text"
              aria-label="To date"
            />
            <CalendarIcon />
          </div>
        </>
      )}
    </>
  );
}

export default function QuoteListView() {
  const [quotes, setQuotes] = useState(mockQuotes);
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortDir, setSortDir] = useState(null);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [flash, setFlash] = useState("");
  const [zipError, setZipError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showBackTop, setShowBackTop] = useState(false);
  const [mounted, setMounted] = useState(false);

  const hasActiveFilter = useMemo(
    () => JSON.stringify(applied) !== JSON.stringify(EMPTY_FILTERS),
    [applied]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(""), 7000);
    return () => clearTimeout(timer);
  }, [flash]);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(() => {
    const rows = quotes.filter((quote) => {
      if (applied.createdBy && quote.createdBy !== applied.createdBy) return false;
      if (applied.leadSource.length > 0 && !applied.leadSource.includes(quote.source)) return false;
      if (applied.leadOwner && quote.owner !== applied.leadOwner) return false;
      if (applied.stateId && quote.stateId !== applied.stateId) return false;
      if (applied.zipcode && quote.zip !== applied.zipcode) return false;
      if (applied.manufacturer && quote.manufacturer !== applied.manufacturer) return false;
      if (applied.leadStatus.length > 0 && !applied.leadStatus.includes(quote.status)) return false;
      if (applied.webform && quote.webform !== applied.webform) return false;
      if (applied.modifiedOwner && quote.owner !== applied.modifiedOwner) return false;
      if (!matchesDateFilter(quote.dateAdded, applied.dateType, applied.fromDate, applied.fromBDate, applied.toDate)) return false;
      if (!matchesDateFilter(quote.dateAdded, applied.modifiedDateType, applied.modifiedFromDate, applied.modifiedFromBDate, applied.modifiedToDate)) return false;
      return true;
    });
    if (sortDir === "ASC") return [...rows].sort((a, b) => a.name.localeCompare(b.name));
    if (sortDir === "DESC") return [...rows].sort((a, b) => b.name.localeCompare(a.name));
    return rows;
  }, [quotes, applied, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const allSelected = pageRows.length > 0 && pageRows.every((row) => selected.includes(row.id));

  function updateDraft(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (key === "zipcode") setZipError("");
  }

  function updateMulti(key, values) {
    setDraft((prev) => ({ ...prev, [key]: values }));
  }

  function handleSearch(e) {
    e.preventDefault();
    if (draft.zipcode !== "" && !/^\d+$/.test(draft.zipcode)) {
      setZipError("Please enter a valid numeric zip code.");
      return;
    }
    setZipError("");
    setApplied({ ...draft });
    setSelected([]);
    setPage(1);
    setFilterOpen(false);
  }

  function handleReset() {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setZipError("");
    setSelected([]);
    setPage(1);
    setSortDir(null);
  }

  function toggleSelect(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !pageRows.some((row) => row.id === id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...pageRows.map((row) => row.id)])]);
    }
  }

  function openDelete() {
    setDeleteError("");
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (selected.length === 0) {
      setDeleteError("Please select leads.");
      return;
    }
    const ids = new Set(selected);
    setQuotes((prev) => prev.filter((quote) => !ids.has(quote.id)));
    setSelected([]);
    setDeleteOpen(false);
    setPage(1);
    setFlash(`${selected.length} quote(s) deleted successfully.`);
  }

  function goToPage(next) {
    setPage(Math.min(Math.max(1, next), totalPages));
  }

  const filterPanel = (
    <>
      <div className={filterOpen ? styles.filterDiv : styles.filterDivHidden} role="dialog" aria-label="Filter quotes" aria-hidden={!filterOpen}>
        <div className={styles.filterMain}>
          <div className={styles.titleCaption}>
            <h3>Filter By</h3>
            <p>Refine your results using the filters below.</p>
          </div>
          <button type="button" className={styles.crossFilter} onClick={() => setFilterOpen(false)} aria-label="Close filter">
            <CrossIcon />
          </button>

          <div className={styles.filterTop}>
            <form className={styles.filterForm} onSubmit={handleSearch}>
              <div className={styles.filterScroll}>
                <div className={styles.field}>
                  <select
                    className={styles.select}
                    id="created_by"
                    name="created_by"
                    value={draft.createdBy}
                    onChange={(e) => updateDraft("createdBy", e.target.value)}
                  >
                    <option value="">Created By</option>
                    {createdByOptions.map((user) => (
                      <option key={user} value={user}>{formatOwner(user)}</option>
                    ))}
                  </select>
                  <label className={styles.floatingLabel} htmlFor="created_by">Created By</label>
                </div>

                <div className={styles.field}>
                  <select
                    className={styles.select}
                    id="lead_user"
                    name="datefilter_type"
                    value={draft.dateType}
                    onChange={(e) => updateDraft("dateType", e.target.value)}
                  >
                    <option value="">Select</option>
                    {dateFilterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                      </option>
                    ))}
                  </select>
                  <label className={styles.floatingLabel} htmlFor="lead_user">Created Date</label>
                </div>
                <DateFields
                  idPrefix="created"
                  dateType={draft.dateType}
                  single={draft.fromDate}
                  fromB={draft.fromBDate}
                  to={draft.toDate}
                  onChange={(kind, value) =>
                    updateDraft(kind === "single" ? "fromDate" : kind === "fromB" ? "fromBDate" : "toDate", value)
                  }
                />

                <MultiSelect
                  id="lead_source"
                  label="Lead Source"
                  options={leadSourceOptions}
                  values={draft.leadSource}
                  onChange={(values) => updateMulti("leadSource", values)}
                />

                <div className={styles.field}>
                  <select
                    className={styles.select}
                    id="lead_ownerw"
                    name="lead_owner"
                    value={draft.leadOwner}
                    onChange={(e) => updateDraft("leadOwner", e.target.value)}
                  >
                    <option value="">Lead Owner</option>
                    {leadOwnerOptions.map((user) => (
                      <option key={user} value={user}>{formatOwner(user)}</option>
                    ))}
                  </select>
                  <label className={styles.floatingLabel} htmlFor="lead_ownerw">Lead Owner</label>
                </div>

                <div className={styles.field}>
                  <select
                    className={styles.select}
                    id="select_state"
                    name="state"
                    value={draft.stateId}
                    onChange={(e) => updateDraft("stateId", e.target.value)}
                  >
                    <option value="">Select State</option>
                    {stateOptions.map((state) => (
                      <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                  </select>
                  <label className={styles.floatingLabel} htmlFor="select_state">Select State</label>
                </div>

                <div className={styles.field}>
                  <input
                    className={styles.input}
                    id="zipcode"
                    type="number"
                    name="zipcode"
                    placeholder="Enter Zip Code"
                    value={draft.zipcode}
                    onChange={(e) => updateDraft("zipcode", e.target.value)}
                    aria-label="Zip code"
                    min="0"
                  />
                  <label className={styles.floatingLabel} htmlFor="zipcode">Zipcode</label>
                  {zipError && <span className={styles.fieldError}>{zipError}</span>}
                </div>

                <div className={styles.field}>
                  <select
                    className={styles.select}
                    id="select-manufacturer"
                    name="manufacturer"
                    value={draft.manufacturer}
                    onChange={(e) => updateDraft("manufacturer", e.target.value)}
                  >
                    <option value="">Manufacturer</option>
                    {manufacturerOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <label className={styles.floatingLabel} htmlFor="select-manufacturer">Manufacturer</label>
                </div>

                <MultiSelect
                  id="lead_status"
                  label="Lead Status"
                  options={leadStatusOptions}
                  values={draft.leadStatus}
                  onChange={(values) => updateMulti("leadStatus", values)}
                />

                <div className={styles.field}>
                  <select
                    className={styles.select}
                    id="select-webform"
                    name="webform"
                    value={draft.webform}
                    onChange={(e) => updateDraft("webform", e.target.value)}
                  >
                    <option value="">Web Forms</option>
                    {webformOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <label className={styles.floatingLabel} htmlFor="select-webform">Web Forms</label>
                </div>

                <div className={styles.field}>
                  <select
                    className={styles.select}
                    id="lead_owner_md"
                    name="m_lead_owner"
                    value={draft.modifiedOwner}
                    onChange={(e) => updateDraft("modifiedOwner", e.target.value)}
                  >
                    <option value="">Lead Owner</option>
                    {leadOwnerOptions.map((user) => (
                      <option key={user} value={user}>{formatOwner(user)}</option>
                    ))}
                  </select>
                  <label className={styles.floatingLabel} htmlFor="lead_owner_md">Lead Owner</label>
                </div>

                <div className={styles.field}>
                  <select
                    className={styles.select}
                    id="lead_user_modified"
                    name="m_datefilter_type"
                    value={draft.modifiedDateType}
                    onChange={(e) => updateDraft("modifiedDateType", e.target.value)}
                  >
                    <option value="">Select</option>
                    {dateFilterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                      </option>
                    ))}
                  </select>
                  <label className={styles.floatingLabel} htmlFor="lead_user_modified">Modified Date</label>
                </div>
                <DateFields
                  idPrefix="modified"
                  dateType={draft.modifiedDateType}
                  single={draft.modifiedFromDate}
                  fromB={draft.modifiedFromBDate}
                  to={draft.modifiedToDate}
                  onChange={(kind, value) =>
                    updateDraft(kind === "single" ? "modifiedFromDate" : kind === "fromB" ? "modifiedFromBDate" : "modifiedToDate", value)
                  }
                />
              </div>

              <div className={styles.filterBtnRow}>
                <button type="button" className={styles.btnOutline} onClick={handleReset}>Close</button>
                <button type="submit" className={styles.btnInfo}>Search</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <button
        type="button"
        className={`${styles.filterBackdrop} ${filterOpen ? styles.filterBackdropVisible : ""}`}
        onClick={() => setFilterOpen(false)}
        aria-label="Close filter backdrop"
        tabIndex={filterOpen ? 0 : -1}
      />
    </>
  );

  return (
    <div className={styles.wrapper}>
      {mounted ? createPortal(filterPanel, document.body) : filterPanel}

      {/* Listing */}
      <div className={styles.main}>
        <div className={`${styles.block} prtm-block pos-relative lead_listingMain`}>
          <div className={styles.blockTitle}>
            <div className={styles.funRow}>
              {filterOpen ? (
                <button type="button" className={styles.funBtn} onClick={() => setFilterOpen(false)}>
                  <CloseIcon />
                  <span className={styles.textWrapper}>
                    <span className={styles.text1}>Close Filter</span>
                    <span className={styles.text2}>Close Filter</span>
                  </span>
                </button>
              ) : (
                <button type="button" className={styles.funBtn} onClick={() => setFilterOpen(true)}>
                  <FilterIcon />
                  <span className={styles.textWrapper}>
                    <span className={styles.text1}>Filter By</span>
                    <span className={styles.text2}>Filter By</span>
                  </span>
                </button>
              )}
              <div className={styles.leadCounter}>
                <span id="tot_lead_count">({filtered.length} Quotes)</span>
              </div>
            </div>
          </div>

          {flash && (
            <div className={styles.flashMsg} role="status">
              {flash}
            </div>
          )}

          <div className={styles.blockContent} id="refress_div">
            <div className={styles.tableScroll}>
              <input type="hidden" name="lead_order_val" value={sortDir || ""} readOnly />
              <table className={styles.table} id="leadList">
                <thead>
                  <tr>
                    <th>
                      <label className={styles.checkbox}>
                        <input type="checkbox" name="check_all" id="check_all" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all quotes" />
                        <span className={styles.checkmark} />
                      </label>
                    </th>
                    <th>
                      Quote Name
                      <span className={styles.sortWrap}>
                        <button type="button" className={`${styles.sortBtn} ${sortDir === "ASC" ? styles.sortActive : ""}`} onClick={() => { setSortDir("ASC"); setPage(1); }} aria-label="Sort quote names ascending">
                          <SortAscIcon active={sortDir === "ASC"} />
                        </button>
                        <button type="button" className={`${styles.sortBtn} ${sortDir === "DESC" ? styles.sortActive : ""}`} onClick={() => { setSortDir("DESC"); setPage(1); }} aria-label="Sort quote names descending">
                          <SortDescIcon active={sortDir === "DESC"} />
                        </button>
                      </span>
                    </th>
                    <th>Owner</th>
                    <th>Grant Total</th>
                    <th>Date Added</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((quote, index) => (
                    <tr key={quote.id} id={(safePage - 1) * ROWS_PER_PAGE + index + 1} className={`removeRow${quote.pid}`}>
                      <td>
                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            className="select_lead_checkbox"
                            value={quote.id}
                            checked={selected.includes(quote.id)}
                            onChange={() => toggleSelect(quote.id)}
                            aria-label={`Select ${quote.name}`}
                          />
                          <span className={styles.checkmark} />
                        </label>
                      </td>
                      <td>
                        <Link
                          href={`/quote/edit-quote/${quote.id}`}
                          title={quote.name}
                          aria-label={quote.name}
                          className={styles.nameCell}
                        >
                          {truncateName(quote.name)}
                        </Link>
                      </td>
                      <td>{formatOwner(quote.owner)}</td>
                      <td>$ {quote.total}</td>
                      <td>{quote.dateAdded}</td>
                      <td className={styles.statusCell}>
                        <span className={`${styles.badge} ${styles[statusBadgeClass[quote.status]] || styles.ls_success}`}>
                          {quote.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {pageRows.length === 0 && (
                    <tr className={styles.emptyRow}>
                      <td colSpan={6}>No Record Found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {selected.length > 0 && (
              <div className={styles.bulkBar}>
                <span>{selected.length} selected</span>
                <button type="button" className={styles.bulkDeleteBtn} onClick={openDelete}>
                  Delete Selected
                </button>
              </div>
            )}

            <div id="lead_pagination">
              {totalPages > 1 && (
                <ul className={styles.pagination}>
                  <li>
                    <button type="button" className={styles.pageBtn} disabled={safePage === 1} onClick={() => goToPage(safePage - 1)}>
                      Prev
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNo) => (
                    <li key={pageNo}>
                      <button
                        type="button"
                        className={`${styles.pageBtn} ${pageNo === safePage ? styles.pageActive : ""}`}
                        onClick={() => goToPage(pageNo)}
                      >
                        {pageNo}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button type="button" className={styles.pageBtn} disabled={safePage === totalPages} onClick={() => goToPage(safePage + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.modalOverlay} ${deleteOpen ? styles.modalOverlayOpen : ""}`} role="dialog" aria-modal="true" aria-label="Delete quote" aria-hidden={!deleteOpen}>
        <div className={styles.modalDialog}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <TrashIcon />
            </div>
            <input type="hidden" name="lead_id" value={selected.join(",")} readOnly />
            <h4 className={`${styles.modalTitle} ${deleteError ? styles.modalTitleError : ""}`} id="chose_leads">
              {deleteError || "Delete This Quote"}
            </h4>
            {!deleteError && <p className={styles.modalText} id="quote_msg">Are you sure you want to delete this quote</p>}
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalNo} onClick={() => setDeleteOpen(false)}>
                Cancel
              </button>
              <button type="button" className={styles.modalYes} onClick={confirmDelete} disabled={selected.length === 0}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.backTop} ${showBackTop ? styles.backTopVisible : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        tabIndex={showBackTop ? 0 : -1}
      >
        ↑
      </button>
    </div>
  );
}
