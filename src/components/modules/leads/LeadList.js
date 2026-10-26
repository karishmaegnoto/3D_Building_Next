"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { leadsApi } from "@/lib/api/leads";
import { usersApi } from "@/lib/api/users";
import styles from "./leads.module.scss";

function getUserDisplayName(u) {
  if (!u) return "";
  if (typeof u === "string") return u;
  const full = [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim();
  const name = full || u?.name || u?.userName || u?.username || u?.email || "";
  return String(name).trim().replace(/_/g, " ");
}

function getOwnerDisplayName(owner, usersById) {
  if (!owner) return "Viking Steel Structures";
  if (typeof owner === "object") {
    const label = getUserDisplayName(owner);
    if (label) return label;
    const id = String(owner?._id || owner?.id || "");
    if (id && usersById?.[id]) return usersById[id];
    return "Viking Steel Structures";
  }
  const id = String(owner);
  // If it's already a name (old data like "Viking Steel Structures"), keep it
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return id;
  if (usersById?.[id]) return usersById[id];
  return id;
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function TransposeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_6051_4946)">
        <path fillRule="evenodd" clipRule="evenodd" d="M11 13.5C11.3314 13.5004 11.6495 13.6319 11.8838 13.8662C12.1181 14.1005 12.2496 14.4186 12.25 14.75V23.5C12.2496 23.8314 12.1181 24.1495 11.8838 24.3838C11.6495 24.6181 11.3314 24.7496 11 24.75H8.5C8.1686 24.7496 7.85055 24.6181 7.61621 24.3838C7.38187 24.1495 7.25038 23.8314 7.25 23.5V14.75C7.25038 14.4186 7.38187 14.1005 7.61621 13.8662C7.85055 13.6319 8.1686 13.5004 8.5 13.5H11ZM8.5 23.5H11V14.75H8.5V23.5Z" fill="currentColor" />
        <path d="M22.25 17.875C22.2487 19.0349 21.787 20.1466 20.9668 20.9668C20.1466 21.787 19.0349 22.2487 17.875 22.25H14.75V21H17.875C18.7035 20.9991 19.4981 20.6698 20.084 20.084C20.6698 19.4981 20.9991 18.7035 21 17.875V14.75H22.25V17.875Z" fill="currentColor" />
        <path fillRule="evenodd" clipRule="evenodd" d="M23.5 7.25C23.8314 7.25038 24.1495 7.38187 24.3838 7.61621C24.6181 7.85055 24.7496 8.1686 24.75 8.5V11C24.7496 11.3314 24.6181 11.6495 24.3838 11.8838C24.1495 12.1181 23.8314 12.2496 23.5 12.25H14.75C14.4186 12.2496 14.1005 12.1181 13.8662 11.8838C13.6319 11.6495 13.5004 11.3314 13.5 11V8.5C13.5004 8.1686 13.6319 7.85055 13.8662 7.61621C14.1005 7.38187 14.4186 7.25038 14.75 7.25H23.5ZM14.75 11H23.5V8.5H14.75V11Z" fill="currentColor" />
      </g>
      <defs>
        <clipPath id="clip0_6051_4946">
          <rect width="30" height="30" fill="white" transform="translate(6 6)" />
        </clipPath>
      </defs>
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function LayoutViewsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SortArrowsIcon() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className={styles.sortIcon}>
      <path d="M4 1L7.5 5H0.5L4 1Z" fill="currentColor" />
      <path d="M4 11L0.5 7H7.5L4 11Z" fill="currentColor" />
    </svg>
  );
}

function LeadPersonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.contactIcon}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 14c-2.8 0-5 1.5-5 3.2" />
      <circle cx="12" cy="9.5" r="3" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}

function DropdownCaretIcon() {
  return (
    <svg width="9" height="6" viewBox="0 0 10 6" fill="currentColor">
      <path d="M0 0.5L5 5.5L10 0.5H0Z" />
    </svg>
  );
}

function formatTableDate(dateVal) {
  if (!dateVal) return "-";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  } catch {
    return dateVal;
  }
}

function getStatusBadgeClass(status = "") {
  const s = (status || "").toLowerCase();
  if (s.includes("unreachable") || s.includes("attempt")) return styles.statusUnreachable;
  if (s.includes("reject") || s.includes("lost")) return styles.statusRejected;
  if (s.includes("approval") || s.includes("won") || s.includes("qualif")) return styles.statusApproval;
  return styles.statusNew;
}

export function LeadList() {
  const router = useRouter();

  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("createdTime");
  const [sortAsc, setSortAsc] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [goToPageInput, setGoToPageInput] = useState("");
  const [usersById, setUsersById] = useState({});

  const handleGoToPage = (e) => {
    if (e.key === "Enter") {
      const p = parseInt(goToPageInput, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        setCurrentPage(p);
      }
    }
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { leads: list, total } = await leadsApi.getLeadList();
      setLeads(list || []);
      setTotalCount(total || list?.length || 0);
    } catch (err) {
      setError(err?.message || "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { users } = await usersApi.getUsers();
        if (cancelled || !Array.isArray(users)) return;
        const map = {};
        users.forEach((u) => {
          const id = String(u?._id || u?.id || "");
          if (id) map[id] = getUserDisplayName(u);
        });
        setUsersById(map);
      } catch (_) {
        // keep fallback display if users fetch fails
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) return leads;
    const term = searchTerm.toLowerCase().trim();
    return leads.filter((l) => {
      const name = `${l.firstName || ""} ${l.lastName || ""}`.trim() || l.name || "";
      const email = l.email || "";
      const phone = l.phone || l.mobile || "";
      const status = l.leadStatus || "";
      const state = l.address?.state || l.state || "";
      return (
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        phone.toLowerCase().includes(term) ||
        status.toLowerCase().includes(term) ||
        state.toLowerCase().includes(term)
      );
    });
  }, [leads, searchTerm]);

  const sortedLeads = useMemo(() => {
    const list = [...filteredLeads];
    list.sort((a, b) => {
      let valA = "";
      let valB = "";
      if (sortField === "name") {
        valA = `${a.firstName || ""} ${a.lastName || ""}`.trim() || a.name || "";
        valB = `${b.firstName || ""} ${b.lastName || ""}`.trim() || b.name || "";
      } else if (sortField === "createdTime") {
        valA = a.createdAt || a.createdTime || "";
        valB = b.createdAt || b.createdTime || "";
      } else {
        valA = (a[sortField] || "").toString();
        valB = (b[sortField] || "").toString();
      }
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredLeads, sortField, sortAsc]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedLeads.slice(start, start + rowsPerPage);
  }, [sortedLeads, currentPage, rowsPerPage]);

  const displayTotal = totalCount || sortedLeads.length;
  const totalPages = Math.ceil(displayTotal / rowsPerPage) || 1;
  const allSelected = paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedIds.has(l._id || l.id));
  const rangeStart = displayTotal === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const rangeEnd = Math.min(currentPage * rowsPerPage, displayTotal);

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) {
      paginatedLeads.forEach((l) => next.delete(l._id || l.id));
    } else {
      paginatedLeads.forEach((l) => next.add(l._id || l.id));
    }
    setSelectedIds(next);
  };

  const toggleSelectRow = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc((v) => !v);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className={styles.leadsContainer}>
      <div className={styles.topActionBar}>
        <div className={styles.leftControls}>
          <div className={styles.searchBox}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search leads by name, email, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button type="button" className={styles.filterByButton}>
            <FilterIcon />
            <span>Filters</span>
          </button>
        </div>

        <div className={styles.rightControls}>
          <div className={styles.secondaryActions}>
            <button
              type="button"
              className={styles.iconActionButton}
              title="Share"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard?.writeText(window.location.href);
                }
              }}
            >
              <ShareIcon />
            </button>
            <button type="button" className={styles.iconActionButton} title="Transpose / Views">
              <TransposeIcon />
            </button>
          </div>
          <Link href="/lead/add-lead" className={styles.createLeadButton}>
            <PlusIcon />
            <span>Create Lead</span>
          </Link>
        </div>
      </div>

      <div className={styles.tableCardBox}>
        <div className={styles.tableWrapper}>
          <table className={styles.leadsTable}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all leads"
                    disabled={paginatedLeads.length === 0}
                  />
                </th>
                <th className={styles.sortable} onClick={() => handleSort("name")}>
                  <div className={styles.thContent}>
                    <span>Lead Name</span>
                    <SortArrowsIcon />
                  </div>
                </th>
                <th>Email</th>
                <th>Lead Status</th>
                <th>Source Form</th>
                <th>State</th>
                <th>Lead Owner</th>
                <th className={styles.sortable} onClick={() => handleSort("createdTime")}>
                  <span>Created Time</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className={styles.loadingRow}>
                  <td colSpan={8}>Loading leads...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8}>
                    <div className={styles.errorState}>
                      <p>⚠️ {error}</p>
                      <button type="button" onClick={fetchLeads}>Retry</button>
                    </div>
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className={styles.emptyState}>
                      <p>No leads found.</p>
                      <Link href="/lead/add-lead" className={styles.createEmptyBtn}>
                        <PlusIcon />
                        <span>Create Lead</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead, idx) => {
                  const leadId = lead._id || lead.id || `lead-${idx}`;
                  const leadName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.name || "Unnamed Lead";
                  const ownerName = getOwnerDisplayName(lead.leadOwner, usersById);
                  const stateVal = lead.address?.state || lead.state || "";
                  const sourceVal = lead.websiteSourceForm || lead.sourceForm || "3D Estimator";
                  const showContactIcon = lead.hasContactIcon || lead.contactPerson || idx === 0;

                  return (
                    <tr
                      key={leadId}
                      className={`${selectedIds.has(leadId) ? styles.selectedRow : ""} ${styles.clickableRow}`}
                      onClick={(e) => {
                        if (e.target.tagName.toLowerCase() === "input") return;
                        router.push(`/lead/edit-lead/${leadId}`);
                      }}
                    >
                      <td className={styles.checkboxCell} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(leadId)}
                          onChange={() => toggleSelectRow(leadId)}
                          aria-label={`Select ${leadName}`}
                        />
                      </td>
                      <td>
                        <div className={styles.leadNameCell}>
                          <span className={styles.nameText}>{leadName}</span>
                          {showContactIcon && <LeadPersonIcon />}
                        </div>
                      </td>
                      <td className={styles.emailCell}>{lead.email || ""}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(lead.leadStatus || "New Lead")}`}>
                          {lead.leadStatus || "New Lead"}
                        </span>
                      </td>
                      <td className={styles.sourceCell}>{sourceVal}</td>
                      <td className={styles.stateCell}>{stateVal}</td>
                      <td className={styles.ownerCell}>{ownerName}</td>
                      <td className={styles.dateCell}>{formatTableDate(lead.createdAt || lead.createdTime)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar matching Figma Specs */}
      <div className={styles.paginationBar}>
        <div className={styles.leftPaginationAside}>
          <span className={styles.rowsLabel}>Rows per page</span>
          <div className={styles.rowsSelectBox}>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Rows per page"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className={styles.selectArrow}>
              <DropdownCaretIcon />
            </div>
          </div>
          <span className={styles.pageRangeText}>
            {displayTotal === 0
              ? "0 results"
              : `${rangeStart.toLocaleString()}–${rangeEnd.toLocaleString()} of ${displayTotal.toLocaleString()}`}
          </span>
        </div>

        <div className={styles.rightPaginationAside}>
          <div className={styles.paginationCol}>
            <button
              type="button"
              className={styles.prevBtn}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon />
              <span>Prev</span>
            </button>
            <div className={styles.pageIndication}>
              <span className={styles.pageText}>Page</span>
              <span className={styles.pageNum}>{currentPage}</span>
              <span className={styles.ofText}>of</span>
              <span className={styles.totalNum}>{totalPages}</span>
            </div>
            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
            >
              <span>Next</span>
              <ChevronRightIcon />
            </button>
          </div>

          <div className={styles.goToPageCol}>
            <span className={styles.goToLabel}>Go to page</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              className={styles.goToInput}
              value={goToPageInput}
              onChange={(e) => setGoToPageInput(e.target.value)}
              onKeyDown={handleGoToPage}
              placeholder={currentPage.toString()}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default LeadList;
