"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import { ENV } from "@/config/env";
import { AvatarUpload, FieldError, SaveButton } from "@/components/shared";
import { getToken } from "@/lib/auth/token";
import { isRequired, isValidEmail, isValidUSPhone, validatePasswordPair, formatUSPhoneNumber } from "@/lib/utils/validation";
import { useToastStore } from "@/store/toastStore";
import styles from "./users.module.scss";

const AVATAR_COLORS = [
  "avatar-blue",
  "avatar-purple",
  "avatar-pink",
  "avatar-yellow",
  "avatar-cyan",
  "avatar-red",
  "avatar-orange",
];

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  let initials = "";
  for (const p of parts) {
    if (p) {
      initials += p[0].toUpperCase();
      if (initials.length >= 2) break;
    }
  }
  return initials || "U";
}

const STATIC_ROLES = ["lead owner assist", "lead owner", "manager", "admin"];

const ADDRESS_FIELDS = ["address", "other_address", "city", "state", "country", "zipcode"];

function addressJsonOf(u) {
  const clean = (v) => (v && v !== "-" ? v : "");
  return JSON.stringify({
    addressLine1: clean(u.address),
    addressLine2: clean(u.other_address),
    city: clean(u.city),
    country: clean(u.country),
    zipCode: clean(u.zipcode),
    state: clean(u.state),
  });
}

function resolveUserImage(path) {
  if (!path) return null;
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  const origin = String(ENV.API_BASE_URL || "").replace(/\/api\/v1\/?$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function mapApiUser(u, idx) {
  const name = (u?.name || u?.username || "").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const roleName =
    (typeof u?.role === "object" ? u?.role?.name : u?.role) || "-";
  return {
    id: u?._id || u?.id || `user-${idx}`,
    username: name || u?.email || "Unnamed user",
    first_name: u?.firstName || u?.first_name || parts[0] || "",
    last_name: u?.lastName || u?.last_name || parts.slice(1).join(" ") || "",
    email: u?.email || "",
    mobile_no: u?.phone || u?.mobile_no || u?.mobile || "",
    role: roleName,
    role_id: (typeof u?.role === "object" ? u?.role?._id : u?.role_id) || roleName,
    address: typeof u?.address === "string" ? u.address : "-",
    other_address: "-",
    city: u?.city || "-",
    state: u?.state || "-",
    zipcode: u?.zipCode || u?.zipcode || "-",
    country: u?.country || "-",
    status: u?.isActive === false ? 1 : 0,
    image: u?.image || u?.profile_pic || "",
  };
}

function PencilIcon() {
  return (
    <svg id="edit" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20">
      <rect width="17.5" height="1.25" transform="translate(1.25 16.25)" fill="#131416" />
      <path d="M17.375,6.375a1.208,1.208,0,0,0,0-1.75h0l-2.25-2.25a1.208,1.208,0,0,0-1.75,0h0L4,11.75v4H8ZM14.25,3.25,16.5,5.5,14.625,7.375l-2.25-2.25Zm-9,11.25V12.25L11.5,6l2.25,2.25L7.5,14.5Z" transform="translate(-1.5 -0.75)" fill="#131416" />
    </svg>
  );
}

function EditOverlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}
function CheckIcon({ onClick }) {
  return (
    <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" className={styles.clickable}>
      <circle cx="10" cy="10" r="8.5" fill="#16A2B9" />
      <path d="M8.8 12.55 6.45 10.2l-.9.9 3.25 3.25 5.65-5.65-.9-.89-4.75 4.74Z" fill="#FFFFFF" />
    </svg>
  );
}

function EyeIcon({ slashed }) {
  return (
    <svg id="view" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <path id="Path_37858" data-name="Path 37858" d="M19.713,11.662A10.431,10.431,0,0,0,10.375,5a10.431,10.431,0,0,0-9.338,6.662.625.625,0,0,0,0,.425,10.431,10.431,0,0,0,9.337,6.662,10.431,10.431,0,0,0,9.338-6.662A.625.625,0,0,0,19.713,11.662ZM10.375,17.5a9.281,9.281,0,0,1-8.081-5.625A9.281,9.281,0,0,1,10.375,6.25a9.281,9.281,0,0,1,8.081,5.625A9.281,9.281,0,0,1,10.375,17.5Z" transform="translate(-0.375 -1.875)" fill="#131416" />
      <path id="Path_37859" data-name="Path 37859" d="M13.75,10a3.75,3.75,0,1,0,3.75,3.75A3.75,3.75,0,0,0,13.75,10Zm0,6.25a2.5,2.5,0,1,1,2.5-2.5A2.5,2.5,0,0,1,13.75,16.25Z" transform="translate(-3.75 -3.75)" fill="#131416" />
      {slashed && (
        <line x1="4" y1="16" x2="16" y2="4" stroke="#131416" strokeWidth="1.8" strokeLinecap="round" />
      )}
      <rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" width="20" height="20" fill="none" />
    </svg>
  );
}
function RemoveIcon({ onClick }) {  return (
    <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" className={styles.clickable}>
      <circle cx="10" cy="10" r="8.5" stroke="#131416" strokeWidth="1.5" fill="none" />
      <path d="M7.17 7.18 12.83 12.84M12.83 7.18 7.17 12.84" stroke="#131416" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function InlineField({ name, label, value, placeholder, type = "text", disabled, isSelect, options, onChange }) {
  const displayVal = value == null ? "" : String(value);

  const handleInputChange = (e) => {
    if (disabled || !onChange) return;
    onChange(name, e.target.value);
  };
  const handleSelectChange = (e) => {
    if (disabled || !onChange) return;
    onChange(name, e.target.value);
  };

  return (
    <div className={`form-group form-floating ${styles.relGroup}`}>
      {isSelect ? (
        <>
          <select
            className="form-control outsideInputField"
            name={name}
            value={displayVal}
            disabled={disabled}
            onChange={handleSelectChange}
          >
            {options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <label>{label}</label>
          <div className="input-group-btn" />
          {!disabled && <div className={styles.beforeEdit}><PencilIcon /></div>}
        </>
      ) : (
        <>
          <input
            className="form-control outsideInputField"
            type={type}
            name={name}
            placeholder={placeholder}
            value={displayVal}
            disabled={disabled}
            readOnly={disabled}
            onChange={handleInputChange}
          />
          <label>{label}</label>
          <div className="input-group-btn" />
          {!disabled && <div className={styles.beforeEdit}><PencilIcon /></div>}
        </>
      )}
    </div>
  );
}

export function UserList() {
  const [users, setUsers] = useState([]);
  const [apiRoles, setApiRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState("all");
  const [activeIdx, setActiveIdx] = useState(0);
  const toastSuccess = useToastStore((s) => s.success);
  const toastError = useToastStore((s) => s.error);
  const toastInfo = useToastStore((s) => s.info);
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [transferTo, setTransferTo] = useState("");
  const [addForm, setAddForm] = useState({ first_name: "", last_name: "", email: "", mobile_number: "", password: "", confirm_password: "", select_role: "" });
  const [addErrors, setAddErrors] = useState({});
  const [addSaving, setAddSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showAddPw, setShowAddPw] = useState(false);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showDetailPw, setShowDetailPw] = useState(false);
  const [draft, setDraft] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  const [detailPassword, setDetailPassword] = useState("");
  const [detailConfirmPassword, setDetailConfirmPassword] = useState("");
  const [showDetailConfirmPw, setShowDetailConfirmPw] = useState(false);
  const [detailPhotoFile, setDetailPhotoFile] = useState(null);
  const [detailPhotoPreview, setDetailPhotoPreview] = useState(null);

  const queryClient = useQueryClient();
  const {
    data: usersData,
    isLoading: listLoading,
    isError: listFailed,
    error: listQueryError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: ({ signal }) => usersApi.getUsers({}, { signal }),
    staleTime: 30_000,
  });
  const listError = listFailed ? (listQueryError?.message || "Failed to load users.") : null;

  const firstLoadRef = useRef(true);
  useEffect(() => {
    if (!usersData) return;
    const { users: list, roles: roleList } = usersData;
    setUsers((Array.isArray(list) ? list : []).map(mapApiUser));
    if (Array.isArray(roleList) && roleList.length > 0) {
      setApiRoles(
        roleList.map((r, i) =>
          typeof r === "string"
            ? { id: r, role: r, slug: r }
            : { id: r._id || r.id || r.name || `role-${i}`, role: r.name || r.role || "-", slug: r.slug || r.name || r.role || "-" }
        )
      );
    }
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      setActiveIdx(0);
    }
  }, [usersData]);

  const roles = apiRoles.length > 0
    ? apiRoles
    : STATIC_ROLES.map((r) => ({ id: r, role: r, slug: r }));

  const roleCounts = useMemo(() => {
    const counts = {};
    roles.forEach((r) => { counts[r.role.toLowerCase()] = 0; });
    users.forEach((u) => {
      const k = u.role.toLowerCase();
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [users, roles]);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase().trim();
    return users.filter((u) => {
      const roleMatch = activeRole === "all" || u.role.toLowerCase() === activeRole;
      if (!roleMatch) return false;
      if (!term) return true;
      const hay = `${u.username} ${u.role} ${u.email}`.toLowerCase();
      return hay.includes(term);
    });
  }, [users, search, activeRole]);

  const safeIdx = Math.min(activeIdx, Math.max(filteredUsers.length - 1, 0));
  const activeUser = filteredUsers[safeIdx] || null;

  useEffect(() => {
    if (!activeUser) {
      setDraft(null);
      return;
    }
    setDraft({ ...activeUser });
    setDetailPassword("");
    setDetailConfirmPassword("");
    if (detailPhotoPreview) URL.revokeObjectURL(detailPhotoPreview);
    setDetailPhotoFile(null);
    setDetailPhotoPreview(null);
  }, [activeUser?.id]);

  const updateDraftField = useCallback((field, val) => {
    setDraft((prev) => (prev ? { ...prev, [field]: val } : prev));
  }, []);

  const DRAFT_FIELDS = ["first_name", "last_name", "mobile_no", "role_id", "address", "other_address", "city", "state", "country", "zipcode"];
  const isDirty = useMemo(() => {
    if (!activeUser || !draft) return false;
    if (detailPassword.trim() !== "" || detailPhotoFile) return true;
    return DRAFT_FIELDS.some((f) => String(draft[f] ?? "") !== String(activeUser[f] ?? ""));
  }, [activeUser, draft, detailPassword, detailPhotoFile]);

  const passwordError = useMemo(
    () => validatePasswordPair(detailPassword, detailConfirmPassword),
    [detailPassword, detailConfirmPassword]
  );
  // Leads-style mobile rule (10-digit US): applies only when the number was
  // actually changed, so old stored values never block unrelated saves.
  const mobileError = useMemo(() => {
    if (!activeUser || !draft) return null;
    const original = String(activeUser.mobile_no ?? "").trim();
    const next = String(draft.mobile_no ?? "").trim();
    if (next === original || next === "") return null;
    return isValidUSPhone(next) ? null : "Enter a valid 10-digit Mobile No.";
  }, [activeUser, draft]);
  const canSave = isDirty && !passwordError && !mobileError && !savingAll;

  const getAvatarClass = (u) => {
    const origIdx = users.findIndex((x) => x.id === u.id);
    const key = AVATAR_COLORS[(origIdx >= 0 ? origIdx : 0) % AVATAR_COLORS.length];
    return styles[key] || "";
  };

  async function pushUserUpdate(userId, fields, photoFile) {
    if (!userId) return false;
    const fd = new FormData();
    fd.append("userId", userId);
    Object.entries(fields || {}).forEach(([k, v]) => {
      if (k === "roleId") return; 
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    if (photoFile) fd.append("image", photoFile);
    try {
      await usersApi.updateUser(fd);
      setUsers((prev) =>
        prev.map((u) => {
          if (String(u.id) !== String(userId)) return u;
          const next = { ...u };
          if (fields.firstName !== undefined) next.first_name = fields.firstName;
          if (fields.lastName !== undefined) next.last_name = fields.lastName;
          if (fields.firstName !== undefined || fields.lastName !== undefined) {
            next.username = `${fields.firstName ?? next.first_name} ${fields.lastName ?? next.last_name}`.trim();
          }
          if (fields.phone !== undefined) next.mobile_no = fields.phone;
          if (fields.role !== undefined) {
            next.role = fields.role;
            next.role_id = fields.roleId ?? fields.role;
          }
          if (fields.address !== undefined) {
            try {
              const parsed = JSON.parse(fields.address);
              const emptyToDash = (v) => (v && String(v).trim() !== "" ? v : "-");
              next.address = emptyToDash(parsed.addressLine1);
              next.other_address = emptyToDash(parsed.addressLine2);
              next.city = emptyToDash(parsed.city);
              next.country = emptyToDash(parsed.country);
              next.zipcode = emptyToDash(parsed.zipCode);
              next.state = emptyToDash(parsed.state);
            } catch { /* keep old address on parse failure */ }
          }
          return next;
        })
      );
      return true;
    } catch (err) {
      toastError(err?.message || "Failed to update user.");
      return false;
    }
  }

  const handleSaveAll = async () => {
    if (!activeUser || !draft || savingAll) return;
    if (passwordError) {
      toastError(passwordError);
      return;
    }
    if (mobileError) {
      toastError(mobileError);
      return;
    }
    const norm = (v) => String(v ?? "").trim();
    const fields = {};
    if (norm(draft.first_name) !== norm(activeUser.first_name)) fields.firstName = norm(draft.first_name);
    if (norm(draft.last_name) !== norm(activeUser.last_name)) fields.lastName = norm(draft.last_name);
    if (norm(draft.mobile_no) !== norm(activeUser.mobile_no)) fields.phone = norm(draft.mobile_no);
    if (String(draft.role_id ?? "") !== String(activeUser.role_id ?? "")) {
      const r = roles.find((x) => String(x.id) === String(draft.role_id));
      fields.role = r ? r.role : norm(draft.role_id);
      fields.roleId = String(draft.role_id);
    }
    const addressChanged = ADDRESS_FIELDS.some((f) => norm(draft[f]) !== norm(activeUser[f]));
    if (addressChanged) fields.address = addressJsonOf(draft);
    const nextPassword = detailPassword.trim();
    if (nextPassword !== "") fields.password = nextPassword;
    if (Object.keys(fields).length === 0 && !detailPhotoFile) {
      toastInfo("No changes to save.");
      return;
    }
    setSavingAll(true);
    const ok = await pushUserUpdate(activeUser.id, fields, detailPhotoFile || undefined);
    setSavingAll(false);
    if (!ok) return;
    setDetailPassword("");
    setDetailConfirmPassword("");
    if (detailPhotoFile && detailPhotoPreview) {
      const kept = detailPhotoPreview;
      setUsers((prev) =>
        prev.map((u) => (String(u.id) === String(activeUser.id) ? { ...u, image: kept } : u))
      );
      setDetailPhotoFile(null);
      setDetailPhotoPreview(null);
    } else {
      setDetailPhotoFile(null);
    }
    toastSuccess("User info updated Successfully!");
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"];

  function handleDetailPhotoFile(file) {
    if (!file) return;
    const ext = String(file.name?.split(".").pop() || "").toLowerCase();
    const looksImage =
      (file.type && file.type.startsWith("image/")) || IMAGE_EXTS.includes(ext);
    if (!looksImage) {
      toastError("Only image files (JPG, PNG, WEBP, SVG) are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastError("File size too large. Maximum allowed size is 5MB.");
      return;
    }
    if (detailPhotoPreview) URL.revokeObjectURL(detailPhotoPreview);
    setDetailPhotoFile(file);
    setDetailPhotoPreview(URL.createObjectURL(file));
  }

  const handleDeleteConfirm = () => {
    if (!transferTo) {
      toastError("Please select a user to transfer data to.");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== showDelete.id));
    toastSuccess(`User "${showDelete?.username}" deleted — data transferred.`);
    setShowDelete(null);
    setTransferTo("");
    setActiveIdx(0);
  };

  function handlePhotoSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastError("Only image files (JPG, PNG, WEBP, SVG) are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastError("File size too large. Maximum allowed size is 5MB.");
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function resetAddForm() {
    setAddForm({ first_name: "", last_name: "", email: "", mobile_number: "", password: "", confirm_password: "", select_role: "" });
    setAddErrors({});
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  // Lead-form style field updater: US-formats the mobile number and clears
  // that field's error as soon as the user types (same as LeadForm).
  const updateAddField = (field, value) => {
    const next = field === "mobile_number" ? formatUSPhoneNumber(value) : value;
    setAddForm((prev) => ({ ...prev, [field]: next }));
    setAddErrors((prev) => {
      if (!prev[field]) return prev;
      const rest = { ...prev };
      delete rest[field];
      return rest;
    });
  };

  // Same rules/messages as validateLeadForm + the user detail panel:
  // required names, valid email, 10-digit US mobile, password pair, role.
  const validateAddForm = (form) => {
    const errors = {};
    const v = (key) => String(form[key] ?? "").trim();
    if (!isRequired(v("first_name"))) errors.first_name = "First Name is required.";
    if (!isRequired(v("last_name"))) errors.last_name = "Last Name is required.";
    if (!isRequired(v("email"))) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(v("email"))) {
      errors.email = "Enter a valid Email.";
    }
    if (!isRequired(v("mobile_number"))) {
      errors.mobile_number = "Mobile No. is required.";
    } else if (!isValidUSPhone(v("mobile_number"))) {
      errors.mobile_number = "Enter a valid 10-digit Mobile No.";
    }
    if (!isRequired(form.password)) {
      errors.password = "Password is required.";
    } else {
      const pairError = validatePasswordPair(form.password, form.confirm_password);
      if (pairError) errors.confirm_password = pairError;
    }
    if (!isRequired(v("select_role"))) errors.select_role = "Please select a Role.";
    return errors;
  };

  const addFieldClass = (field, extra = "") =>
    `form-control ${styles.whiteField}${extra ? ` ${extra}` : ""}${addErrors[field] ? ` ${styles.whiteFieldInvalid}` : ""}`;

  const lbl = (value) => (value ? styles.labelUp : styles.labelDown);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const {
      first_name, last_name, email, mobile_number, password, confirm_password,
      select_role,
    } = addForm;

    const errors = validateAddForm(addForm);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toastError("Please fix the highlighted fields.");
      return;
    }

    if (!getToken()) {
      toastError("Please sign in to create users.");
      return;
    }

    const emailId = email.trim();
    const payload = new FormData();
    payload.append("email", emailId);
    payload.append("password", password);
    payload.append("firstName", first_name.trim());
    payload.append("lastName", last_name.trim());
    payload.append("phone", mobile_number.trim());
    payload.append("role", select_role);
    payload.append("userName", emailId.split("@")[0] || "");
    payload.append(
      "address",
      JSON.stringify({
        addressLine1: "",
        addressLine2: "",
        city: "",
        country: "",
        zipCode: "",
        state: "",
      })
    );
    if (photoFile) payload.append("image", photoFile);

    setAddSaving(true);
    try {
      const created = await usersApi.createUser(payload);
      const createdUser = created || {};
      const displayName = `${first_name.trim()} ${last_name.trim()}`.trim();
      const newUser = {
        id: createdUser._id || createdUser.id || Date.now(),
        username: displayName,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim(),
        mobile_no: mobile_number.trim(),
        role: select_role,
        role_id: select_role,
        address: "", other_address: "",
        city: "", state: "", zipcode: "", country: "",
        status: 0,
      };
      setUsers((prev) => [newUser, ...prev]);
      toastSuccess(`User "${displayName}" created`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowAdd(false);
      resetAddForm();
    } catch (err) {
      toastError(err?.message || "Failed to create user.");
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className={`prtm-content-wrapper common_search_html new_lead_data loaded-block userlist_page ${styles.usersShell}`}>
      <div className={`filter-div ${styles.userlist_page_left}`}>
        <div className={`${styles.userlist_custom_panel} sticky-top`}>
          <div className={styles.userlist_top}>
            <div className={styles.userlist_topbar}>
              <div className={styles.userlist_search_wrap}>
                <span className={styles.userlist_search_icon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M8.75 2.5C12.2018 2.5 15 5.29822 15 8.75C15 10.1732 14.5242 11.4852 13.7227 12.5361L17.8662 16.6797L16.6797 17.8662L12.5361 13.7227C11.4852 14.5242 10.1732 15 8.75 15C5.29822 15 2.5 12.2018 2.5 8.75C2.5 5.29822 5.29822 2.5 8.75 2.5ZM8.75 4.16667C6.21869 4.16667 4.16667 6.21869 4.16667 8.75C4.16667 11.2813 6.21869 13.3333 8.75 13.3333C11.2813 13.3333 13.3333 11.2813 13.3333 8.75C13.3333 6.21869 11.2813 4.16667 8.75 4.16667Z" fill="#8A8A93" />
                  </svg>
                </span>
                <input type="text" className={styles.userlist_search_input} placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button type="button" className={styles.userlist_add_btn} title="Add User" onClick={() => { setAddErrors({}); setShowAdd(true); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4.16663V15.8333" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M4.16663 10H15.8333" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className={styles.userlist_filter_chips} id="userRoleFilters">
              <button type="button" className={`${styles.user_chip} ${activeRole === "all" ? styles.active : ""}`} onClick={() => setActiveRole("all")}>All</button>
              {roles.map((r) => {
                const key = r.role.toLowerCase();
                const cnt = roleCounts[key] || 0;
                return (
                  <button key={r.id} type="button" className={`${styles.user_chip} ${activeRole === key ? styles.active : ""}`} onClick={() => setActiveRole(key)}>
                    {(r.slug || r.role).toUpperCase()} <span>{cnt}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <ul className={`nav ${styles.user_design_list}`} id="userListNav">
            {listLoading ? (
              <li className={styles.user_design_empty}>Loading users...</li>
            ) : listError ? (
              <li className={styles.user_design_empty}>
                <span>{listError}</span>
                <button type="button" className={styles.linkBtn} onClick={() => refetchUsers()}>Retry</button>
              </li>
            ) : filteredUsers.length === 0 ? (
              <li className={styles.user_design_empty}>Data not found!</li>
            ) : (
              filteredUsers.map((u, idx) => {
                const isActive = idx === safeIdx;
                return (
                  <li key={u.id} className={`${styles.user_design_item} ${isActive ? styles.active : ""}`}>
                    <button type="button" className={styles.user_design_link} onClick={() => setActiveIdx(idx)} aria-expanded={isActive}>
                      <span className={`${styles.user_design_avatar} ${getAvatarClass(u)}`}>
                        {getInitials(u.username)}
                        <span className={styles.user_online_dot} />
                      </span>
                      <span className={styles.user_design_info}>
                        <span className={styles.user_design_name}>{u.username}</span>
                        <span className={styles.user_design_role}>{u.role}</span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>

      <div className={`prtm-content cmn-div-block view_pagelead ${styles.userlist_page_right}`}>
        <div className={`tab-content new_form_design ${styles.sticky_class}`}>
          {activeUser ? (
            <div className="tab-pane fade in active">
              <input type="hidden" name="user_id" value={activeUser.id} />
              <div className={styles["tab-pane_comn"]}>
                <div className={styles.user_profile_design}>
                  <div className={styles.user_profile_design_left}>
                    <AvatarUpload
                      src={detailPhotoPreview || resolveUserImage(activeUser.image)}
                      alt={activeUser.username}
                      title="Change profile photo"
                      fallback={getInitials(activeUser.username)}
                      className={styles.user_profile_avatar_box}
                      overlayIcon={<EditOverlayIcon />}
                      overlay="badge"
                      onSelect={handleDetailPhotoFile}
                    >
                      <span className={styles.user_profile_online_dot} />
                    </AvatarUpload>
                    <div className={styles.user_profile_design_content}>
                      <div className={styles.user_profile_name_row}>
                        <h4 className={styles.user_profile_name_text}>{activeUser.username}</h4>
                        <span className={styles.user_profile_role_badge}>{activeUser.role}</span>
                      </div>
                      <div className={styles.user_profile_meta_row}>
                        <a href={`mailto:${activeUser.email}`} className={styles.user_profile_meta_item}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="none">
                            <path d="M17.5 3.75H2.5C2.16848 3.75 1.85054 3.8817 1.61612 4.11612C1.3817 4.35054 1.25 4.66848 1.25 5V15C1.25 15.3315 1.3817 15.6495 1.61612 15.8839C1.85054 16.1183 2.16848 16.25 2.5 16.25H17.5C17.8315 16.25 18.1495 16.1183 18.3839 15.8839C18.6183 15.6495 18.75 15.3315 18.75 15V5C18.75 4.66848 18.6183 4.35054 18.3839 4.11612C18.1495 3.8817 17.8315 3.75 17.5 3.75ZM16.125 5L10 9.2375L3.875 5H16.125ZM2.5 15V5.56875L9.64375 10.5125C9.74837 10.5851 9.87267 10.624 10 10.624C10.1273 10.624 10.2516 10.5851 10.3562 10.5125L17.5 5.56875V15H2.5Z" fill="#9A9AA3" />
                          </svg>
                          <span>{activeUser.email}</span>
                        </a>
                        <a href={`tel:${activeUser.mobile_no}`} className={styles.user_profile_meta_item}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.1437 18.125H16.2499C16.7472 18.125 17.2241 17.9275 17.5757 17.5758C17.9274 17.2242 18.1249 16.7473 18.1249 16.25V12.95C18.1267 12.7018 18.0545 12.4587 17.9176 12.2517C17.7807 12.0446 17.5852 11.8831 17.3562 11.7875L14.9999 10.8438C14.7737 10.7486 14.5244 10.7221 14.2832 10.7677C14.042 10.8133 13.8196 10.9288 13.6437 11.1L12.2874 12.4438C11.1059 12.2335 10.0176 11.665 9.17011 10.8153C8.32264 9.96562 7.75701 8.87583 7.5499 7.69375L8.88115 6.35C9.05422 6.17667 9.17254 5.95632 9.22143 5.71631C9.27032 5.4763 9.24762 5.22722 9.15615 5L8.20615 2.6625C8.11353 2.42992 7.95319 2.23051 7.74592 2.0901C7.53866 1.94969 7.294 1.87476 7.04365 1.875H3.7499C3.6999 1.875 3.65015 1.87683 3.60065 1.8805C3.35515 1.89938 3.11576 1.96642 2.89617 2.07781C2.67657 2.18921 2.48107 2.34276 2.32082 2.52971C2.16057 2.71665 2.03871 2.93334 1.9622 3.16738C1.88569 3.40142 1.85602 3.64824 1.8749 3.89375C2.11865 7.05625 3.8624 17.4188 16.1437 18.125ZM3.51057 3.17181C3.5865 3.14064 3.66783 3.12474 3.7499 3.125H7.0499L7.9874 5.48125L6.2124 7.275L6.2499 7.575C6.2499 7.63125 6.9874 13.0688 12.4249 13.75L12.7249 13.7875L14.5187 12.0063L16.8749 12.95V16.25C16.8749 16.2629 16.8745 16.2758 16.8738 16.2886C16.8689 16.3706 16.8478 16.4507 16.8119 16.5245C16.776 16.5983 16.7259 16.6643 16.6645 16.7188C16.6031 16.7732 16.5316 16.8151 16.454 16.8419C16.3764 16.8687 16.2943 16.8799 16.2124 16.875C5.25615 16.25 3.4124 7.5 3.1249 3.8C3.12357 3.78271 3.1229 3.76538 3.1229 3.748C3.12317 3.66592 3.13959 3.5847 3.17124 3.50898C3.2029 3.43325 3.24915 3.3645 3.30738 3.30664C3.3656 3.24879 3.43465 3.20298 3.51057 3.17181ZM17.4999 8.125H16.2499C16.2486 6.96507 15.7873 5.85303 14.9671 5.03283C14.1469 4.21264 13.0348 3.75129 11.8749 3.75V2.5C13.3662 2.50165 14.796 3.09482 15.8505 4.14935C16.9051 5.20389 17.4982 6.63367 17.4999 8.125ZM14.9999 8.125H13.7499C13.7494 7.62789 13.5516 7.15129 13.2001 6.79978C12.8486 6.44827 12.372 6.25055 11.8749 6.25V5C13.0348 5.00165 14.1469 5.463 14.9671 6.2832C15.7873 7.10339 16.2486 8.21544 16.2499 9.375H14.9999V8.125Z" fill="#9A9AA3" />
                          </svg>
                          <span>{activeUser.mobile_no}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className={styles.user_profile_design_right}>
                    <SaveButton
                      onClick={handleSaveAll}
                      disabled={!canSave}
                      saving={savingAll}
                      title="Save user info"
                    />
                    <button type="button" className={styles.user_profile_delete_btn} onClick={() => setShowDelete(activeUser)} title="Delete User">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none">
                        <path d="M13.5 3.375H12.375V14.625C12.375 14.9234 12.2569 15.2099 12.0459 15.4209C11.8349 15.6319 11.5484 15.75 11.25 15.75H2.25C1.95163 15.75 1.66508 15.6319 1.4541 15.4209C1.24312 15.2099 1.125 14.9234 1.125 14.625V3.375H0V2.25H13.5V3.375ZM2.25 14.625H11.25V3.375H2.25V14.625ZM5.625 12.375H4.5V5.625H5.625V12.375ZM9 12.375H7.875V5.625H9V12.375ZM9 0V1.125H4.5V0H9Z" fill="white" fillOpacity="0.9" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles.user_basic_info}>
                  <div className="card-header position_relative">
                    <h4 className="mb-0 text-white head-lead">Personal Information</h4>
                  </div>
                  <div className={`${styles["lead-detail-cmn"]} lead_click_info1`}>
                    <div className="gridRowTight">
                      <div className="gridCol6">
                        <InlineField key={`${activeUser.id}-first_name`} name="first_name" label="First Name" value={draft?.first_name ?? ""} placeholder="First Name*" onChange={updateDraftField} userId={activeUser.id} />
                      </div>
                      <div className="gridCol6">
                        <InlineField key={`${activeUser.id}-last_name`} name="last_name" label="Last Name" value={draft?.last_name ?? ""} placeholder="Last Name*" onChange={updateDraftField} userId={activeUser.id} />
                      </div>
                      <div className="gridCol6">
                        <InlineField key={`${activeUser.id}-mobile_no`} name="mobile_no" label="Mobile No" value={draft?.mobile_no ?? ""} placeholder="Mobile No*" type="text" onChange={updateDraftField} userId={activeUser.id} />
                        {mobileError && <FieldError message={mobileError} />}
                      </div>
                      <div className="gridCol6">
                        <InlineField key={`${activeUser.id}-email`} name="email" label="Email" value={activeUser.email} placeholder="Email *" disabled onChange={updateDraftField} userId={activeUser.id} />
                      </div>
                      <div className="gridCol6">
                        <InlineField
                          key={`${activeUser.id}-role`}
                          name="role_id"
                          label="Select Role"
                          value={String(draft?.role_id ?? activeUser.role_id)}
                          isSelect
                          options={roles.map((r) => ({ value: String(r.id), label: r.role }))}
                          onChange={updateDraftField}
                          userId={activeUser.id}
                        />
                      </div>
                      <div className="gridCol6">
                        <InlineField key={`${activeUser.id}-username`} name="username" label="Username" value={activeUser.username} placeholder="Username*" disabled onChange={updateDraftField} userId={activeUser.id} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.user_basic_info}>
                  <div className="card-header position_relative">
                    <h4 className="mb-0 text-white head-lead">Address Details</h4>
                  </div>
                  <div className={`${styles["lead-detail-cmn"]} lead_click_info1`}>
                    <div className="gridRowTight">
                      <div className="gridCol6"><InlineField key={`${activeUser.id}-address`} name="address" label="Address Line 1" value={draft?.address ?? ""} placeholder="Address Line 1" onChange={updateDraftField} userId={activeUser.id} /></div>
                      <div className="gridCol6"><InlineField key={`${activeUser.id}-other_address`} name="other_address" label="Address Line 2" value={draft?.other_address ?? ""} placeholder="Address Line 2" onChange={updateDraftField} userId={activeUser.id} /></div>
                      <div className="gridCol6"><InlineField key={`${activeUser.id}-city`} name="city" label="City" value={draft?.city ?? ""} placeholder="City" onChange={updateDraftField} userId={activeUser.id} /></div>
                      <div className="gridCol6"><InlineField key={`${activeUser.id}-state`} name="state" label="State" value={draft?.state ?? ""} placeholder="FL" onChange={updateDraftField} userId={activeUser.id} /></div>
                      <div className="gridCol6"><InlineField key={`${activeUser.id}-country`} name="country" label="Country" value={draft?.country ?? ""} placeholder="USA" onChange={updateDraftField} userId={activeUser.id} /></div>
                      <div className="gridCol6"><InlineField key={`${activeUser.id}-zipcode`} name="zipcode" label="Zipcode" value={draft?.zipcode ?? ""} placeholder="Zipcode" type="text" onChange={updateDraftField} userId={activeUser.id} /></div>
                    </div>
                  </div>
                </div>

                <div className={styles.user_basic_info}>
                  <div className="card-header position_relative">
                    <h4 className="mb-0 text-white head-lead">Security</h4>
                  </div>
                  <div className={`${styles["lead-detail-cmn"]} lead_click_info1`}>
                    <div className="gridRowTight">
                      <div className="gridCol6">
                        <div className="form-group form-floating">
                          <input
                            className={`form-control outsideInputField ${styles.pwWithToggle}`}
                            type={showDetailPw ? "text" : "password"}
                            name="detail_password"
                            placeholder="New Password"
                            value={detailPassword}
                            onChange={(e) => setDetailPassword(e.target.value)}
                            autoComplete="new-password"
                          />
                          <label>New Password</label>
                          <div className="input-group-btn" />
                          <span
                            className={`${styles["user-password-toggle"]} ${styles.detailPwToggle}`}
                            onClick={() => setShowDetailPw((v) => !v)}
                            title={showDetailPw ? "Hide password" : "Show password"}
                          >
                            <EyeIcon slashed={showDetailPw} />
                          </span>
                        </div>
                      </div>
                      <div className="gridCol6">
                        <div className="form-group form-floating">
                          <input
                            className={`form-control outsideInputField ${styles.pwWithToggle}`}
                            type={showDetailConfirmPw ? "text" : "password"}
                            name="detail_confirm_password"
                            placeholder="Confirm Password"
                            value={detailConfirmPassword}
                            onChange={(e) => setDetailConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                          />
                          <label>Confirm Password</label>
                          <div className="input-group-btn" />
                          <span
                            className={`${styles["user-password-toggle"]} ${styles.detailPwToggle}`}
                            onClick={() => setShowDetailConfirmPw((v) => !v)}
                            title={showDetailConfirmPw ? "Hide password" : "Show password"}
                          >
                            <EyeIcon slashed={showDetailConfirmPw} />
                          </span>
                        </div>
                      </div>
                      {(detailPassword !== "" || detailConfirmPassword !== "") && (
                        <div className="gridCol12">
                          <FieldError message={passwordError} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`text-center ${styles.listEmpty}`}>No users found.</div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className={styles.modalOverlay} onClick={() => setShowAdd(false)}>
          <div className={`${styles.modalBox} ${styles.modalBoxLarge} ${styles.modalAnchor}`} onClick={(e) => e.stopPropagation()}>
          
            <div className={styles.modalBody}>
              <form onSubmit={handleAddSubmit} name="add_user" encType="multipart/form-data">
                <div className={styles.share_lead_head}>
                  <div className={styles.round_shap}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M12 4C12.9889 4 13.9556 4.29324 14.7779 4.84265C15.6001 5.39206 16.241 6.17295 16.6194 7.08658C16.9978 8.00021 17.0969 9.00555 16.9039 9.97545C16.711 10.9454 16.2348 11.8363 15.5355 12.5355C14.8363 13.2348 13.9454 13.711 12.9755 13.9039C12.0056 14.0969 11.0002 13.9978 10.0866 13.6194C9.17296 13.241 8.39206 12.6001 7.84266 11.7779C7.29325 10.9556 7 9.98891 7 9C7 7.67392 7.52679 6.40215 8.46447 5.46447C9.40215 4.52678 10.6739 4 12 4ZM12 2C10.6155 2 9.26216 2.41054 8.11101 3.17971C6.95987 3.94888 6.06266 5.04213 5.53285 6.32122C5.00303 7.6003 4.86441 9.00776 5.13451 10.3656C5.4046 11.7235 6.07129 12.9708 7.05026 13.9497C8.02922 14.9287 9.2765 15.5954 10.6344 15.8655C11.9922 16.1356 13.3997 15.997 14.6788 15.4672C15.9579 14.9373 17.0511 14.0401 17.8203 12.889C18.5895 11.7378 19 10.3845 19 9C19 7.14348 18.2625 5.36301 16.9498 4.05025C15.637 2.7375 13.8565 2 12 2ZM32 14H28V10H26V14H22V16H26V20H28V16H32V14ZM20 30H22V25C22 23.1435 21.2625 21.363 19.9497 20.0503C18.637 18.7375 16.8565 18 15 18H9C7.14348 18 5.36301 18.7375 4.05025 20.0503C2.7375 21.363 2 23.1435 2 25V30H4V25C4 23.6739 4.52678 22.4021 5.46447 21.4645C6.40215 20.5268 7.67392 20 9 20H15C16.3261 20 17.5979 20.5268 18.5355 21.4645C19.4732 22.4021 20 23.6739 20 25V30Z" fill="#12182B" /></svg>
                  </div>
                  <h2>Add User</h2><p>Select the lead owner you want to share this lead with</p>
                </div>
                <div className={`${styles["lead-detail-cmn"]} ${styles.modalFlatForm}`}>
                  <div className="gridRowTight">
                    <div className="gridCol6"><div className="form-group form-floating"><input className={addFieldClass("first_name")} type="text" placeholder=" " value={addForm.first_name} onChange={(e) => updateAddField("first_name", e.target.value)} /><label className={lbl(addForm.first_name)}>First Name*</label></div>{addErrors.first_name && <FieldError message={addErrors.first_name} />}</div>
                    <div className="gridCol6"><div className="form-group form-floating"><input className={addFieldClass("last_name")} type="text" placeholder=" " value={addForm.last_name} onChange={(e) => updateAddField("last_name", e.target.value)} /><label className={lbl(addForm.last_name)}>Last Name*</label></div>{addErrors.last_name && <FieldError message={addErrors.last_name} />}</div>
                    <div className="gridCol6"><div className="form-group form-floating"><input className={addFieldClass("email")} type="email" placeholder=" " value={addForm.email} onChange={(e) => updateAddField("email", e.target.value)} /><label className={lbl(addForm.email)}>Email*</label></div>{addErrors.email && <FieldError message={addErrors.email} />}</div>
                    <div className="gridCol6"><div className="form-group form-floating"><input className={addFieldClass("mobile_number")} type="tel" placeholder=" " value={addForm.mobile_number} onChange={(e) => updateAddField("mobile_number", e.target.value)} maxLength={18} /><label className={lbl(addForm.mobile_number)}>Mobile No*</label></div>{addErrors.mobile_number && <FieldError message={addErrors.mobile_number} />}</div>
                    <div className={`gridCol6`}><div className={`form-group form-floating ${styles.relGroup}`}><input className={addFieldClass("password", `${styles.whiteFieldPad}`)} type={showAddPw ? "text" : "password"} placeholder=" " value={addForm.password} onChange={(e) => updateAddField("password", e.target.value)} autoComplete="new-password" /><label className={lbl(addForm.password)}>Password*</label><span className={`${styles["user-password-toggle"]} ${styles.toggleTop}`} onClick={() => setShowAddPw(!showAddPw)}><EyeIcon slashed={showAddPw} /></span></div>{addErrors.password && <FieldError message={addErrors.password} />}</div>
                    <div className={`gridCol6`}><div className={`form-group form-floating ${styles.relGroup}`}><input className={addFieldClass("confirm_password", `${styles.whiteFieldPad}`)} type={showAddConfirm ? "text" : "password"} placeholder=" " value={addForm.confirm_password} onChange={(e) => updateAddField("confirm_password", e.target.value)} autoComplete="new-password" /><label className={lbl(addForm.confirm_password)}>Confirm Password*</label><span className={`${styles["user-password-toggle"]} ${styles.toggleTop}`} onClick={() => setShowAddConfirm(!showAddConfirm)}><EyeIcon slashed={showAddConfirm} /></span></div>{addErrors.confirm_password && <FieldError message={addErrors.confirm_password} />}</div>
                    <div className="gridCol6"><div className="form-group form-floating"><select className={addFieldClass("select_role")} value={addForm.select_role} onChange={(e) => updateAddField("select_role", e.target.value)}><option value="">Select Role</option>{STATIC_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select><label className={styles.labelUp}>Select Role</label></div>{addErrors.select_role && <FieldError message={addErrors.select_role} />}</div>
                    <div className={`gridCol12`}><div className={`${styles.upload_user} ${styles.uploadLight}`}><div className={`${styles.upload_info} ${styles.uploadInfoDark}`}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M3.75 2.5V5H2.5V2.5C2.5 2.16848 2.6317 1.85054 2.86612 1.61612C3.10054 1.3817 3.41848 1.25 3.75 1.25H16.25C16.5815 1.25 16.8995 1.3817 17.1339 1.61612C17.3683 1.85054 17.5 2.16848 17.5 2.5V5H16.25V2.5H3.75ZM4.63125 12.1313L3.75 11.25L10 5L16.25 11.25L15.3687 12.1313L10.625 7.39375V18.75H9.375V7.39375L4.63125 12.1313Z" fill="#414655" /></svg>Update Profile Photo</div><div className={styles.browse_image}><a href="javascript:;" className="userEditeBtn position-relative"><input type="file" accept="image/*" onChange={handlePhotoSelect} />Browse</a></div></div></div>
                    {photoPreview ? (
                      <div className="gridCol12">
                        <div className={styles.photoPreview}>
                          <img src={photoPreview} alt="Profile preview" />
                        </div>
                      </div>
                    ) : (
                      <div className="gridCol12">
                        <div className={styles.photoPreview}>
                          <img src="/crm/assets/images/default-avatar.png" alt="Default profile photo" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.toolRow}><button type="button" className={`${styles.btnOutline} btn`} onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className={`${styles.btnPrimary} btn`} disabled={addSaving}>{addSaving ? "Saving..." : "Save"}</button></div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showDelete && (
        <div className={styles.modalOverlay} onClick={() => setShowDelete(null)}>
          <div className={`${styles.modalBox} ${styles.deleteModalBox} ${styles.modalAnchor}`} onClick={(e) => e.stopPropagation()}>
           
            <div className={styles.trashWrap}><svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 20 20" fill="none"><rect width="1.25" height="7.5" transform="translate(7.5 7.5)" fill="#131416" /><rect width="1.25" height="7.5" transform="translate(11.25 7.5)" fill="#131416" /><path d="M4,6V7.25H5.25v12.5A1.25,1.25,0,0,0,6.5,21h10a1.25,1.25,0,0,0,1.25-1.25V7.25H19V6ZM6.5,19.75V7.25h10v12.5Z" transform="translate(-1.5 -2.25)" fill="#131416" /><rect width="5" height="1.25" transform="translate(7.5 1.25)" fill="#131416" /></svg></div>
            <h4>Are you sure you want to delete this User?</h4><p>Data must be transferred prior to deleting the user.</p>
            <div className={styles.user_dropdown}><label className={styles.transferLabel}>Transfer data to</label><select value={transferTo} onChange={(e) => setTransferTo(e.target.value)}><option value="">Select Owner</option>{users.filter((u) => u.id !== showDelete.id).map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}</select></div>
            <div className={`${styles.toolRow} ${styles.toolRowSpaced}`}><button type="button" className={`${styles.btnOutline} btn`} onClick={() => setShowDelete(null)}>No</button><button type="button" className={`${styles.btnDanger} btn`} onClick={handleDeleteConfirm}>Yes, Delete</button></div>
            <div className={styles.submitWrap}><button type="button" className={`${styles.btnPrimary} btn ${styles.blockBtn}`} onClick={handleDeleteConfirm}>Submit Transfer & Delete</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
