"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { manufacturersApi } from "@/lib/api/manufacturers";
import { useToastStore } from "@/store/toastStore";
import Loader from "@/components/shared/Loader";
import styles from "./manufacturerList.module.scss";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M17.862 16.978l-3.72-3.72a6.886 6.886 0 1 0-.884.884l3.72 3.72 1.768-1.768ZM3.237 8.862a5.625 5.625 0 1 1 5.625 5.625 5.625 5.625 0 0 1-5.625-5.625Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.75 5.625V0H5.625v5.625H0v1.125h5.625v5.625h1.125V6.75h5.625V5.625H6.75Z" fill="currentColor" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="3.5" r="1.6" fill="currentColor" />
      <circle cx="9" cy="9" r="1.6" fill="currentColor" />
      <circle cx="9" cy="14.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}

const fetchManufacturerList = async (search, signal) => {
  const res = await manufacturersApi.getManufacturers(
    { isActive: true, ...(search ? { search } : {}) },
    signal ? { signal } : {}
  );
  return Array.isArray(res) ? res : [];
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}/${date.getFullYear()}`;
};

export function ManufacturerList() {
  const router = useRouter();
  const toastInfo = useToastStore((s) => s.info);
  const toastSuccess = useToastStore((s) => s.success);
  const toastError = useToastStore((s) => s.error);
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Debounce the search box; the API call itself stays in useQuery.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!activeMenuId) return undefined;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setActiveMenuId(null);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActiveMenuId(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeMenuId]);

  const listQuery = useQuery({
    queryKey: ["manufacturers", "list", search],
    queryFn: ({ signal }) => fetchManufacturerList(search, signal),
    staleTime: 60_000,
  });

  const rows = useMemo(
    () => (Array.isArray(listQuery.data) ? listQuery.data : []),
    [listQuery.data]
  );

  const handleEdit = (item) => {
    setActiveMenuId(null);
    if (!item?.id) {
      toastInfo("Cannot edit: manufacturer ID is missing.");
      return;
    }
    router.push(`/manufacturer/edit-manufacturer/${String(item.id)}`);
  };

  const handleRemove = async (item) => {
    setActiveMenuId(null);
    const label = item?.fullName || item?.name || "this manufacturer";
    if (!window.confirm(`Remove ${label}? It will no longer appear in lists.`)) return;
    if (!item?.id) {
      toastError("Cannot remove: manufacturer ID is missing.");
      return;
    }
    try {
      await manufacturersApi.updateManufacturer({
        manufacturerId: String(item.id),
        isActive: false,
      });
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
      toastSuccess("Manufacturer removed.");
    } catch (err) {
      toastError(err?.message || "Failed to remove manufacturer.");
    }
  };

  return (
    <section className={styles.manufacturerList}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search manufacturers"
          />
        </div>
        <Link href="/manufacturer/add-manufacturer" className={styles.addBtn}>
          <PlusIcon />
          <span>Add Manufacturer</span>
        </Link>
      </div>

      <div className={styles.tableCard}>
        {listQuery.isLoading ? (
          <Loader />
        ) : listQuery.isError ? (
          <div className={styles.stateBox}>
            <span>{listQuery.error?.message || "Failed to load manufacturers."}</span>
          </div>
        ) : rows.length === 0 ? (
          <div className={styles.stateBox}>
            <span>No Record Found</span>
          </div>
        ) : (
          <>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile No</th>
                    <th>Address Line 1</th>
                    <th>Created Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => {
                    const id = item?.id ? String(item.id) : "";
                    const isMenuOpen = activeMenuId === id;
                    return (
                      <tr key={id}>
                        <td className={styles.nameCell}>
                          {item?.fullName || item?.name || "—"}
                        </td>
                        <td>{item?.phone || "—"}</td>
                        <td>{item?.addressLine1 || "—"}</td>
                        <td>{formatDate(item?.createdAt)}</td>
                        <td>
                          <div
                            className={styles.menuWrap}
                            ref={isMenuOpen ? menuRef : undefined}
                          >
                            <button
                              type="button"
                              className={styles.menuBtn}
                              aria-haspopup="menu"
                              aria-expanded={isMenuOpen}
                              aria-label="Manufacturer actions"
                              onClick={() => setActiveMenuId(isMenuOpen ? null : id)}
                            >
                              <DotsIcon />
                            </button>
                            {isMenuOpen && (
                              <div className={styles.menu} role="menu">
                                <button
                                  type="button"
                                  role="menuitem"
                                  className={styles.menuItem}
                                  onClick={() => handleEdit(item)}
                                >
                                  <EditIcon />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  className={styles.menuItem}
                                  onClick={() => handleRemove(item)}
                                >
                                  <RemoveIcon />
                                  <span>Remove</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default ManufacturerList;
