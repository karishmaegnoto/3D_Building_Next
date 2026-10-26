"use client";

import { Fragment, useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api/leads";
import { FieldError } from "@/components/shared";
import {formatUSPhoneNumber,sanitizeZipCode,validateLeadForm,} from "@/lib/utils/validation";
import { EmailQuoteModal, QuoteShareStrip, SelectQuoteTypeModal, ShareQuoteModal } from "@/components/modules/quotes";
import { ContractsSection } from "@/components/modules/contracts";
import quoteShareStyles from "@/components/modules/quotes/quoteShareStrip.module.scss";
import { quotesApi } from "@/lib/api/quotes";
import { manufacturersApi } from "@/lib/api/manufacturers";
import { usersApi } from "@/lib/api/users";
import { withBasePath } from "@/lib/constants";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import styles from "./addLead.module.scss";

const ADD_SUB_NAV_ITEMS = [
  { id: "lead-details", label: "Lead Details" },
  { id: "address-details", label: "Address Details" },
  { id: "product-details", label: "Product Details" },
  { id: "building-specifications", label: "Building Specifications" },
  { id: "attachments", label: "Attachments" },
];

const EDIT_SUB_NAV_ITEMS = [
  { id: "lead-details", label: "Lead Details" },
  { id: "address-details", label: "Address Details" },
  { id: "product-details", label: "Product Details" },
  { id: "building-specifications", label: "Building Specifications" },
  { id: "color-options", label: "Color Options" },
  { id: "all-quotes", label: "All Quotes" },
  { id: "all-contracts", label: "All Contracts" },
  { id: "invoices", label: "Invoices" },
  { id: "task-activities", label: "Task/Activities" },
  { id: "attachments", label: "Attachments" },
  { id: "all-emails", label: "All Emails" },
  { id: "call-activity", label: "Call Activity" },
];

const PIPELINE_STAGES = ["New Lead", "Quote Sent", "Quoted", "Contract Sent", "Contract Signed", "Customer Won"];

// ── Lead Owner / Assist role filters (fetched from users, nothing else changed) ──
const LEAD_OWNER_ROLES = ["lead owner", "admin"];
const LEAD_OWNER_ASSIST_ROLES = ["lead owner", "lead owner assist"];

function getUserRoleKey(u) {
  const role = typeof u?.role === "object" ? u?.role?.name : u?.role;
  return String(role || "").trim().toLowerCase();
}

function getUserDisplayName(u) {
  const full = [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim();
  const name =
    full ||
    u?.name ||
    u?.userName ||
    u?.username ||
    u?.email ||
    "Unnamed user";
  return String(name).trim().replace(/_/g, " ");
}

function getUserId(u) {
  return String(u?._id || u?.id || "");
}

function getOwnerId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value?._id || value?.id || "");
  }
  return String(value);
}

function CalendarGridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
      <rect x="4" y="4" width="4" height="4" rx="0.5" />
      <rect x="10" y="4" width="4" height="4" rx="0.5" />
      <rect x="16" y="4" width="4" height="4" rx="0.5" />
      <rect x="4" y="10" width="4" height="4" rx="0.5" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" />
      <rect x="16" y="10" width="4" height="4" rx="0.5" />
      <rect x="4" y="16" width="4" height="4" rx="0.5" />
      <rect x="10" y="16" width="4" height="4" rx="0.5" />
      <rect x="16" y="16" width="4" height="4" rx="0.5" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M19.713,11.662A10.431,10.431,0,0,0,10.375,5a10.431,10.431,0,0,0-9.338,6.662.625.625,0,0,0,0,.425,10.431,10.431,0,0,0,9.337,6.662,10.431,10.431,0,0,0,9.338-6.662A.625.625,0,0,0,19.713,11.662ZM10.375,17.5a9.281,9.281,0,0,1-8.081-5.625A9.281,9.281,0,0,1,10.375,6.25a9.281,9.281,0,0,1,8.081,5.625A9.281,9.281,0,0,1,10.375,17.5Z" transform="translate(-0.375 -1.875)" fill="currentColor" />
      <path d="M13.75,10a3.75,3.75,0,1,0,3.75,3.75A3.75,3.75,0,0,0,13.75,10Zm0,6.25a2.5,2.5,0,1,1,2.5-2.5A2.5,2.5,0,0,1,13.75,16.25Z" transform="translate(-3.75 -3.75)" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function CloudUploadIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      <polyline points="12 12 12 16 12 12" />
      <polyline points="9 14 12 11 15 14" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function ChatNotesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="13" y2="13" />
    </svg>
  );
}

function MoreVerticalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function PhoneIcon({ width = 13, height = 13 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.72 11.72 0 0 0 3.68.59 1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1A17.93 17.93 0 0 1 2 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.72 11.72 0 0 0 .59 3.68 1 1 0 0 1-.24 1.02l-2.23 2.09z" />
    </svg>
  );
}

function MailIcon({ width = 15, height = 15 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ContactCardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="7" y1="8" x2="11" y2="8" />
      <line x1="7" y1="12" x2="11" y2="12" />
      <line x1="7" y1="16" x2="9" y2="16" />
      <circle cx="16" cy="10" r="2" />
      <path d="M14 16c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
    </svg>
  );
}

function QuickQuoteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </svg>
  );
}

function QuoteWithLeadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

function ShareQuoteMenuIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="12" cy="5.5" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
      <path d="M8.2 10.8l2.4-3.6M13.8 6.7l2.5 3.5" />
    </svg>
  );
}

function DownloadMenuIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v10m0 0l-4-4m4 4l4-4" />
      <path d="M4.5 19.5h15" />
    </svg>
  );
}

function EmailToLeadMenuIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7.5L12 13l8.5-5.5" />
    </svg>
  );
}

function EditQuoteMenuIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M18.5 12.5a2.121 2.121 0 0 1 3 3L16 21l-3 1 1-3 5.5-6.5z" />
    </svg>
  );
}

function ViewQuoteMenuIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EmptyQuoteDocIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="12" x2="13" y2="12" />
      <line x1="8" y1="16" x2="11" y2="16" />
      <path d="M18.5 12.5a2.121 2.121 0 0 1 3 3L16 21l-3 1 1-3 5.5-6.5z" />
    </svg>
  );
}


const INITIAL_LEAD_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  alternateEmail: "",
  primaryEmailType: "email",
  mobileNumber: "",
  phone: "",
  companyName: "",
  jobTitle: "",
  websiteSourceForm: "3D Estimator Form",
  leadSource: "Website Webform",
  reference3dNumber: "",
  leadStatus: "New Lead",
  priority: "Hot",
  leadValue: 0,
  currency: "USD",
  contactDate: "",
  preferDateTime: "",
  zipCode: "",
  notes: "",
  leadOwner: "",
  leadOwnerAssist: "",
  manufacturer: "",

  address: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "USA",
  },

  productDetails: {
    productTitle: "",
    productUrl: "",
    colorImageUrl: "",
    estimated3DModel: "",
  },

  buildingSpecifications: {
    installationZipcode: "",
    surface: "Concrete",
    buildingType: "Garage",
    width: "",
    length: "",
    height: "",
    certification: "",
    gauge: "14 Gauge",
    roofStyle: "",
    wallSiding: "",
    frontend: "",
    backend: "",
    leftside: "",
    rightSide: "",
    garageDoors: [
      {
        doorNum: 1,
        sideEnd: "Left Side",
        size: "6'x6'",
        qty: 1,
        doorColor: "",
        certification: "Certified",
        dutch: false,
        chainHoist: false,
        custom: false,
        notes: "",
      },
    ],
    walkInDoors: [
      {
        doorNum: 1,
        location: "Right Side",
        size: "36'x80'",
        color: "With Window",
        qty: 1,
        custom: false,
        notes: "",
      },
    ],
    windowOptions: [
      {
        windowNum: 1,
        location: "Right Side",
        size: "30'x36'",
        qty: 1,
        custom: false,
        notes: "",
      },
    ],
    colorOptions: {
      roofColor: "",
      wallColor: "",
      trimColor: "",
      garageDoorColor: "",
      wainscoat: "",
    },
    otherOptions: {
      gaugePanel: "",
      jTrim: "",
      extraAnchors: "",
      extraBraces: "",
      extraBow: "",
      trussUpgraded: "",
      coloredScrews: "",
    },
  },
};

export async function fetchLeadQuotes(leadId, signal) {
  const res = await quotesApi.getQuotesList({ leadId }, { signal });
  return Array.isArray(res) ? res : res?.results || res?.data || res?.quotes || [];
}

export async function fetchManufacturers(signal) {
  const res = await manufacturersApi.getManufacturers({ isActive: true }, { signal });
  return Array.isArray(res) ? res : [];
}

export function LeadForm({ leadId = null }) {
  const isEdit = Boolean(leadId);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [topTab, setTopTab] = useState("overview"); 
  const [isLoading, setIsLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [activeSection, setActiveSection] = useState("lead-details");
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [saveError, setSaveError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [files, setFiles] = useState([]);

  const [accordions, setAccordions] = useState({
    garageDoor: false,
    walkinDoor: false,
    window: false,
    color: false,
    other: true,
  });

  const [formData, setFormData] = useState(INITIAL_LEAD_FORM);
  const [showQuoteMenu, setShowQuoteMenu] = useState(false);
  const [showQuickQuoteModal, setShowQuickQuoteModal] = useState(false);
  const [shareQuoteTarget, setShareQuoteTarget] = useState(null);
  const [emailQuoteTarget, setEmailQuoteTarget] = useState(null);
  const currentUser = useAuthStore((s) => s.user);
  const quoteMenuRef = useRef(null);

  const leadQuotesQuery = useQuery({
    queryKey: ["lead-quotes", leadId ? String(leadId) : "none"],
    queryFn: ({ signal }) => fetchLeadQuotes(leadId, signal),
    staleTime: 30_000,
    enabled: isEdit && !!leadId,
  });
  const quotesList = useMemo(() => {
    const rows = leadQuotesQuery.data;
    return Array.isArray(rows) ? rows : [];
  }, [leadQuotesQuery.data]);
  const loadingQuotes = leadQuotesQuery.isLoading;
  const fetchQuotes = () => leadQuotesQuery.refetch();

  const manufacturersQuery = useQuery({
    queryKey: ["manufacturers"],
    queryFn: ({ signal }) => fetchManufacturers(signal),
    staleTime: 5 * 60_000,
  });

  // ── Users for Lead Owner / Lead Owner Assist (role-filtered, no other change) ──
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: ({ signal }) => usersApi.getUsers({}, { signal }),
    staleTime: 30_000,
  });
  const allUsers = useMemo(() => {
    const rows = usersQuery.data?.users;
    return Array.isArray(rows) ? rows : [];
  }, [usersQuery.data]);
  const leadOwnerOptions = useMemo(
    () =>
      allUsers
        .filter((u) => LEAD_OWNER_ROLES.includes(getUserRoleKey(u)))
        .map((u) => ({ value: getUserId(u), label: getUserDisplayName(u) }))
        .filter((o) => o.value),
    [allUsers]
  );
  const leadOwnerAssistOptions = useMemo(
    () =>
      allUsers
        .filter((u) => LEAD_OWNER_ASSIST_ROLES.includes(getUserRoleKey(u)))
        .map((u) => ({ value: getUserId(u), label: getUserDisplayName(u) }))
        .filter((o) => o.value),
    [allUsers]
  );
  const loadingManufacturers = manufacturersQuery.isLoading;
  const manufacturersList = useMemo(() => {
    const rows = Array.isArray(manufacturersQuery.data) ? manufacturersQuery.data : [];
    const seen = new Set();
    return rows
      .map((m) => ({
        id: m?.id ? String(m.id) : "",
        name: String(m?.name || m?.fullName || "").trim(),
        // Contract PDF templates returned inline by GET /manufacturer/list
        templates: (Array.isArray(m?.templates) ? m.templates : [])
          .filter((t) => t && t._id && t.isActive !== false)
          .map((t) => ({
            value: String(t._id),
            label: String(t.name || "").trim() || "Contract Template",
          })),
      }))
      .filter((m) => {
        if (!m.name || seen.has(m.name)) return false;
        seen.add(m.name);
        return true;
      });
  }, [manufacturersQuery.data]);
  const manufacturerSelectOptions = useMemo(
    () => manufacturersList.map((m) => ({ value: m.id, label: m.name, templates: m.templates })),
    [manufacturersList]
  );
  const [activeQuoteDropdownId, setActiveQuoteDropdownId] = useState(null);
  const activeQuoteDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutsideQuoteDropdown(e) {
      if (activeQuoteDropdownRef.current && !activeQuoteDropdownRef.current.contains(e.target)) {
        setActiveQuoteDropdownId(null);
      }
    }
    if (activeQuoteDropdownId) {
      document.addEventListener("mousedown", handleClickOutsideQuoteDropdown);
      return () => document.removeEventListener("mousedown", handleClickOutsideQuoteDropdown);
    }
  }, [activeQuoteDropdownId]);

  const handleSendQuoteMessage = async (quote, text) => {
    const quoteId = quote?._id || quote?.id;
    if (!quoteId || String(text || "").trim() === "") return;
    const toast = useToastStore.getState();
    try {
      const res = await quotesApi.updateQuoteShare({ quoteId, message: String(text).trim() });
      toast.success(res?.message || "Message sent successfully");
      await leadQuotesQuery.refetch();
    } catch (err) {
      toast.error(err?.message || "Failed to send message.");
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (quoteMenuRef.current && !quoteMenuRef.current.contains(e.target)) {
        setShowQuoteMenu(false);
      }
    }
    if (showQuoteMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showQuoteMenu]);

  const subNavItems = isEdit ? EDIT_SUB_NAV_ITEMS : ADD_SUB_NAV_ITEMS;

  // ── Fetch lead data in Edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit || !leadId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchLead = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const lead = await leadsApi.getLead(leadId);
        if (cancelled) return;

        if (!lead) {
          setLoadError("Lead not found.");
          return;
        }

        setFormData((prev) => ({
          ...prev,
          ...lead,
          address: { ...prev.address, ...(lead.address || {}) },
          productDetails: { ...prev.productDetails, ...(lead.productDetails || {}) },
          buildingSpecifications: {
            ...prev.buildingSpecifications,
            ...(lead.buildingSpecifications || {}),
            garageDoors: lead.buildingSpecifications?.garageDoors?.length
              ? lead.buildingSpecifications.garageDoors
              : prev.buildingSpecifications.garageDoors,
            walkInDoors: lead.buildingSpecifications?.walkInDoors?.length
              ? lead.buildingSpecifications.walkInDoors
              : prev.buildingSpecifications.walkInDoors,
            windowOptions: lead.buildingSpecifications?.windowOptions?.length
              ? lead.buildingSpecifications.windowOptions
              : prev.buildingSpecifications.windowOptions,
            colorOptions: {
              ...prev.buildingSpecifications.colorOptions,
              ...(lead.buildingSpecifications?.colorOptions || {}),
            },
            otherOptions: {
              ...prev.buildingSpecifications.otherOptions,
              ...(lead.buildingSpecifications?.otherOptions || {}),
            },
          },
        }));
      } catch (err) {
        if (!cancelled) setLoadError(err?.message || "Failed to load lead details.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchLead();
    return () => { cancelled = true; };
  }, [isEdit, leadId]);

  // ── State Update Helpers ─────────────────────────────────────────────────────

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updatePhoneField = (field, value) => {
    updateField(field, formatUSPhoneNumber(value));
  };

  const updateZipField = (field, value) => {
    updateField(field, sanitizeZipCode(value));
  };

  const updateSubDoc = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateBuildingSpec = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      buildingSpecifications: {
        ...prev.buildingSpecifications,
        [field]: value,
      },
    }));
  };

  const updateColorOption = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      buildingSpecifications: {
        ...prev.buildingSpecifications,
        colorOptions: {
          ...prev.buildingSpecifications?.colorOptions,
          [field]: value,
        },
      },
    }));
  };

  const updateOtherOption = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      buildingSpecifications: {
        ...prev.buildingSpecifications,
        otherOptions: {
          ...prev.buildingSpecifications?.otherOptions,
          [field]: value,
        },
      },
    }));
  };

  const addGarageDoor = () => {
    setFormData((prev) => {
      const doors = prev.buildingSpecifications?.garageDoors || [];
      const nextNum = doors.length > 0 ? Math.max(...doors.map((d) => Number(d.doorNum) || 0)) + 1 : 1;
      return {
        ...prev,
        buildingSpecifications: {
          ...prev.buildingSpecifications,
          garageDoors: [
            ...doors,
            {
              doorNum: nextNum,
              sideEnd: "Left Side",
              size: "6'x6'",
              qty: 1,
              doorColor: "",
              certification: "Certified",
              dutch: false,
              chainHoist: false,
              custom: false,
              notes: "",
            },
          ],
        },
      };
    });
  };

  const removeGarageDoor = (index) => {
    setFormData((prev) => ({
      ...prev,
      buildingSpecifications: {
        ...prev.buildingSpecifications,
        garageDoors: (prev.buildingSpecifications?.garageDoors || []).filter((_, i) => i !== index),
      },
    }));
  };

  const updateGarageDoor = (index, field, value) => {
    setFormData((prev) => {
      const doors = [...(prev.buildingSpecifications?.garageDoors || [])];
      doors[index] = { ...doors[index], [field]: value };
      return {
        ...prev,
        buildingSpecifications: {
          ...prev.buildingSpecifications,
          garageDoors: doors,
        },
      };
    });
  };

  // ── Walk-in Door List Handlers ───────────────────────────────────────────────
  const addWalkInDoor = () => {
    setFormData((prev) => {
      const doors = prev.buildingSpecifications?.walkInDoors || [];
      const nextNum = doors.length > 0 ? Math.max(...doors.map((d) => Number(d.doorNum) || 0)) + 1 : 1;
      return {
        ...prev,
        buildingSpecifications: {
          ...prev.buildingSpecifications,
          walkInDoors: [
            ...doors,
            {
              doorNum: nextNum,
              location: "Right Side",
              size: "36'x80'",
              color: "With Window",
              qty: 1,
              custom: false,
              notes: "",
            },
          ],
        },
      };
    });
  };

  const removeWalkInDoor = (index) => {
    setFormData((prev) => ({
      ...prev,
      buildingSpecifications: {
        ...prev.buildingSpecifications,
        walkInDoors: (prev.buildingSpecifications?.walkInDoors || []).filter((_, i) => i !== index),
      },
    }));
  };

  const updateWalkInDoor = (index, field, value) => {
    setFormData((prev) => {
      const doors = [...(prev.buildingSpecifications?.walkInDoors || [])];
      doors[index] = { ...doors[index], [field]: value };
      return {
        ...prev,
        buildingSpecifications: {
          ...prev.buildingSpecifications,
          walkInDoors: doors,
        },
      };
    });
  };

  // ── Window Options List Handlers ─────────────────────────────────────────────
  const addWindow = () => {
    setFormData((prev) => {
      const wins = prev.buildingSpecifications?.windowOptions || [];
      const nextNum = wins.length > 0 ? Math.max(...wins.map((w) => Number(w.windowNum) || 0)) + 1 : 1;
      return {
        ...prev,
        buildingSpecifications: {
          ...prev.buildingSpecifications,
          windowOptions: [
            ...wins,
            {
              windowNum: nextNum,
              location: "Right Side",
              size: "30'x36'",
              qty: 1,
              custom: false,
              notes: "",
            },
          ],
        },
      };
    });
  };

  const removeWindow = (index) => {
    setFormData((prev) => ({
      ...prev,
      buildingSpecifications: {
        ...prev.buildingSpecifications,
        windowOptions: (prev.buildingSpecifications?.windowOptions || []).filter((_, i) => i !== index),
      },
    }));
  };

  const updateWindow = (index, field, value) => {
    setFormData((prev) => {
      const wins = [...(prev.buildingSpecifications?.windowOptions || [])];
      wins[index] = { ...wins[index], [field]: value };
      return {
        ...prev,
        buildingSpecifications: {
          ...prev.buildingSpecifications,
          windowOptions: wins,
        },
      };
    });
  };

  const toggleAccordion = (key) => setAccordions((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Sub-Navigation Scroll-to ─────────────────────────────────────────────────
  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    const handleScroll = () => {
      const scrollPos = (container ? container.scrollTop : window.scrollY) + 140;
      for (const item of subNavItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [subNavItems]);

  // ── File Upload ──────────────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => ({ name: f.name, size: (f.size / 1024).toFixed(1) + " KB" }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };
  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const errors = validateLeadForm(formData);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSaveError("Please fix the highlighted fields before saving.");
      setTimeout(() => setSaveError(null), 4000);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      if (isEdit) {
        await leadsApi.updateLead(leadId, formData);
        setSuccessToast("✓ Lead Updated Successfully! Redirecting...");
      } else {
        await leadsApi.createLead(formData);
        setSuccessToast("✓ Lead Created Successfully! Redirecting...");
      }
      setTimeout(() => router.push("/leads"), 1200);
    } catch (err) {
      console.error(`Failed to ${isEdit ? "update" : "create"} lead:`, err);
      setSaveError(err?.message || `Failed to ${isEdit ? "update" : "create"} lead. Please try again.`);
      setIsSaving(false);
      setTimeout(() => setSaveError(null), 4000);
    }
  };

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  useEffect(() => {
    const handleTriggerSave = () => handleSubmitRef.current();
    window.addEventListener("trigger-lead-save", handleTriggerSave);
    return () => window.removeEventListener("trigger-lead-save", handleTriggerSave);
  }, []);

  // ── Action Bar Handlers ──────────────────────────────────────────────────────
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setSuccessToast("✓ Link copied to clipboard!");
      setTimeout(() => setSuccessToast(""), 2200);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await leadsApi.deleteLead(leadId);
      router.push("/leads");
    } catch (err) {
      setSaveError(err?.message || "Failed to delete lead.");
    }
  };

  const handleStageSelect = (stage) => {
    updateField("leadStatus", stage);
  };

  // ── Date Formatter Helper ────────────────────────────────────────────────────
  const formattedDate = () => {
    const d = formData.createdAt ? new Date(formData.createdAt) : new Date();
    try {
      const options = { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true };
      return d.toLocaleString("en-US", options);
    } catch {
      return "Mon, 14 Sep 2026, 12:34 PM";
    }
  };

  // ── Loading / Error States ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={styles.addLeadContainer}>
        <div className={styles.loadingBox}>
          Loading lead details...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.addLeadContainer}>
        <div className={styles.loadErrorWrap}>
          <p className={styles.loadErrorText}>⚠️ {loadError}</p>
          <button type="button" onClick={() => router.push("/leads")} className={styles.backBtn}>
            ← Back to Leads
          </button>
        </div>
      </div>
    );
  }

  const { address, productDetails, buildingSpecifications } = formData;
  const { garageDoors, walkInDoors, windowOptions, colorOptions, otherOptions } = buildingSpecifications;

  const leadOwnerId = getOwnerId(formData.leadOwner);
  const leadOwnerAssistId = getOwnerId(formData.leadOwnerAssist);
  const resolveOwnerLabel = (id, fallback) => {
    if (!id) return fallback;
    const match =
      leadOwnerOptions.find((o) => o.value === id) ||
      leadOwnerAssistOptions.find((o) => o.value === id) ||
      allUsers
        .map((u) => ({ value: getUserId(u), label: getUserDisplayName(u) }))
        .find((o) => o.value === id);
    return match?.label || fallback;
  };
  const leadOwnerName =
    typeof formData.leadOwner === "object"
      ? getUserDisplayName(formData.leadOwner) !== "Unnamed user"
        ? getUserDisplayName(formData.leadOwner)
        : resolveOwnerLabel(leadOwnerId, "")
      : resolveOwnerLabel(leadOwnerId, formData.leadOwner);
  const leadOwnerAssistName =
    typeof formData.leadOwnerAssist === "object"
      ? getUserDisplayName(formData.leadOwnerAssist) !== "Unnamed user"
        ? getUserDisplayName(formData.leadOwnerAssist)
        : resolveOwnerLabel(leadOwnerAssistId, "")
      : resolveOwnerLabel(leadOwnerAssistId, formData.leadOwnerAssist);
  const manufacturerName = typeof formData.manufacturer === "object" ? formData.manufacturer?.name : formData.manufacturer;
  const manufacturerValue = manufacturerName || "Carolina Carports, INC";
  const manufacturerFieldOptions = [
    { value: "None", label: "None" },
    ...manufacturersList.map((m) => ({ value: m.name, label: m.name })),
  ];
  if (!manufacturerFieldOptions.some((opt) => opt.value === manufacturerValue)) {
    manufacturerFieldOptions.push({ value: manufacturerValue, label: manufacturerValue });
  }

  return (
    <div className={`${isEdit ? styles.editViewWrapper : styles.addLeadContainer} prtm-content-wrapper left-tab common_search_html new_lead_data`}>

      <div className="filter-div cmn_filer_lead">
        <div className="add_lead_filter sticky-top">
          <ul className="nav nav-pills pills-left">
            <li><a href="#tab_32" onClick={(e) => { e.preventDefault(); scrollToSection("lead-details"); }}>Lead Details</a></li>
            <li><a href="#tab_33" onClick={(e) => { e.preventDefault(); scrollToSection("address-details"); }}>Address Information</a></li>
            <li><a href="#tab_34" onClick={(e) => { e.preventDefault(); scrollToSection("product-details"); }}>Product Information</a></li>
            <li><a href="#tab_35" onClick={(e) => { e.preventDefault(); scrollToSection("building-specifications"); }}>Building Information</a></li>
            <li><a href="#tab_36" onClick={(e) => { e.preventDefault(); scrollToSection("attachments"); }}>Attachments</a></li>
          </ul>
        </div>
      </div>
      <aside className={`${isEdit ? styles.editSubSidebar : styles.subSidebar} ${styles.hidden}`}>
        <nav className={styles.subSidebarNav}>
          {subNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.subNavItem} ${activeSection === item.id ? styles.active : ""}`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>


      <div className={isEdit ? styles.editMainWrapper : styles.formAreaWrapper}>

        {isEdit && (
          <div className={styles.editTopBar}>
            <div className={styles.tabPillGroup}>
              <button
                type="button"
                className={`${styles.tabPill} ${topTab === "overview" ? styles.activeTabPill : ""}`}
                onClick={() => setTopTab("overview")}
              >
                Overview
              </button>
              <button
                type="button"
                className={`${styles.tabPill} ${topTab === "timeline" ? styles.activeTabPill : ""}`}
                onClick={() => setTopTab("timeline")}
              >
                Timeline
              </button>
            </div>

            {/* Right Action Icons Group */}
            <div className={styles.actionIconsGroup}>
              <div className={styles.secondaryActions}>
                <button type="button" className={styles.actionIconBtn} onClick={handleDelete} title="Delete Lead">
                  <TrashIcon />
                </button>
                <button type="button" className={styles.actionIconBtn} onClick={handleShare} title="Share Lead URL">
                  <ShareIcon />
                </button>
                <button type="button" className={styles.actionIconBtn} title="More Options">
                  <MoreVerticalIcon />
                </button>
              </div>
              <button type="button" onClick={handleSubmit} disabled={isSaving} className={styles.saveBtnWhite}>
                <SaveIcon />
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── Scrollable Body (Center Form + Right Details Sidebar) ─────────────── */}
        <div
          ref={scrollContainerRef}
          className={isEdit ? styles.threeColLayout : styles.formArea}
        >
          {/* ─── Center Content Area ────────────────────────────────────────── */}
          <main className={isEdit ? styles.editCenterContent : undefined}>

            {/* ── Pipeline Stepper Bar (Edit View Only - Non-clickable Status Indicator) ── */}
            {isEdit && (
              <div className={styles.pipelineStepper}>
                {PIPELINE_STAGES.map((stage) => {
                  const isActive = formData.leadStatus === stage || (!formData.leadStatus && stage === "New Lead");
                  return (
                    <div
                      key={stage}
                      className={`${styles.pipelineStep} ${isActive ? styles.activePipelineStep : ""}`}
                    >
                      <span>{stage}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Hero Summary Header Card (Edit View Only) ────────────────────── */}
            {isEdit && (
              <div className={styles.heroCard}>
                <div className={styles.heroTopRow}>
                  <div className={styles.heroIconBox}>
                    <ContactCardIcon />
                  </div>
                  <div className={styles.heroMainInfo}>
                    <h2 className={styles.heroCustomerName}>
                      {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}`.trim() : "Lead Details"}
                    </h2>
                    <div className={styles.heroContactLine}>
                      <span>{formData.email || "No email"}</span>
                      <span className={styles.heroDivider}>|</span>
                      {formData.mobileNumber || formData.phone ? (
                        <a href={`tel:${formData.mobileNumber || formData.phone}`} className={styles.heroPhoneLink}>
                          <span>{formData.mobileNumber || formData.phone}</span>
                          <PhoneIcon />
                        </a>
                      ) : (
                        <span>No phone</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.heroBottomMeta}>
                  <span>Lead Owner- {leadOwnerName || "Viking Steel Structures"}</span>
                  <span className={styles.heroDivider}>|</span>
                  <span>Manufacturer- {manufacturerName || "Carolina Carports, INC"}</span>
                  <span className={styles.heroDivider}>|</span>
                  <a href="tel:8006704282" className={styles.heroPhoneLink}>
                    <span>8006704282</span>
                    <PhoneIcon />
                  </a>
                </div>
              </div>
            )}

            {/* ── Form View or Timeline View ──────────────────────────────────── */}
            {topTab === "timeline" ? (
              <div className={`${styles.formSection} ${styles.activityPlaceholder}`}>
                <h3>Activity Timeline</h3>
                <p>Lead was created on {formattedDate()} via {formData.websiteSourceForm || "3D Estimator Form"}.</p>
                <p className={styles.activitySub}>Current status is &ldquo;{formData.leadStatus || "New Lead"}&rdquo;.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="lead_details_block">
                  <div className="tab-content new_form_design">

                    {/* ── Section 1: Lead Details ─────────────────────────────────── */}
                    <section id="lead-details" className={styles.formSection}>
                      <div className={styles.topSectionHeader}>
                        <div className={styles.sectionTitleGroup}>
                          <span className={styles.accentMarker} />
                          <h3 className={styles.sectionTitle}>Lead Details</h3>
                        </div>
                        {!isEdit && (
                          <button type="button" onClick={handleSubmit} disabled={isSaving} className={styles.saveButton}>
                            <SaveIcon />
                            <span>{isSaving ? "Saving..." : "Save"}</span>
                          </button>
                        )}
                      </div>

                      {/* Lead Owner & Lead Owner Assist */}
                      <div className={styles.grid2Cols}>
                        <div className={`${styles.notchedField} ${styles.hasValue} ${fieldErrors.leadOwner ? styles.error : ""}`}>
                          <label className={styles.notchedLabel}>Lead Owner <span className={styles.required}>*</span></label>
                          <select
                            name="leadOwner"
                            value={leadOwnerId || ""}
                            onChange={(e) => updateField("leadOwner", e.target.value)}
                            className={styles.notchedSelect}
                          >
                            <option value="" disabled>
                              {usersQuery.isLoading ? "Loading..." : "Select Lead Owner"}
                            </option>
                            {leadOwnerOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                          <span className={styles.selectArrow}><ChevronDownIcon /></span>
                        </div>
                        {fieldErrors.leadOwner && <FieldError message={fieldErrors.leadOwner} />}

                        <div className={`${styles.notchedField} ${styles.hasValue} ${fieldErrors.leadOwnerAssist ? styles.error : ""}`}>
                          <label className={styles.notchedLabel}>Lead Owner Assist <span className={styles.required}>*</span></label>
                          <select
                            name="leadOwnerAssist"
                            value={leadOwnerAssistId || "None"}
                            onChange={(e) => updateField("leadOwnerAssist", e.target.value)}
                            className={styles.notchedSelect}
                          >
                            <option value="None">None</option>
                            {leadOwnerAssistOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                          <span className={styles.selectArrow}><ChevronDownIcon /></span>
                        </div>
                        {fieldErrors.leadOwnerAssist && <FieldError message={fieldErrors.leadOwnerAssist} />}
                      </div>

                      {/* Lead Status */}
                      <div className={`${styles.grid2Cols} ${styles.mt16}`}>
                        <div className={`${styles.notchedField} ${styles.hasValue}`}>
                          <label className={styles.notchedLabel}>Lead Status</label>
                          <select
                            name="leadStatus"
                            value={formData.leadStatus || "New Lead"}
                            onChange={(e) => updateField("leadStatus", e.target.value)}
                            className={styles.notchedSelect}
                          >
                            <option value="New Lead">New Lead</option>
                            <option value="Quote Sent">Quote Sent</option>
                            <option value="Quoted">Quoted</option>
                            <option value="Contract Sent">Contract Sent</option>
                            <option value="Contract Signed">Contract Signed</option>
                            <option value="Customer Won">Customer Won</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Follow Up">Follow Up</option>
                            <option value="Closed">Closed</option>
                          </select>
                          <span className={styles.selectArrow}><ChevronDownIcon /></span>
                        </div>
                        <div />
                      </div>

                      {/* First Name & Last Name */}
                      <div className={`${styles.grid2Cols} ${styles.mt16}`}>
                        <div className={`${styles.notchedField} ${formData.firstName ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            autoComplete="off"
                            value={formData.firstName || ""}
                            onChange={(e) => updateField("firstName", e.target.value)}
                            placeholder="First Name"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${formData.lastName ? styles.hasValue : ""} ${fieldErrors.lastName ? styles.error : ""}`}>
                          <label className={styles.notchedLabel}>Last Name <span className={styles.required}>*</span></label>
                          <input
                            type="text"
                            name="lastName"
                            autoComplete="off"
                            value={formData.lastName || ""}
                            onChange={(e) => updateField("lastName", e.target.value)}
                            placeholder="Last Name *"
                            className={styles.notchedInput}
                          />
                        </div>
                        {fieldErrors.lastName && <FieldError message={fieldErrors.lastName} />}
                      </div>

                      {/* Set Primary Email Sub-Card */}
                      <div className={styles.primaryEmailCard}>
                        <div className={styles.primaryEmailHeader}>
                          <h4 className={styles.primaryEmailTitle}>Set Primary Email</h4>
                          <p className={styles.primaryEmailSubtitle}>Choose the email you want to mark as the primary one. You can edit them below.</p>
                        </div>

                        <div className={styles.emailColsGrid}>
                          <div className={styles.emailCol}>
                            <label className={styles.radioLabel}>
                              <input
                                type="radio"
                                name="primaryEmailType"
                                value="email"
                                checked={formData.primaryEmailType === "email"}
                                onChange={(e) => updateField("primaryEmailType", e.target.value)}
                              />
                              <span className={styles.radioCustom} />
                              <span className={styles.radioText}>Email Address</span>
                            </label>
                            <div className={`${styles.notchedField} ${fieldErrors.email ? styles.error : ""}`}>
                              <input
                                type="email"
                                name="email"
                                autoComplete="off"
                                value={formData.email || ""}
                                onChange={(e) => updateField("email", e.target.value)}
                                placeholder="Enter Email"
                                className={styles.notchedInput}
                              />
                            </div>
                            {fieldErrors.email && <FieldError message={fieldErrors.email} />}
                          </div>

                          <div className={styles.emailCol}>
                            <label className={styles.radioLabel}>
                              <input
                                type="radio"
                                name="primaryEmailType"
                                value="alternate"
                                checked={formData.primaryEmailType === "alternate"}
                                onChange={(e) => updateField("primaryEmailType", e.target.value)}
                              />
                              <span className={styles.radioCustom} />
                              <span className={styles.radioText}>Alternate Email</span>
                            </label>
                            <div className={`${styles.notchedField} ${fieldErrors.alternateEmail ? styles.error : ""}`}>
                              <input
                                type="email"
                                name="alternateEmail"
                                autoComplete="off"
                                value={formData.alternateEmail || ""}
                                onChange={(e) => updateField("alternateEmail", e.target.value)}
                                placeholder="Enter Email"
                                className={styles.notchedInput}
                              />
                            </div>
                            {fieldErrors.alternateEmail && <FieldError message={fieldErrors.alternateEmail} />}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Number & Phone */}
                      <div className={styles.grid2Cols}>
                        <div className={`${styles.notchedField} ${formData.mobileNumber ? styles.hasValue : ""} ${fieldErrors.mobileNumber ? styles.error : ""}`}>
                          <label className={styles.notchedLabel}>Mobile <span className={styles.required}>*</span></label>
                          <input
                            type="tel"
                            name="mobileNumber"
                            autoComplete="off"
                            value={formData.mobileNumber || ""}
                            onChange={(e) => updatePhoneField("mobileNumber", e.target.value)}
                            placeholder="Mobile *"
                            maxLength={18}
                            className={styles.notchedInput}
                          />
                        </div>
                        {fieldErrors.mobileNumber && <FieldError message={fieldErrors.mobileNumber} />}

                        <div className={`${styles.notchedField} ${formData.phone ? styles.hasValue : ""} ${fieldErrors.phone ? styles.error : ""}`}>
                          <label className={styles.notchedLabel}>Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            autoComplete="off"
                            value={formData.phone || ""}
                            onChange={(e) => updatePhoneField("phone", e.target.value)}
                            placeholder="Phone"
                            maxLength={22}
                            className={styles.notchedInput}
                          />
                        </div>
                        {fieldErrors.phone && <FieldError message={fieldErrors.phone} />}
                      </div>

                      {/* Web Form & Lead Source */}
                      <div className={styles.grid2Cols}>
                        <div className={`${styles.notchedField} ${formData.websiteSourceForm ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Web Form</label>
                          <input
                            type="text"
                            name="websiteSourceForm"
                            autoComplete="off"
                            value={formData.websiteSourceForm || ""}
                            onChange={(e) => updateField("websiteSourceForm", e.target.value)}
                            placeholder="Web Form"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${styles.hasValue}`}>
                          <label className={styles.notchedLabel}>Lead Source</label>
                          <select
                            name="leadSource"
                            value={formData.leadSource || "Website Webform"}
                            onChange={(e) => updateField("leadSource", e.target.value)}
                            className={styles.notchedSelect}
                          >
                            <option value="Website Webform">Website Webform</option>
                            <option value="Zendesk Chat">Zendesk Chat</option>
                            <option value="Website">Website</option>
                            <option value="Organic">Organic</option>
                            <option value="Referral">Referral</option>
                            <option value="3D Estimator">3D Estimator</option>
                          </select>
                          <span className={styles.selectArrow}><ChevronDownIcon /></span>
                        </div>
                      </div>

                      <div className={styles.grid2Cols}>
                        <div
                          className={`${styles.notchedField} ${formData.reference3dNumber ? styles.hasValue : ""}`}
                          style={formData.leadSource === "3D Estimator" ? undefined : { display: "none" }}
                        >
                          <label className={styles.notchedLabel}>3D Reference Number</label>
                          <input
                            type="text"
                            name="reference3dNumber"
                            autoComplete="off"
                            value={formData.reference3dNumber || ""}
                            onChange={(e) => updateField("reference3dNumber", e.target.value)}
                            placeholder="3D Reference Number"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${styles.hasValue}`}>
                          <label className={styles.notchedLabel}>Manufacturer</label>
                          <select
                            name="manufacturer"
                            value={manufacturerValue}
                            onChange={(e) => updateField("manufacturer", e.target.value)}
                            className={styles.notchedSelect}
                          >
                            {manufacturerFieldOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <span className={styles.selectArrow}><ChevronDownIcon /></span>
                        </div>
                      </div>

                      {/* Contact Date & Time & Zip Code */}
                      <div className={styles.grid2Cols}>
                        <div className={`${styles.notchedField} ${styles.hasValue}`}>
                          <label className={styles.notchedLabel}>Contact Date & Time</label>
                          <input
                            type="datetime-local"
                            name="contactDate"
                            autoComplete="off"
                            value={(() => {
                              const val = formData.contactDate || formData.preferDateTime;
                              if (!val) return "";
                              try {
                                const d = new Date(val);
                                if (!isNaN(d.getTime())) {
                                  const pad = (n) => String(n).padStart(2, "0");
                                  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                                }
                              } catch { }
                              return typeof val === "string" && val.includes("T") ? val.slice(0, 16) : val;
                            })()}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateField("contactDate", val);
                              updateField("preferDateTime", val);
                            }}
                            onClick={(e) => {
                              try {
                                e.target.showPicker();
                              } catch { }
                            }}
                            placeholder="Enter Contact Date & Time"
                            className={styles.notchedInput}
                          />
                          <span className={styles.inputIcon}><CalendarGridIcon /></span>
                        </div>

                        <div className={`${styles.notchedField} ${formData.zipCode ? styles.hasValue : ""} ${fieldErrors.zipCode ? styles.error : ""}`}>
                          <label className={styles.notchedLabel}>Zipcode <span className={styles.required}>*</span></label>
                          <input
                            type="text"
                            name="zipCode"
                            autoComplete="off"
                            value={formData.zipCode || ""}
                            onChange={(e) => updateZipField("zipCode", e.target.value)}
                            placeholder="Zipcode *"
                            maxLength={6}
                            inputMode="numeric"
                            className={styles.notchedInput}
                          />
                        </div>
                        {fieldErrors.zipCode && <FieldError message={fieldErrors.zipCode} />}
                      </div>

                      {/* Notes */}
                      <div id="notes" className={styles.fullWidth}>
                        <div className={`${styles.notchedField} ${formData.notes ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Notes</label>
                          <textarea
                            name="notes"
                            value={formData.notes || ""}
                            onChange={(e) => updateField("notes", e.target.value)}
                            placeholder="Notes"
                            rows={4}
                            className={styles.notchedTextarea}
                          />
                        </div>
                      </div>
                    </section>

                    {/* ── Section 2: Address Details ──────────────────────────────── */}
                    <section id="address-details" className={styles.formSection}>
                      <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitleGroup}>
                          <span className={styles.accentMarker} />
                          <h3 className={styles.sectionTitle}>Address Details</h3>
                        </div>
                      </div>

                      <div className={styles.grid2Cols}>
                        <div className={`${styles.notchedField} ${address?.addressLine1 ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Address Line 1</label>
                          <input
                            type="text"
                            name="addressLine1"
                            autoComplete="off"
                            value={address?.addressLine1 || ""}
                            onChange={(e) => updateSubDoc("address", "addressLine1", e.target.value)}
                            placeholder="Address Line 1"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${address?.addressLine2 ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Address Line 2</label>
                          <input
                            type="text"
                            name="addressLine2"
                            autoComplete="off"
                            value={address?.addressLine2 || ""}
                            onChange={(e) => updateSubDoc("address", "addressLine2", e.target.value)}
                            placeholder="Address Line 2"
                            className={styles.notchedInput}
                          />
                        </div>
                      </div>

                      <div className={styles.addressRow2}>
                        <div className={`${styles.notchedField} ${address?.city ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>City</label>
                          <input
                            type="text"
                            name="city"
                            autoComplete="off"
                            value={address?.city || ""}
                            onChange={(e) => updateSubDoc("address", "city", e.target.value)}
                            placeholder="City"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${address?.state ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>State</label>
                          <input
                            type="text"
                            name="state"
                            autoComplete="off"
                            value={address?.state || ""}
                            onChange={(e) => updateSubDoc("address", "state", e.target.value)}
                            placeholder="State"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${styles.hasValue}`}>
                          <label className={styles.notchedLabel}>Country</label>
                          <input
                            type="text"
                            name="country"
                            autoComplete="off"
                            value={address?.country || "USA"}
                            onChange={(e) => updateSubDoc("address", "country", e.target.value)}
                            placeholder="Country"
                            className={styles.notchedInput}
                          />
                        </div>
                      </div>
                    </section>

                    {/* ── Section 3: Product Details ──────────────────────────────── */}
                    <section id="product-details" className={styles.formSection}>
                      <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitleGroup}>
                          <span className={styles.accentMarker} />
                          <h3 className={styles.sectionTitle}>Product Details</h3>
                        </div>
                      </div>

                      <div className={styles.grid2Cols}>
                        <div className={`${styles.notchedField} ${productDetails?.productTitle ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Product Title</label>
                          <input
                            type="text"
                            name="productTitle"
                            value={productDetails?.productTitle || ""}
                            onChange={(e) => updateSubDoc("productDetails", "productTitle", e.target.value)}
                            placeholder="Product Title"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${productDetails?.productUrl ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Product URL</label>
                          <input
                            type="text"
                            name="productUrl"
                            value={productDetails?.productUrl || ""}
                            onChange={(e) => updateSubDoc("productDetails", "productUrl", e.target.value)}
                            placeholder="Product URL"
                            className={styles.notchedInput}
                          />
                        </div>
                      </div>

                      <div className={styles.grid2Cols}>
                        <div className={`${styles.notchedField} ${productDetails?.estimated3DModel ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>3D Estimator URL</label>
                          <input
                            type="text"
                            name="estimated3DModel"
                            value={productDetails?.estimated3DModel || ""}
                            onChange={(e) => updateSubDoc("productDetails", "estimated3DModel", e.target.value)}
                            placeholder="3D Estimator URL"
                            className={styles.notchedInput}
                          />
                        </div>
                        <div />
                      </div>
                    </section>

                    {/* ── Section 4: Building Specifications ─────────────────────── */}
                    <section id="building-specifications" className={styles.formSection}>
                      <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitleGroup}>
                          <span className={styles.accentMarker} />
                          <h3 className={styles.sectionTitle}>Building Specifications</h3>
                        </div>
                      </div>

                      {/* Row 1: Zip, Surface, Type */}
                      <div className={styles.grid3Cols}>
                        <div className={`${styles.notchedField} ${buildingSpecifications?.installationZipcode ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Installation Zipcode</label>
                          <input
                            type="text"
                            name="installationZipcode"
                            autoComplete="off"
                            value={buildingSpecifications?.installationZipcode || ""}
                            onChange={(e) => updateBuildingSpec("installationZipcode", e.target.value)}
                            placeholder="Zipcode"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${styles.hasValue}`}>
                          <label className={styles.notchedLabel}>Installation Surface</label>
                          <select
                            name="surface"
                            value={buildingSpecifications?.surface || "Concrete"}
                            onChange={(e) => updateBuildingSpec("surface", e.target.value)}
                            className={styles.notchedSelect}
                          >
                            <option value="Concrete">Concrete</option>
                            <option value="Ground/Dirt">Ground/Dirt</option>
                            <option value="Asphalt">Asphalt</option>
                            <option value="Gravel">Gravel</option>
                          </select>
                          <span className={styles.selectArrow}><ChevronDownIcon /></span>
                        </div>

                        <div className={`${styles.notchedField} ${styles.hasValue}`}>
                          <label className={styles.notchedLabel}>Building Type</label>
                          <select
                            name="buildingType"
                            value={buildingSpecifications?.buildingType || "Garage"}
                            onChange={(e) => updateBuildingSpec("buildingType", e.target.value)}
                            className={styles.notchedSelect}
                          >
                            <option value="Garage">Garage</option>
                            <option value="Carport">Carport</option>
                            <option value="Barn">Barn</option>
                            <option value="Commercial">Commercial</option>
                          </select>
                          <span className={styles.selectArrow}><ChevronDownIcon /></span>
                        </div>
                      </div>

                      {/* Row 2: Width, Length, Height */}
                      <div className={styles.grid3Cols}>
                        <div className={`${styles.notchedField} ${buildingSpecifications?.width ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Width</label>
                          <input
                            type="text"
                            name="width"
                            value={buildingSpecifications?.width || ""}
                            onChange={(e) => updateBuildingSpec("width", e.target.value)}
                            placeholder="Width (ft)"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${buildingSpecifications?.length ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Length</label>
                          <input
                            type="text"
                            name="length"
                            value={buildingSpecifications?.length || ""}
                            onChange={(e) => updateBuildingSpec("length", e.target.value)}
                            placeholder="Length (ft)"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${buildingSpecifications?.height ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Height</label>
                          <input
                            type="text"
                            name="height"
                            value={buildingSpecifications?.height || ""}
                            onChange={(e) => updateBuildingSpec("height", e.target.value)}
                            placeholder="Height (ft)"
                            className={styles.notchedInput}
                          />
                        </div>
                      </div>

                      {/* Row 3: Certification, Gauge, Roof Style */}
                      <div className={styles.grid3Cols}>
                        <div className={`${styles.notchedField} ${buildingSpecifications?.certification ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Certification</label>
                          <input
                            type="text"
                            name="certification"
                            value={buildingSpecifications?.certification || ""}
                            onChange={(e) => updateBuildingSpec("certification", e.target.value)}
                            placeholder="Certification"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${styles.hasValue}`}>
                          <label className={styles.notchedLabel}>Gauge</label>
                          <select
                            name="gauge"
                            value={buildingSpecifications?.gauge || "14 Gauge"}
                            onChange={(e) => updateBuildingSpec("gauge", e.target.value)}
                            className={styles.notchedSelect}
                          >
                            <option value="14 Gauge">14 Gauge</option>
                            <option value="12 Gauge">12 Gauge</option>
                          </select>
                          <span className={styles.selectArrow}><ChevronDownIcon /></span>
                        </div>

                        <div className={`${styles.notchedField} ${buildingSpecifications?.roofStyle ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Roof Style</label>
                          <input
                            type="text"
                            name="roofStyle"
                            value={buildingSpecifications?.roofStyle || ""}
                            onChange={(e) => updateBuildingSpec("roofStyle", e.target.value)}
                            placeholder="Roof Style"
                            className={styles.notchedInput}
                          />
                        </div>
                      </div>

                      {/* Row 4: Wall Siding, Front End, Back End */}
                      <div className={styles.grid3Cols}>
                        <div className={`${styles.notchedField} ${buildingSpecifications?.wallSiding ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Wall Siding</label>
                          <input
                            type="text"
                            name="wallSiding"
                            value={buildingSpecifications?.wallSiding || ""}
                            onChange={(e) => updateBuildingSpec("wallSiding", e.target.value)}
                            placeholder="Wall Siding"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${buildingSpecifications?.frontend ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Front End</label>
                          <input
                            type="text"
                            name="frontend"
                            value={buildingSpecifications?.frontend || ""}
                            onChange={(e) => updateBuildingSpec("frontend", e.target.value)}
                            placeholder="Front End"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${buildingSpecifications?.backend ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Back End</label>
                          <input
                            type="text"
                            name="backend"
                            value={buildingSpecifications?.backend || ""}
                            onChange={(e) => updateBuildingSpec("backend", e.target.value)}
                            placeholder="Back End"
                            className={styles.notchedInput}
                          />
                        </div>
                      </div>

                      {/* Row 5: Left Side, Right Side */}
                      <div className={styles.grid3Cols}>
                        <div className={`${styles.notchedField} ${buildingSpecifications?.leftside ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Left Side</label>
                          <input
                            type="text"
                            name="leftside"
                            value={buildingSpecifications?.leftside || ""}
                            onChange={(e) => updateBuildingSpec("leftside", e.target.value)}
                            placeholder="Left Side"
                            className={styles.notchedInput}
                          />
                        </div>

                        <div className={`${styles.notchedField} ${buildingSpecifications?.rightSide ? styles.hasValue : ""}`}>
                          <label className={styles.notchedLabel}>Right Side</label>
                          <input
                            type="text"
                            name="rightSide"
                            value={buildingSpecifications?.rightSide || ""}
                            onChange={(e) => updateBuildingSpec("rightSide", e.target.value)}
                            placeholder="Right Side"
                            className={styles.notchedInput}
                          />
                        </div>
                        <div />
                      </div>

                      {/* Accordions */}
                      <div className={styles.accordionsWrapper}>
                        {/* Garage Door Options */}
                        <div className={styles.accordionItem}>
                          <button type="button" className={styles.accordionHeader} onClick={() => toggleAccordion("garageDoor")}>
                            <span>Garage Door Options</span>
                            <span className={styles.accordionIconBox}>{accordions.garageDoor ? <MinusIcon /> : <PlusIcon />}</span>
                          </button>

                          {accordions.garageDoor && (
                            <div className={styles.accordionBody}>
                              <div className={styles.doorCardsList}>
                                {garageDoors?.map((door, index) => (
                                  <div key={door._id || door.id || index} className={styles.doorCard}>
                                    <div className={styles.doorCardHeader}>
                                      <span className={styles.doorCardTitle}>DOOR {door.doorNum || index + 1}</span>
                                      {index > 0 && (
                                        <button type="button" className={styles.deleteDoorBtn} onClick={() => removeGarageDoor(index)} title="Delete Door">
                                          <TrashIcon />
                                        </button>
                                      )}
                                    </div>

                                    <div className={styles.grid3Cols}>
                                      <div className={`${styles.notchedField} ${styles.hasValue}`}>
                                        <label className={styles.notchedLabel}>Side/End</label>
                                        <select value={door.sideEnd || "Left Side"} onChange={(e) => updateGarageDoor(index, "sideEnd", e.target.value)} className={styles.notchedSelect}>
                                          <option value="Left Side">Left Side</option>
                                          <option value="Right Side">Right Side</option>
                                          <option value="Front End">Front End</option>
                                          <option value="Back End">Back End</option>
                                        </select>
                                        <span className={styles.selectArrow}><ChevronDownIcon /></span>
                                      </div>

                                      <div className={`${styles.notchedField} ${styles.hasValue}`}>
                                        <label className={styles.notchedLabel}>Size</label>
                                        <select value={door.size || "6'x6'"} onChange={(e) => updateGarageDoor(index, "size", e.target.value)} className={styles.notchedSelect}>
                                          <option value="6'x6'">6'x6'</option>
                                          <option value="8'x7'">8'x7'</option>
                                          <option value="8'x8'">8'x8'</option>
                                          <option value="9'x7'">9'x7'</option>
                                          <option value="9'x8'">9'x8'</option>
                                          <option value="10'x8'">10'x8'</option>
                                          <option value="10'x10'">10'x10'</option>
                                          <option value="12'x10'">12'x10'</option>
                                          <option value="12'x12'">12'x12'</option>
                                          <option value="14'x14'">14'x14'</option>
                                          <option value="Custom">Custom</option>
                                        </select>
                                        <span className={styles.selectArrow}><ChevronDownIcon /></span>
                                      </div>

                                      <div className={`${styles.notchedField} ${door.qty ? styles.hasValue : ""}`}>
                                        <label className={styles.notchedLabel}>Qty</label>
                                        <input type="number" value={door.qty ?? 1} onChange={(e) => updateGarageDoor(index, "qty", Number(e.target.value) || 1)} placeholder="Qty" className={styles.notchedInput} />
                                      </div>
                                    </div>

                                    <div className={styles.grid3Cols}>
                                      <div className={`${styles.notchedField} ${door.doorColor ? styles.hasValue : ""}`}>
                                        <label className={styles.notchedLabel}>Door Color</label>
                                        <input type="text" value={door.doorColor || ""} onChange={(e) => updateGarageDoor(index, "doorColor", e.target.value)} placeholder="Door Color" className={styles.notchedInput} />
                                      </div>

                                      <div className={`${styles.notchedField} ${styles.hasValue}`}>
                                        <label className={styles.notchedLabel}>Certification</label>
                                        <select value={door.certification || "Certified"} onChange={(e) => updateGarageDoor(index, "certification", e.target.value)} className={styles.notchedSelect}>
                                          <option value="Certified">Certified</option>
                                          <option value="Non-Certified">Non-Certified</option>
                                        </select>
                                        <span className={styles.selectArrow}><ChevronDownIcon /></span>
                                      </div>
                                      <div />
                                    </div>

                                    <div className={styles.doorCheckboxRow}>
                                      <label className={styles.doorCheckboxItem}>
                                        <input type="checkbox" checked={Boolean(door.dutch)} onChange={(e) => updateGarageDoor(index, "dutch", e.target.checked)} />
                                        <span>Dutch</span>
                                      </label>
                                      <label className={styles.doorCheckboxItem}>
                                        <input type="checkbox" checked={Boolean(door.chainHoist)} onChange={(e) => updateGarageDoor(index, "chainHoist", e.target.checked)} />
                                        <span>Chain Hoist</span>
                                      </label>
                                      <label className={styles.doorCheckboxItem}>
                                        <input type="checkbox" checked={Boolean(door.custom)} onChange={(e) => updateGarageDoor(index, "custom", e.target.checked)} />
                                        <span>Custom</span>
                                      </label>
                                    </div>

                                    <div className={styles.doorNotesRow}>
                                      <div className={`${styles.notchedField} ${door.notes ? styles.hasValue : ""}`}>
                                        <label className={styles.notchedLabel}>Notes</label>
                                        <input type="text" value={door.notes || ""} onChange={(e) => updateGarageDoor(index, "notes", e.target.value)} placeholder="Notes" className={styles.notchedInput} />
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                <div className={styles.addDoorAction}>
                                  <button type="button" className={styles.addDoorBtn} onClick={addGarageDoor}>
                                    <PlusIcon />
                                    <span>Add Another Garage Door</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Walk-in Door Options */}
                        <div className={styles.accordionItem}>
                          <button type="button" className={styles.accordionHeader} onClick={() => toggleAccordion("walkinDoor")}>
                            <span>Walk-in Door Options</span>
                            <span className={styles.accordionIconBox}>{accordions.walkinDoor ? <MinusIcon /> : <PlusIcon />}</span>
                          </button>

                          {accordions.walkinDoor && (
                            <div className={styles.accordionBody}>
                              <div className={styles.doorCardsList}>
                                {walkInDoors?.map((door, index) => (
                                  <div key={door._id || door.id || index} className={styles.doorCard}>
                                    <div className={styles.doorCardHeader}>
                                      <span className={styles.doorCardTitle}>DOOR {door.doorNum || index + 1}</span>
                                      {index > 0 && (
                                        <button type="button" className={styles.deleteDoorBtn} onClick={() => removeWalkInDoor(index)} title="Delete Door">
                                          <TrashIcon />
                                        </button>
                                      )}
                                    </div>

                                    <div className={styles.grid3Cols}>
                                      <div className={`${styles.notchedField} ${styles.hasValue}`}>
                                        <label className={styles.notchedLabel}>Location</label>
                                        <select value={door.location || "Right Side"} onChange={(e) => updateWalkInDoor(index, "location", e.target.value)} className={styles.notchedSelect}>
                                          <option value="Left Side">Left Side</option>
                                          <option value="Right Side">Right Side</option>
                                          <option value="Front End">Front End</option>
                                          <option value="Back End">Back End</option>
                                        </select>
                                        <span className={styles.selectArrow}><ChevronDownIcon /></span>
                                      </div>

                                      <div className={`${styles.notchedField} ${styles.hasValue}`}>
                                        <label className={styles.notchedLabel}>Size</label>
                                        <select value={door.size || "36'x80'"} onChange={(e) => updateWalkInDoor(index, "size", e.target.value)} className={styles.notchedSelect}>
                                          <option value="36'x80'">36'x80'</option>
                                          <option value="34'x80'">34'x80'</option>
                                          <option value="Custom">Custom</option>
                                        </select>
                                        <span className={styles.selectArrow}><ChevronDownIcon /></span>
                                      </div>

                                      <div className={`${styles.notchedField} ${door.qty ? styles.hasValue : ""}`}>
                                        <label className={styles.notchedLabel}>Qty</label>
                                        <input type="number" value={door.qty ?? 1} onChange={(e) => updateWalkInDoor(index, "qty", Number(e.target.value) || 1)} placeholder="Qty" className={styles.notchedInput} />
                                      </div>
                                    </div>

                                    <div className={styles.grid3Cols}>
                                      <div className={`${styles.notchedField} ${styles.hasValue}`}>
                                        <label className={styles.notchedLabel}>Door Color</label>
                                        <select value={door.color || "With Window"} onChange={(e) => updateWalkInDoor(index, "color", e.target.value)} className={styles.notchedSelect}>
                                          <option value="With Window">With Window</option>
                                          <option value="Without Window">Without Window</option>
                                        </select>
                                        <span className={styles.selectArrow}><ChevronDownIcon /></span>
                                      </div>
                                      <div />
                                      <div />
                                    </div>

                                    <div className={styles.doorCheckboxRow}>
                                      <label className={styles.doorCheckboxItem}>
                                        <input type="checkbox" checked={Boolean(door.custom)} onChange={(e) => updateWalkInDoor(index, "custom", e.target.checked)} />
                                        <span>Custom</span>
                                      </label>
                                    </div>

                                    <div className={styles.doorNotesRow}>
                                      <div className={`${styles.notchedField} ${door.notes ? styles.hasValue : ""}`}>
                                        <label className={styles.notchedLabel}>Notes</label>
                                        <input type="text" value={door.notes || ""} onChange={(e) => updateWalkInDoor(index, "notes", e.target.value)} placeholder="Notes" className={styles.notchedInput} />
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                <div className={styles.addDoorAction}>
                                  <button type="button" className={styles.addDoorBtn} onClick={addWalkInDoor}>
                                    <PlusIcon />
                                    <span>Add Another Walk-in Door</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Window Options */}
                        <div className={styles.accordionItem}>
                          <button type="button" className={styles.accordionHeader} onClick={() => toggleAccordion("window")}>
                            <span>Window Options</span>
                            <span className={styles.accordionIconBox}>{accordions.window ? <MinusIcon /> : <PlusIcon />}</span>
                          </button>

                          {accordions.window && (
                            <div className={styles.accordionBody}>
                              <div className={styles.doorCardsList}>
                                {windowOptions?.map((win, index) => (
                                  <div key={win._id || win.id || index} className={styles.doorCard}>
                                    <div className={styles.doorCardHeader}>
                                      <span className={styles.doorCardTitle}>WINDOW {win.windowNum || index + 1}</span>
                                      {index > 0 && (
                                        <button type="button" className={styles.deleteDoorBtn} onClick={() => removeWindow(index)} title="Delete Window">
                                          <TrashIcon />
                                        </button>
                                      )}
                                    </div>

                                    <div className={styles.grid3Cols}>
                                      <div className={`${styles.notchedField} ${styles.hasValue}`}>
                                        <label className={styles.notchedLabel}>Location</label>
                                        <select value={win.location || "Right Side"} onChange={(e) => updateWindow(index, "location", e.target.value)} className={styles.notchedSelect}>
                                          <option value="Left Side">Left Side</option>
                                          <option value="Right Side">Right Side</option>
                                          <option value="Front End">Front End</option>
                                          <option value="Back End">Back End</option>
                                        </select>
                                        <span className={styles.selectArrow}><ChevronDownIcon /></span>
                                      </div>

                                      <div className={`${styles.notchedField} ${styles.hasValue}`}>
                                        <label className={styles.notchedLabel}>Size</label>
                                        <select value={win.size || "30'x36'"} onChange={(e) => updateWindow(index, "size", e.target.value)} className={styles.notchedSelect}>
                                          <option value="30'x36'">30'x36'</option>
                                          <option value="24'x36'">24'x36'</option>
                                          <option value="36'x36'">36'x36'</option>
                                          <option value="Custom">Custom</option>
                                        </select>
                                        <span className={styles.selectArrow}><ChevronDownIcon /></span>
                                      </div>

                                      <div className={`${styles.notchedField} ${win.qty ? styles.hasValue : ""}`}>
                                        <label className={styles.notchedLabel}>Qty</label>
                                        <input type="number" value={win.qty ?? 1} onChange={(e) => updateWindow(index, "qty", Number(e.target.value) || 1)} placeholder="Qty" className={styles.notchedInput} />
                                      </div>
                                    </div>

                                    <div className={styles.doorCheckboxRow}>
                                      <label className={styles.doorCheckboxItem}>
                                        <input type="checkbox" checked={Boolean(win.custom)} onChange={(e) => updateWindow(index, "custom", e.target.checked)} />
                                        <span>Custom</span>
                                      </label>
                                    </div>

                                    <div className={styles.doorNotesRow}>
                                      <div className={`${styles.notchedField} ${win.notes ? styles.hasValue : ""}`}>
                                        <label className={styles.notchedLabel}>Notes</label>
                                        <input type="text" value={win.notes || ""} onChange={(e) => updateWindow(index, "notes", e.target.value)} placeholder="Notes" className={styles.notchedInput} />
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                <div className={styles.addDoorAction}>
                                  <button type="button" className={styles.addDoorBtn} onClick={addWindow}>
                                    <PlusIcon />
                                    <span>Add Another Window</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Color Options --- Figma accordion */}
                        <div className={styles.accordionItem}>
                          <button type="button" className={styles.accordionHeader} onClick={() => toggleAccordion("color")}>
                            <span>Color Options</span>
                            <span className={styles.accordionIconBox}>{accordions.color ? <MinusIcon /> : <PlusIcon />}</span>
                          </button>
                          {accordions.color && (
                            <div className={styles.accordionBody}>
                              <div className="panel_body_inter">
                                <div className="multiple_option">
                                  <div className={styles.grid2Cols}>
                                    <div className={`${styles.notchedField} ${colorOptions?.roofColor ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>Roof Color</label>
                                      <input type="text" name="roof_color" value={colorOptions?.roofColor || ""} onChange={(e) => updateColorOption("roofColor", e.target.value)} placeholder="Roof Color" className={styles.notchedInput} />
                                    </div>
                                    <div className={`${styles.notchedField} ${colorOptions?.wallColor ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>Wall Color</label>
                                      <input type="text" name="wall_color" value={colorOptions?.wallColor || ""} onChange={(e) => updateColorOption("wallColor", e.target.value)} placeholder="Wall Color" className={styles.notchedInput} />
                                    </div>
                                    <div className={`${styles.notchedField} ${colorOptions?.trimColor ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>Trim Color</label>
                                      <input type="text" name="trim_color" value={colorOptions?.trimColor || ""} onChange={(e) => updateColorOption("trimColor", e.target.value)} placeholder="Trim Color" className={styles.notchedInput} />
                                    </div>
                                    <div className={`${styles.notchedField} ${colorOptions?.garageDoorColor ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>Garage Door Color</label>
                                      <input type="text" name="garage_door_color" value={colorOptions?.garageDoorColor || ""} onChange={(e) => updateColorOption("garageDoorColor", e.target.value)} placeholder="Garage Door Color" className={styles.notchedInput} />
                                    </div>
                                    <div className={`${styles.notchedField} ${colorOptions?.wainscoat ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>Wainscoat</label>
                                      <input type="text" name="wainscoat" value={colorOptions?.wainscoat || ""} onChange={(e) => updateColorOption("wainscoat", e.target.value)} placeholder="Wainscoat" className={styles.notchedInput} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className={styles.accordionItem}>
                          <button type="button" className={styles.accordionHeader} onClick={() => toggleAccordion("other")}>
                            <span>Other Options</span>
                            <span className={styles.accordionIconBox}>{accordions.other ? <MinusIcon /> : <PlusIcon />}</span>
                          </button>
                          {accordions.other && (
                            <div className={styles.accordionBody}>
                              <div className="panel_body_inter">
                                <div className="multiple_option">
                                  <div className={styles.grid2Cols}>
                                    <div className={`${styles.notchedField} ${otherOptions?.gaugePanel ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>Gauge Panel</label>
                                      <input type="text" name="gauge_panel" value={otherOptions?.gaugePanel || ""} onChange={(e) => updateOtherOption("gaugePanel", e.target.value)} placeholder="Gauge Panel" className={styles.notchedInput} />
                                    </div>
                                    <div className={`${styles.notchedField} ${otherOptions?.jTrim ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>JTrim</label>
                                      <input type="text" name="jtrim" value={otherOptions?.jTrim || ""} onChange={(e) => updateOtherOption("jTrim", e.target.value)} placeholder="JTrim" className={styles.notchedInput} />
                                    </div>
                                    <div className={`${styles.notchedField} ${otherOptions?.extraAnchors ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>Extra Anchors</label>
                                      <input type="text" name="extra_anchors" value={otherOptions?.extraAnchors || ""} onChange={(e) => updateOtherOption("extraAnchors", e.target.value)} placeholder="Extra Anchors" className={styles.notchedInput} />
                                    </div>
                                    <div className={`${styles.notchedField} ${otherOptions?.extraBraces ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>Extra Braces</label>
                                      <input type="text" name="extra_braces" value={otherOptions?.extraBraces || ""} onChange={(e) => updateOtherOption("extraBraces", e.target.value)} placeholder="Extra Braces" className={styles.notchedInput} />
                                    </div>
                                    <div className={`${styles.notchedField} ${otherOptions?.extraBow ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>Extra Bow</label>
                                      <input type="text" name="extra_bow" value={otherOptions?.extraBow || ""} onChange={(e) => updateOtherOption("extraBow", e.target.value)} placeholder="Extra Bow" className={styles.notchedInput} />
                                    </div>
                                    <div className={`${styles.notchedField} ${otherOptions?.trussUpgraded ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>Truss Upgraded</label>
                                      <input type="text" name="truss_upgrade" value={otherOptions?.trussUpgraded || ""} onChange={(e) => updateOtherOption("trussUpgraded", e.target.value)} placeholder="Truss Upgraded" className={styles.notchedInput} />
                                    </div>
                                    <div className={`${styles.notchedField} ${otherOptions?.coloredScrews ? styles.hasValue : ""}`}>
                                      <label className={styles.notchedLabel}>Colored Screws</label>
                                      <input type="text" name="colored_screws" value={otherOptions?.coloredScrews || ""} onChange={(e) => updateOtherOption("coloredScrews", e.target.value)} placeholder="Colored Screws" className={styles.notchedInput} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    {isEdit && (
                      <section id="all-quotes" className={styles.quotesSectionWrap}>
                        <div className={styles.quotesHeaderRow}>
                          <div className={styles.quotesTitleGroup}>
                            <div className={styles.quotesAccentBar} />
                            <h3 className={styles.quotesTitle}>All Quotes</h3>
                          </div>

                          <div className={styles.createQuoteDropdownWrap} ref={quoteMenuRef}>
                            <button
                              type="button"
                              className={styles.createQuoteBtn}
                              onClick={() => setShowQuoteMenu((prev) => !prev)}
                            >
                              <span className={styles.plusSign}>+</span>
                              <span>Create Quote</span>
                            </button>

                            {showQuoteMenu && (
                              <div className={styles.quoteDropdownMenu}>
                                <button
                                  type="button"
                                  className={styles.quoteDropdownItem}
                                  onClick={() => {
                                    setShowQuoteMenu(false);
                                    setShowQuickQuoteModal(true);
                                  }}
                                >
                                  <QuickQuoteIcon />
                                  <span>Quick Quote</span>
                                </button>
                                <button
                                  type="button"
                                  className={styles.quoteDropdownItem}
                                  onClick={() => {
                                    setShowQuoteMenu(false);
                                  }}
                                >
                                  <QuoteWithLeadIcon />
                                  <span>Quote With Lead</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {loadingQuotes ? (
                          <div className={styles.emptyBoxAlt}>
                            Loading quotes...
                          </div>
                        ) : quotesList.length === 0 ? (
                          <div className={styles.emptyQuoteCardBox}>
                            <div className={styles.emptyQuoteCircleIcon}>
                              <EmptyQuoteDocIcon />
                            </div>
                            <h4 className={styles.emptyQuoteTitle}>No Quote Created Yet</h4>
                            <p className={styles.emptyQuoteSubtitle}>
                              Create your first contract to formalize agreements and track deal progress.
                            </p>
                          </div>
                        ) : (
                          <div className={styles.quoteRowList}>
                            {quotesList.map((quote, idx) => {
                              const quoteTitle = quote.name || (quote.quoteNumber ? `${quote.quoteNumber}` : `Quote ${idx + 1}`);
                              const isMenuOpen = activeQuoteDropdownId === (quote._id || idx);
                              const isShared = (quote.sharedWith || []).length > 0;
                              const myId = currentUser?._id || currentUser?.id || null;
                              const isRecipient = !!myId && (quote.sharedWith || []).some((s) => String(s?.user?._id || s?.user?.id || s?.user) === String(myId));

                              return (
                                <Fragment key={quote._id || idx}>
                                <div
                                  className={styles.quoteRowCard}
                                >
                                  <span className={quoteShareStyles.quoteTitleGroup}>
                                    <span className={styles.quoteRowTitle}>
                                      {quoteTitle}
                                    </span>
                                    {isShared && (
                                      <span className={quoteShareStyles.quoteSentBadge}>Quote Sent</span>
                                    )}
                                  </span>

                                  <div className={styles.quoteRowMenuWrap}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveQuoteDropdownId((prev) => (prev === (quote._id || idx) ? null : (quote._id || idx)));
                                      }}
                                      className={styles.quoteRowMenuBtn}
                                      title="Options"
                                    >
                                      •••
                                    </button>

                                    {isMenuOpen && (
                                      <div
                                        ref={activeQuoteDropdownRef}
                                        className={styles.quoteRowDropdown}
                                      >
                                        {isRecipient ? (
                                          <a
                                            href={withBasePath(`/quotes/view?leadId=${leadId}&quoteId=${quote._id}&template=${quote.templateId?._id || quote.templateId || ""}`)}
                                            target="_blank"
                                            className={styles.quoteMenuBtn}
                                            onClick={() => {
                                              setActiveQuoteDropdownId(null);
                                            }}
                                          >
                                            <ViewQuoteMenuIcon />
                                            <span>View Quote</span>
                                          </a>
                                        ) : (
                                        <a
                                          href={withBasePath(`/quotes/editor?leadId=${leadId}&quoteId=${quote._id}&template=${quote.templateId?._id || quote.templateId || ""}`)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={styles.quoteMenuBtn}
                                          onClick={() => {
                                            setActiveQuoteDropdownId(null);
                                          }}
                                        >
                                          <EditQuoteMenuIcon />
                                          <span>Edit Quote</span>
                                        </a>
                                        )}
                                        {!isRecipient && (
                                        <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveQuoteDropdownId(null);
                                            setShareQuoteTarget(quote);
                                          }}
                                          className={styles.quoteMenuBtn}
                                        >
                                          <ShareQuoteMenuIcon />
                                          <span>{isShared ? "Reshare Quote" : "Share Quote"}</span>
                                        </button>
                                        <button
                                          type="button"
                                          className={styles.quoteMenuBtn}
                                          onClick={() => {
                                            setActiveQuoteDropdownId(null);
                                            setEmailQuoteTarget(quote);
                                          }}
                                        >
                                          <EmailToLeadMenuIcon />
                                          <span>Email to Lead</span>
                                        </button>
                                        </>
                                        )}
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            setActiveQuoteDropdownId(null);
                                            const toast = useToastStore.getState();
                                            try {
                                              const templateId = quote.templateId?._id || quote.templateId || "standard";
                                              const blob = await quotesApi.createQuotePdf(leadId, templateId);
                                              const url = window.URL.createObjectURL(blob);
                                              const a = document.createElement("a");
                                              a.href = url;
                                              a.download = `${quoteTitle}.pdf`;
                                              document.body.appendChild(a);
                                              a.click();
                                              a.remove();
                                              window.URL.revokeObjectURL(url);
                                              toast.success("Quote PDF downloaded");
                                            } catch (err) {
                                              toast.error(err?.message || "Failed to download quote PDF.");
                                            }
                                          }}
                                          className={styles.quoteMenuBtn}
                                        >
                                          <DownloadMenuIcon />
                                          <span>Download</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {(quote.sharedWith || []).map((share, shareIdx) => (
                                  <QuoteShareStrip
                                    key={String(share._id || share.id || `${quote._id}-${shareIdx}`)}
                                    share={share}
                                    onSendMessage={(text) => handleSendQuoteMessage(quote, text)}
                                  />
                                ))}
                                </Fragment>
                              );
                            })}
                          </div>
                        )}

                        {/* ── Extracted Select Quote Type Modal Component ────────── */}
                        <SelectQuoteTypeModal
                          isOpen={showQuickQuoteModal}
                          leadId={leadId}
                          onClose={() => setShowQuickQuoteModal(false)}
                          onContinue={() => {
                            setShowQuickQuoteModal(false);
                          }}
                        />

                        {/* ── Share Quote for Approval Modal ─────────────────────── */}
                        {shareQuoteTarget && (
                          <ShareQuoteModal
                            isOpen
                            quote={shareQuoteTarget}
                            onClose={() => setShareQuoteTarget(null)}
                            onShared={fetchQuotes}
                          />
                        )}

                        {/* ── Email Quote to Lead Modal ──────────────────────── */}
                        {emailQuoteTarget && (
                          <EmailQuoteModal
                            isOpen
                            quote={emailQuoteTarget}
                            quotes={quotesList}
                            leadEmail={formData.email || formData.alternateEmail || ""}
                            onClose={() => setEmailQuoteTarget(null)}
                          />
                        )}
                      </section>
                    )}

                    {/* ── Section 7: All Contracts ──────────────────── */}
                    {isEdit && (
                      <ContractsSection
                        leadId={leadId}
                        quotes={quotesList}
                        loadingQuotes={loadingQuotes}
                        leadEmail={formData.email || formData.alternateEmail || ""}
                        manufacturer={manufacturerName}
                        manufacturers={manufacturerSelectOptions}
                        manufacturersLoading={loadingManufacturers}
                        onLeadStatusChanged={(stage) => updateField("leadStatus", stage)}
                      />
                    )}

                    {/* ── Section 8: Invoices (Placeholder) ───────────────────────── */}
                    {isEdit && (
                      <section id="invoices" className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                          <div className={styles.sectionTitleGroup}>
                            <span className={styles.accentMarker} />
                            <h3 className={styles.sectionTitle}>Invoices</h3>
                          </div>
                        </div>
                        <div className={styles.emptyBox}>
                          <p className={styles.emptyBoxText}>No invoices generated yet.</p>
                        </div>
                      </section>
                    )}

                    {/* ── Section 9: Task/Activities (Placeholder) ─────────────────── */}
                    {isEdit && (
                      <section id="task-activities" className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                          <div className={styles.sectionTitleGroup}>
                            <span className={styles.accentMarker} />
                            <h3 className={styles.sectionTitle}>Task / Activities</h3>
                          </div>
                        </div>
                        <div className={styles.emptyBox}>
                          <p className={styles.emptyBoxText}>No pending tasks or activities.</p>
                        </div>
                      </section>
                    )}

                    <section id="attachments" className={styles.formSection}>
                      <div className={styles.attachSectionWrap}>

                        {/* Header row: title left, Add New button right */}
                        <div className={styles.attachHeaderRow}>
                          <div className={styles.attachTitleGroup}>
                            <span className={styles.accentMarker} />
                            <h3 className={styles.sectionTitle}>Attachments</h3>
                          </div>
                          <label className={styles.attachAddNewBtn} htmlFor="attach-file-input">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <path d="M6.75 5.625V0H5.625V5.625H0V6.75H5.625V12.375H6.75V6.75H12.375V5.625H6.75Z" fill="white" fillOpacity="0.9" />
                            </svg>
                            Add New
                            <input
                              id="attach-file-input"
                              type="file"
                              ref={fileInputRef}
                              multiple
                              onChange={handleFileUpload}
                              className={styles.attachHiddenInput}
                            />
                          </label>
                        </div>

                        {/* Body */}
                        <div className={styles.attachBody}>
                          {files.length === 0 ? (
                            <div className="empty_contract_div">
                              <div className="empty_contract_svg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
                                  <path d="M32.0043 19.9492H25.9374C24.8595 19.9492 23.9824 19.0722 23.9824 17.9942V10.3066C23.9824 9.22864 24.8594 8.35156 25.9374 8.35156H32.0043C33.0823 8.35156 33.9593 9.22855 33.9593 10.3066V17.9942C33.9593 19.0722 33.0823 19.9492 32.0043 19.9492ZM25.9375 10.2424C25.902 10.2424 25.8731 10.2712 25.8731 10.3067V17.9944C25.8731 18.0298 25.902 18.0587 25.9375 18.0587H32.0044C32.0399 18.0587 32.0688 18.0298 32.0688 17.9944V10.3067C32.0688 10.2712 32.0399 10.2424 32.0044 10.2424H25.9375Z" fill="white" fillOpacity="0.4" />
                                  <path d="M34.9071 3.49534H16.7228V2.91938C16.7228 1.3096 15.4132 0 13.8034 0H13.6967C12.0869 0 10.7773 1.3096 10.7773 2.91938V3.49534H9.09277C7.14998 3.49534 5.56934 5.07598 5.56934 7.01877V40.4766C5.56934 42.4194 7.14998 44 9.09277 44H34.9071C36.8499 44 38.4305 42.4194 38.4305 40.4766V7.01877C38.4305 5.07598 36.8499 3.49534 34.9071 3.49534ZM12.6679 2.91938C12.6679 2.35211 13.1293 1.89062 13.6966 1.89062H13.8034C14.3706 1.89062 14.8322 2.35211 14.8322 2.91938V3.49534H12.6679V2.91938ZM36.5399 40.4766C36.5399 41.3769 35.8075 42.1094 34.9071 42.1094H9.09269C8.19232 42.1094 7.45988 41.3769 7.45988 40.4766V7.01877C7.45988 6.11841 8.19232 5.38596 9.09269 5.38596H14.8322V8.20557C14.8322 8.77284 14.3706 9.23441 13.8034 9.23441H13.6966C13.1293 9.23441 12.6679 8.77284 12.6679 8.20557C12.6679 7.6835 12.2446 7.26026 11.7225 7.26026C11.2005 7.26026 10.7772 7.6835 10.7772 8.20557C10.7772 9.81535 12.0868 11.125 13.6966 11.125H13.8034C15.4131 11.125 16.7228 9.81535 16.7228 8.20557V5.38596H34.907C35.8074 5.38596 36.5398 6.11841 36.5398 7.01877V40.4766H36.5399Z" fill="white" fillOpacity="0.6" />
                                  <path d="M11.7227 15.7744H18.4721C18.9942 15.7744 19.4174 15.3512 19.4174 14.8291C19.4174 14.307 18.9942 13.8838 18.4721 13.8838H11.7227C11.2006 13.8838 10.7773 14.307 10.7773 14.8291C10.7773 15.3512 11.2006 15.7744 11.7227 15.7744Z" fill="white" fillOpacity="0.6" />
                                  <path d="M11.7227 19.9492H20.0328C20.5549 19.9492 20.9781 19.526 20.9781 19.0039C20.9781 18.4818 20.5549 18.0586 20.0328 18.0586H11.7227C11.2006 18.0586 10.7773 18.4818 10.7773 19.0039C10.7773 19.526 11.2006 19.9492 11.7227 19.9492Z" fill="white" fillOpacity="0.6" />
                                  <path d="M33.014 24.1738H11.7227C11.2006 24.1738 10.7773 24.5971 10.7773 25.1191C10.7773 25.6412 11.2006 26.0645 11.7227 26.0645H33.0139C33.536 26.0645 33.9592 25.6412 33.9592 25.1191C33.9592 24.5971 33.5361 24.1738 33.014 24.1738Z" fill="white" fillOpacity="0.6" />
                                  <path d="M33.014 28.3877H11.7227C11.2006 28.3877 10.7773 28.8109 10.7773 29.333C10.7773 29.8551 11.2006 30.2783 11.7227 30.2783H33.0139C33.536 30.2783 33.9592 29.8551 33.9592 29.333C33.9592 28.8109 33.5361 28.3877 33.014 28.3877Z" fill="white" fillOpacity="0.6" />
                                  <path d="M33.014 32.6016H11.7227C11.2006 32.6016 10.7773 33.0248 10.7773 33.5469C10.7773 34.0689 11.2006 34.4922 11.7227 34.4922H33.0139C33.536 34.4922 33.9592 34.0689 33.9592 33.5469C33.9592 33.0248 33.5361 32.6016 33.014 32.6016Z" fill="white" fillOpacity="0.6" />
                                  <path d="M20.4995 36.8154H11.7227C11.2006 36.8154 10.7773 37.2387 10.7773 37.7607C10.7773 38.2828 11.2006 38.7061 11.7227 38.7061H20.4995C21.0216 38.7061 21.4449 38.2828 21.4449 37.7607C21.4449 37.2387 21.0216 36.8154 20.4995 36.8154Z" fill="white" fillOpacity="0.6" />
                                </svg>
                              </div>
                              <div className="empty_contract_api">
                                <h2>No Attachments Yet</h2>
                                <p>Upload contracts, drawings, or supporting documents for this lead.</p>
                              </div>
                            </div>
                          ) : (
                            <div className={styles.attachFileList}>
                              {files.map((f, i) => (
                                <div key={i} className={styles.attachFileRow}>
                                  <span className={styles.attachFileIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                                      <path d="M11 1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V17C1 17.5304 1.21071 18.0391 1.58579 18.4142C1.96086 18.7893 2.46957 19 3 19H15C15.5304 19 16.0391 18.7893 16.4142 18.4142C16.7893 18.0391 17 17.5304 17 17V7L11 1Z" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M11 1V7H17" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </span>
                                  <span className={styles.attachFileName}>{f.name}</span>
                                  <button
                                    type="button"
                                    className={styles.attachDeleteBtn}
                                    onClick={() => removeFile(i)}
                                    title="Remove file"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="18" viewBox="0 0 15 18" fill="none">
                                      <path d="M15 3.75H13.75V16.25C13.75 16.5815 13.6182 16.8994 13.3838 17.1338C13.1494 17.3682 12.8315 17.5 12.5 17.5H2.5C2.16848 17.5 1.85063 17.3682 1.61621 17.1338C1.38179 16.8994 1.25 16.5815 1.25 16.25V3.75H0V2.5H15V3.75ZM2.5 16.25H12.5V3.75H2.5V16.25ZM6.25 13.75H5V6.25H6.25V13.75ZM10 13.75H8.75V6.25H10V13.75ZM10 0V1.25H5V0H10Z" fill="white" fillOpacity="0.8" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </section>

                    {/* ── Section 11: All Emails (Placeholder) ────────────────────── */}
                    {isEdit && (
                      <section id="all-emails" className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                          <div className={styles.sectionTitleGroup}>
                            <span className={styles.accentMarker} />
                            <h3 className={styles.sectionTitle}>All Emails</h3>
                          </div>
                        </div>
                        <div className={styles.emptyBox}>
                          <p className={styles.emptyBoxText}>No emails logged for {formData.email || "this lead"}.</p>
                        </div>
                      </section>
                    )}

                    {/* ── Section 12: Call Activity (Placeholder) ─────────────────── */}
                    {isEdit && (
                      <section id="call-activity" className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                          <div className={styles.sectionTitleGroup}>
                            <span className={styles.accentMarker} />
                            <h3 className={styles.sectionTitle}>Call Activity</h3>
                          </div>
                        </div>
                        <div className={styles.emptyBox}>
                          <p className={styles.emptyBoxText}>No call recordings or logs available.</p>
                        </div>
                      </section>
                    )}

                    {/* Bottom Spacer so Call Activity can fully scroll into clear view */}
                    <div className={styles.scrollBottomSpacer} aria-hidden="true" />
                  </div>
                </div>
              </form>
            )}

          </main>

          {/* ─── Column 3: Right Sidebar (Edit View Only) ────────────────────── */}
          {isEdit && (
            <aside className={styles.editRightSidebar}>
              <div className={styles.activityPanel}>
                {/* Contact Info Card */}
                <div className={styles.infoSection}>
                  <h4 className={styles.infoTitle}>Contact Info</h4>
                  <div className={styles.infoRow}>
                    <div className={styles.infoIconBox}>
                      <MailIcon width={16} height={16} />
                    </div>
                    <span className={styles.infoText}>{formData.email || "henry@advancedtech.com"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoIconBox}>
                      <PhoneIcon width={16} height={16} />
                    </div>
                    <span className={styles.infoText}>{formData.mobileNumber || formData.phone || "+1 802-262-5497"}</span>
                  </div>
                </div>

                {/* Recent Updates */}
                <div className={styles.recentUpdatesSection}>
                  <div className={styles.recentUpdatesTitleRow}>
                    <span>Recent Updates</span>
                  </div>
                  <div className={styles.recentUpdatesList}>
                    {/* Box 1 (Quoted/Order Entry) */}
                    <div className={`${styles.updateBox} ${styles.updateBoxQuoted}`}>
                      <div className={styles.updateContent}>
                        <div className={`${styles.leadStatusTag} ${styles.tagPurple}`}>
                          <span>{formData.leadStatus || "Quoted/Order Entry"}</span>
                        </div>
                        <h4 className={styles.updateName}>
                          {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}`.trim() : "Henry Adams"}
                        </h4>
                        <div className={styles.updateDate}>{formattedDate()}</div>
                        <div className={styles.updateSource}>
                          <span className={styles.sourceLabel}>Source From - </span>
                          <span className={styles.sourceValue}>{formData.websiteSourceForm || "Zendesk Chat"}</span>
                        </div>
                      </div>
                      <button type="button" className={styles.updateTrashBtn} title="Delete">
                        <TrashIcon />
                      </button>
                    </div>

                    {/* Box 2 (Contract Sent) */}
                    <div className={styles.updateBox}>
                      <div className={styles.updateContent}>
                        <div className={`${styles.leadStatusTag} ${styles.tagGreen}`}>
                          <span>Contract Sent</span>
                        </div>
                        <h4 className={styles.updateName}>Samantha Ray</h4>
                        <div className={styles.updateDate}>Thu, Feb 19,2026, 2:45 PM</div>
                        <div className={styles.updateSource}>
                          <span className={styles.sourceLabel}>Source From - </span>
                          <span className={styles.sourceValue}>Social Media</span>
                        </div>
                      </div>
                    </div>

                    {/* Box 3 (New lead) */}
                    <div className={styles.updateBox}>
                      <div className={styles.updateContent}>
                        <div className={`${styles.leadStatusTag} ${styles.tagBlue}`}>
                          <span>New lead</span>
                        </div>
                        <h4 className={styles.updateName}>Oliver Gomez</h4>
                        <div className={styles.updateDate}>Thu, Feb 19,2026, 2:45 PM</div>
                        <div className={styles.updateSource}>
                          <span className={styles.sourceLabel}>Source From - </span>
                          <span className={styles.sourceValue}>Zendesk Chat</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>

      {/* ─── Toast Notifications ────────────────────────────────────────────── */}
      {successToast && (
        <div className={styles.toastSuccess}>
          {successToast}
        </div>
      )}
      {saveError && (
        <div className={styles.toastError}>
          ✕ {saveError}
        </div>
      )}

    </div>
  );
}

export default LeadForm;
