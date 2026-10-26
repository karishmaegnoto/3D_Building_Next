"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import { withBasePath } from "@/lib/constants";
import { contractsApi } from "@/lib/api/contracts";
import { usersApi } from "@/lib/api/users";
import { leadsApi } from "@/lib/api/leads";
import CreateContractModal from "./CreateContractModal";
import EmailContractModal from "./EmailContractModal";
import ShareContractModal from "./ShareContractModal";
import ContractShareStrip from "./ContractShareStrip";
import {
  API_PENDING_MESSAGE,
  DIGITAL_PAYMENT_MODE,
  PO_PAYMENT_MODE,
  contractLabel,
  paymentModeOptions,
} from "./contractData";
import styles from "./contractsSection.module.scss";

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M18.25,6h-15A1.25,1.25,0,0,0,2,7.25v10A1.25,1.25,0,0,0,3.25,18.5h15a1.25,1.25,0,0,0,1.25-1.25v-10A1.25,1.25,0,0,0,18.25,6ZM16.875,7.25,10.75,11.488,4.625,7.25ZM3.25,17.25V7.819l7.144,4.944a.625.625,0,0,0,.712,0L18.25,7.819V17.25Z"
        transform="translate(-0.75 -2.25)"
        fill="currentColor"
      />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="4" cy="9" r="1.6" fill="currentColor" />
      <circle cx="9" cy="9" r="1.6" fill="currentColor" />
      <circle cx="14" cy="9" r="1.6" fill="currentColor" />
    </svg>
  );
}

function EmptyDocIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.5 13h7M8.5 16.5h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8l7.6-4.3M8.2 13.2l7.6 4.3" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 3h2v8.17l2.59-2.58L17 10l-5 5-5-5 1.41-1.41L11 11.17V3z" />
      <path d="M5 19h14v2H5z" />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 13.5l5 5M14.5 13.5l-5 5" />
    </svg>
  );
}

function VoidIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20h16" />
      <path d="M6.5 15.5l8-8 3 3-8 8H6.5v-3z" />
    </svg>
  );
}

function ViewIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M19.713 11.662A10.431 10.431 0 0 0 10.375 5a10.431 10.431 0 0 0-9.338 6.662.625.625 0 0 0 0 .425 10.431 10.431 0 0 0 9.337 6.662 10.431 10.431 0 0 0 9.338-6.662.625.625 0 0 0 0-.425ZM10.375 17.5a9.281 9.281 0 0 1-8.081-5.625A9.281 9.281 0 0 1 10.375 6.25a9.281 9.281 0 0 1 8.081 5.625A9.281 9.281 0 0 1 10.375 17.5Z" transform="translate(-0.375 -1.875)" fill="currentColor" />
      <path d="M13.75 10a3.75 3.75 0 1 0 3.75 3.75A3.75 3.75 0 0 0 13.75 10Zm0 6.25a2.5 2.5 0 1 1 2.5-2.5A2.5 2.5 0 0 1 13.75 16.25Z" transform="translate(-3.75 -3.75)" fill="currentColor" />
    </svg>
  );
}

const ROW_ACTIONS = [
  { key: "edit", label: "Edit", Icon: EditIcon },
  { key: "share", label: "Share Contract", Icon: ShareIcon },
  { key: "download", label: "Download", Icon: DownloadIcon },
  { key: "cancel", label: "Cancel", Icon: CancelIcon },
  { key: "void", label: "Void", Icon: VoidIcon },
];

// Same as quotes: a share recipient only gets View + Download.
const RECIPIENT_ACTIONS = [
  { key: "view", label: "View Contract", Icon: ViewIcon },
  { key: "download", label: "Download", Icon: DownloadIcon },
];

const fetchContracts = async (leadId, signal) => {
  const res = await contractsApi.getContractsList(leadId, signal ? { signal } : {});
  return Array.isArray(res?.results) ? res.results : [];
};

export function ContractsSection({
  leadId,
  quotes,
  loadingQuotes,
  leadEmail,
  manufacturer,
  manufacturers = [],
  manufacturersLoading = false,
  onLeadStatusChanged,
}) {
  const toastInfo = useToastStore((s) => s.info);
  const toastSuccess = useToastStore((s) => s.success);
  const toastError = useToastStore((s) => s.error);
  const currentUser = useAuthStore((s) => s.user);
  const myId = currentUser?._id || currentUser?.id || null;
  const router = useRouter();

  const quoteList = Array.isArray(quotes) ? quotes : [];
  const manufacturerOptions = Array.isArray(manufacturers) ? manufacturers : [];

  const contractsQuery = useQuery({
    queryKey: ["contracts", leadId],
    queryFn: ({ signal }) => fetchContracts(leadId, signal),
    enabled: Boolean(leadId),
  });
  const loadingContracts = contractsQuery.isLoading;
  // Users cache resolves sharedWith names (contract list leaves them as ids).
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: ({ signal }) => usersApi.getUsers({}, { signal }),
    staleTime: 30_000,
  });
  const usersById = useMemo(() => {
    const map = new Map();
    const list = usersQuery.data?.users;
    if (Array.isArray(list)) {
      for (const u of list) {
        const id = u?._id || u?.id;
        if (id) map.set(String(id), u);
      }
    }
    return map;
  }, [usersQuery.data]);
  const resolvePerson = (ref) => {
    if (ref && typeof ref === "object") return ref;
    return usersById.get(String(ref)) || ref;
  };
  const contracts = useMemo(() => {
    const rows = Array.isArray(contractsQuery.data) ? contractsQuery.data : [];
    return rows.map((item, idx) => {
      const id = String(item?._id || item?.id || `contract-${idx}`);
      const status = item?.status || "";
      const isCancelled = status === "Cancelled" || Boolean(item?.isCancel) || Boolean(item?.isCancelled);
      const isVoid = status === "Void" || status === "Voidlead" || Boolean(item?.isVoid);
      return {
        id,
        contractId: String(item?._id || item?.id || ""),
        name: `Contract ${idx + 1}`,
        status,
        signDate: "",
        paymentMode: DIGITAL_PAYMENT_MODE,
        quoteId: item?.quoteId ? String(item.quoteId) : "",
        manufacturerId: item?.manufacturerId ? String(item.manufacturerId) : "",
        templateId: item?.templateId ? String(item.templateId) : "",
        fields: item?.fields || {},
        sharedWith: (Array.isArray(item?.sharedWith) ? item.sharedWith : []).map((s) => ({
          ...s,
          user: resolvePerson(s?.user),
          sharedBy: resolvePerson(s?.sharedBy),
          messages: (Array.isArray(s?.messages) ? s.messages : []).map((m) => ({
            ...m,
            sender: resolvePerson(m?.sender),
          })),
        })),
        // Both flag names: email modal filters on isCancelled/isVoid.
        isCancel: isCancelled,
        isCancelled,
        isVoid,
      };
    });
  }, [contractsQuery.data, usersById]);
  const [paymentMode, setPaymentMode] = useState(DIGITAL_PAYMENT_MODE);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const menuRef = useRef(null);

  const preferredManufacturerId =
    manufacturerOptions.find(
      (opt) => opt.label.trim().toLowerCase() === String(manufacturer || "").trim().toLowerCase()
    )?.value || "";

  const showCreateBtn = !loadingQuotes && quoteList.length > 0;
  const hasContracts = contracts.length > 0;

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

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };


  const handleCreateSubmit = ({ quoteId, manufacturerId, templateId }) => {
    setCreateOpen(false);
    const params = new URLSearchParams({
      ...(leadId ? { leadId: String(leadId) } : {}),
      quoteId: String(quoteId || ""),
      manufacturerId: String(manufacturerId || ""),
      template: String(templateId || ""),
    });
    router.push(`/contracts/editor?${params.toString()}`);
  };

  const handleEmailSend = async (payload) => {
    try {
      await contractsApi.sendContractEmail(
        {
          ...payload,
          frontendUrl: `${window.location.origin}/crm/contracts`,
        },
        payload.files
      );
      setEmailOpen(false);
      toastSuccess("Contract email sent successfully.");
    } catch (err) {
      throw err;
    }
  };

  // Same as quotes: message-only update resolves the share by current user.
  const handleSendContractMessage = async (contract, text) => {
    const id = contract?.contractId;
    if (!id || String(text || "").trim() === "") return;
    try {
      const res = await contractsApi.updateContractShare({
        contractId: id,
        message: String(text).trim(),
      });
      toastSuccess(res?.message || "Message sent successfully");
      contractsQuery.refetch();
    } catch (err) {
      toastError(err?.message || "Failed to send message.");
    }
  };

  const isRecipientOf = (contract) =>
    !!myId &&
    (contract?.sharedWith || []).some(
      (s) => String(s?.user?._id || s?.user?.id || s?.user) === String(myId)
    );

  const openInEditor = (contract) => {
    const params = new URLSearchParams({
      ...(leadId ? { leadId: String(leadId) } : {}),
      quoteId: String(contract.quoteId || ""),
      manufacturerId: String(contract.manufacturerId || ""),
      template: String(contract.templateId || ""),
      ...(contract.contractId ? { contractId: contract.contractId } : {}),
    });
    router.push(`/contracts/edit?${params.toString()}`);
  };

  const handleDownload = async (contract) => {
    if (!contract?.quoteId || !contract?.templateId) {
      toastInfo("Contract details are missing. Please create the contract again.");
      return;
    }
    try {
      toastInfo("Preparing contract download...");
      const docs = await contractsApi.getContractDocuments({
        quoteId: contract.quoteId,
        manufacturerId: contract.manufacturerId || null,
        contractTemplateId: contract.templateId,
        contractId: contract.contractId || null,
      });
      const fileUrl = docs?.results?.contract?.fileUrl;
      if (!fileUrl) throw new Error("Contract PDF is not available yet.");
      const blob = await contractsApi.getContractPdf(fileUrl);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${contract.name || "Contract"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toastInfo(err?.message || "Failed to download contract.");
    }
  };

  const handleShareSucceeded = async () => {
    contractsQuery.refetch();
    if (!leadId) return;
    try {
      await leadsApi.updateLead(String(leadId), { leadStatus: "Contract Sent" });
      if (onLeadStatusChanged) onLeadStatusChanged("Contract Sent");
    } catch (err) {
      toastError(err?.message || "Contract shared, but lead status did not update.");
    }
  };

  const handleRowAction = (action, contract) => {
    setActiveMenuId(null);
    if (action === "view" && contract?.quoteId && contract?.templateId) {
      const params = new URLSearchParams({
        ...(leadId ? { leadId: String(leadId) } : {}),
        quoteId: String(contract.quoteId || ""),
        manufacturerId: String(contract.manufacturerId || ""),
        template: String(contract.templateId || ""),
        ...(contract.contractId ? { contractId: contract.contractId } : {}),
      });
      window.open(withBasePath(`/contracts/view?${params.toString()}`), "_blank");
      return;
    }
    if (action === "edit" && contract?.quoteId && contract?.templateId) {
      openInEditor(contract);
      return;
    }
    if (action === "download") {
      handleDownload(contract);
      return;
    }
    if (action === "share") {
      setShareTarget(contract);
      return;
    }
    if (action === "cancel" || action === "void") {
      handleStatusChange(contract, action === "cancel" ? "Cancelled" : "Void");
      return;
    }
    toastInfo(API_PENDING_MESSAGE);
  };

  const handleStatusChange = async (contract, status) => {
    if (!contract?.contractId || !leadId || !contract?.quoteId || !contract?.templateId) {
      toastError("Cannot update contract: details are missing.");
      return;
    }
    try {
      toastInfo(status === "Cancelled" ? "Cancelling contract..." : "Voiding contract...");
      await contractsApi.updateContract({
        contractId: contract.contractId,
        leadId: String(leadId),
        quoteId: String(contract.quoteId),
        templateId: String(contract.templateId),
        status,
      });
      toastSuccess(
        status === "Cancelled" ? "Contract cancelled." : "Contract voided."
      );
      contractsQuery.refetch();
    } catch (err) {
      toastError(err?.message || "Failed to update contract.");
    }
  };

  const handlePaymentMode = (value) => {
    setPaymentMode((prev) => (prev === value ? "" : value));
  };

  return (
    <section id="all-contracts" className={styles.section}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <span className={styles.accentBar} />
          <h3 className={styles.title}>All Contracts</h3>
        </div>
        {showCreateBtn && (
          <button type="button" className={styles.createBtn} onClick={handleOpenCreate}>
            <PlusIcon />
            <span>Create Contract</span>
          </button>
        )}
      </div>

      {!hasContracts ? (
        <div className={styles.emptyBox}>
          <div className={styles.emptyIcon}>
            <EmptyDocIcon />
          </div>
          <h4 className={styles.emptyTitle}>No Contract Created Yet</h4>
          <p className={styles.emptyText}>
            {loadingContracts
              ? "Loading contracts..."
              : showCreateBtn
                ? "Create your first contract to formalize agreements and track deal progress."
                : "Create a quote first, then convert it into a contract."}
          </p>
        </div>
      ) : (
        <div className={styles.contentWrap}>
          <div className={styles.rowList}>
            {contracts.map((contract, idx) => {
              const contractId = contract.id || String(idx);
              const isMenuOpen = activeMenuId === contractId;
              const rowActions = isRecipientOf(contract)
                ? RECIPIENT_ACTIONS
                : ROW_ACTIONS.filter((item) => {
                    if (item.key === "cancel" && contract.isCancelled) return false;
                    if (item.key === "void" && contract.isVoid) return false;
                    return true;
                  });
              const isShared = (contract.sharedWith || []).length > 0;
              return (
                <Fragment key={contractId}>
                <div className={styles.rowCard}>
                  <div className={styles.rowMain}>
                    <span className={styles.rowTitle}>{contractLabel(contract, idx)}</span>
                    {isShared ? (
                      <span className={styles.badge}>Contract Sent</span>
                    ) : null}
                    {contract.isCancelled ? (
                      <span className={`${styles.badge} ${styles.badgeDanger}`}>Cancelled</span>
                    ) : null}
                    {contract.isVoid ? (
                      <span className={`${styles.badge} ${styles.badgeDanger}`}>Void Lead</span>
                    ) : null}
                    {contract.signDate ? (
                      <span className={styles.signDate}>Sign Date-Time: {contract.signDate}</span>
                    ) : null}
                  </div>
                  <div className={styles.menuWrap} ref={isMenuOpen ? menuRef : undefined}>
                    <button
                      type="button"
                      className={styles.menuBtn}
                      aria-haspopup="menu"
                      aria-expanded={isMenuOpen}
                      aria-label="Contract actions"
                      onClick={() => setActiveMenuId(isMenuOpen ? null : contractId)}
                    >
                      <DotsIcon />
                    </button>
                    {isMenuOpen && (
                      <div className={styles.menu} role="menu">
                        {rowActions.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            role="menuitem"
                            className={styles.menuItem}
                            onClick={() => handleRowAction(item.key, contract)}
                          >
                            <item.Icon />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {(contract.sharedWith || []).map((share, shareIdx) => (
                  <ContractShareStrip
                    key={String(share._id || share.id || `${contractId}-${shareIdx}`)}
                    share={share}
                    onSendMessage={(text) => handleSendContractMessage(contract, text)}
                  />
                ))}
                </Fragment>
              );
            })}
          </div>

          <div className={styles.cardBox}>
            <h4 className={styles.cardTitle}>Payment Mode</h4>
            <div className={styles.checkRow}>
              {paymentModeOptions.map((mode) => (
                <label className={styles.checkItem} key={mode.value}>
                  <input
                    type="checkbox"
                    checked={paymentMode === mode.value}
                    onChange={() => handlePaymentMode(mode.value)}
                  />
                  <span>{mode.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.cardBox}>
            <label className={styles.checkItem}>
              <input
                type="checkbox"
                checked={paymentMode === PO_PAYMENT_MODE}
                onChange={() => handlePaymentMode(PO_PAYMENT_MODE)}
              />
              <span>PO</span>
              <span className={styles.checkHint}>
                (If Down payment is 0 (ZERO) we need to get the PO amount.)
              </span>
            </label>
          </div>

          <button type="button" className={styles.emailBtn} onClick={() => setEmailOpen(true)}>
            <MailIcon />
            <span>Email Contract</span>
          </button>
        </div>
      )}

      {createOpen && (
        <CreateContractModal
          isOpen
          quotes={quoteList}
          manufacturers={manufacturerOptions}
          loadingManufacturers={manufacturersLoading}
          defaultManufacturerId={preferredManufacturerId}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {emailOpen && (
        <EmailContractModal
          isOpen
          contracts={contracts}
          leadEmail={leadEmail}
          onClose={() => setEmailOpen(false)}
          onSend={handleEmailSend}
        />
      )}

      {shareTarget && (
        <ShareContractModal
          isOpen
          contract={shareTarget}
          onClose={() => setShareTarget(null)}
          onShared={() => handleShareSucceeded()}
        />
      )}
    </section>
  );
}

export default ContractsSection;
