"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Drawer, { DrawerTabs } from "@/components/shared/Drawer";
import { useApprovals } from "./useApprovals";
import { useContractApprovals } from "@/components/modules/contracts/useContractApprovals";
import { useApprovalReadStore, isApprovalUnread } from "@/store/approvalReadStore";

function ApprovalGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="16" y="4" width="40" height="52" rx="3" stroke="#fff" strokeOpacity="0.8" strokeWidth="3.5" fill="none" />
      <line x1="25" y1="19" x2="42" y2="19" stroke="#fff" strokeOpacity="0.8" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="28" y1="31" x2="42" y2="31" stroke="#fff" strokeOpacity="0.8" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="34" y1="44" x2="42" y2="44" stroke="#fff" strokeOpacity="0.8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M46 15L50 20L57 11" stroke="#fff" strokeOpacity="0.8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 27L50 32L57 23" stroke="#fff" strokeOpacity="0.8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 40L50 45L57 36" stroke="#fff" strokeOpacity="0.8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="44" r="14" fill="white" />
      <path d="M16 35C12 35 11 39 11 42V46C11 48 9 49 8 50H24C23 49 21 48 21 46V42C21 39 20 35 16 35Z" stroke="#000" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
      <path d="M14 52C14.5 54 17.5 54 18 52" stroke="#000" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function QuoteGlyph() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10.75,3.25a7.5,7.5,0,1,1-7.5,7.5,7.5,7.5,0,0,1,7.5-7.5m0-1.25a8.75,8.75,0,1,0,8.75,8.75A8.75,8.75,0,0,0,10.75,2Z" transform="translate(-0.75 -0.75)" fill="#211814" />
      <path d="M17.25,10.125V8.875h-2.5V7H13.5V8.875H12.25A1.251,1.251,0,0,0,11,10.125V12a1.251,1.251,0,0,0,1.25,1.25H16v1.875H11v1.25h2.5V18.25h1.25V16.375H16a1.251,1.251,0,0,0,1.25-1.25V13.25A1.251,1.251,0,0,0,16,12H12.25V10.125Z" transform="translate(-4.125 -2.625)" fill="#211814" />
    </svg>
  );
}

function ClockGlyph() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10.75,19.5a8.75,8.75,0,1,1,8.75-8.75,8.75,8.75,0,0,1-8.75,8.75Zm0-16.25a7.5,7.5,0,1,0,7.5,7.5A7.5,7.5,0,0,0,10.75,3.25Z" transform="translate(-0.75 -0.75)" fill="#6f625b" />
      <path d="M18.494,16.375,15,12.881V7h1.25v5.363l3.125,3.131Z" transform="translate(-5.625 -2.625)" fill="#6f625b" />
    </svg>
  );
}

function ViewGlyph() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M19.713,11.662A10.431,10.431,0,0,0,10.375,5a10.431,10.431,0,0,0-9.338,6.662.625.625,0,0,0,0,.425,10.431,10.431,0,0,0,9.337,6.662,10.431,10.431,0,0,0,9.338-6.662A.625.625,0,0,0,19.713,11.662ZM10.375,17.5a9.281,9.281,0,0,1-8.081-5.625A9.281,9.281,0,0,1,10.375,6.25a9.281,9.281,0,0,1,8.081,5.625A9.281,9.281,0,0,1,10.375,17.5Z" transform="translate(-0.375 -1.875)" fill="#211814" />
      <path d="M13.75,10a3.75,3.75,0,1,0,3.75,3.75A3.75,3.75,0,0,0,13.75,10Zm0,6.25a2.5,2.5,0,1,1,2.5-2.5A2.5,2.5,0,0,1,13.75,16.25Z" transform="translate(-3.75 -3.75)" fill="#211814" />
    </svg>
  );
}

function formatTime(value) {
  const timestamp = new Date(value).getTime();
  if (!timestamp) return "Just now";
  const diff = Date.now() - timestamp;
  if (diff < 60 * 1000) return "Just now";
  if (diff < 3600 * 1000) return `About ${Math.floor(diff / 60000)} Mins Ago`;
  if (diff < 86400 * 1000) return `About ${Math.floor(diff / 3600000)} Hours Ago`;
  if (diff < 2592000 * 1000) return `About ${Math.floor(diff / 86400000)} Days Ago`;
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function statusOf(entry) {
  if (entry?.status === "Approved") return { text: "Approved", statusClass: "is-approved" };
  if (entry?.status === "Rejected") return { text: "Rejected", statusClass: "is-rejected" };
  return { text: "For Approval", statusClass: "is-pending" };
}

const PANELS = ["all-approval", "quote", "contract", "approved", "rejected"];

const EMPTY_TEXT = {
  "all-approval": "No lead owner notifications found.",
  quote: "No quote notifications found.",
  contract: "No contract notifications found.",
  approved: "No approved notifications found.",
  rejected: "No rejected notifications found.",
};

export function ApprovalDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all-approval");

  const approvalsQuery = useApprovals();
  // Contract shares feed the Contract tab the same way quote shares feed
  // the Quote tab. Always enabled so the bell badge bumps live on socket
  // events; results are cached for 2 minutes.
  const contractApprovalsQuery = useContractApprovals(true);
  const items = useMemo(() => {
    const quoteItems = (approvalsQuery.items || []).map((i) => ({ kind: "quote", ...i }));
    const contractItems = contractApprovalsQuery.items || [];
    return [...quoteItems, ...contractItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [approvalsQuery.items, contractApprovalsQuery.items]);
  const viewed = useApprovalReadStore((s) => s.viewed);
  const markViewed = useApprovalReadStore((s) => s.markViewed);

  const data = useMemo(() => items.map((i) => {
    const status = statusOf({ status: i.status });
    return {
      key: i.key,
      kind: i.kind || "quote",
      date: i.date,
      leadId: i.leadId,
      titleText: `${i.quoteTitle} is ${status.text}`,
      statusText: status.text,
      statusClass: status.statusClass,
      metaText: i.leadName + (i.senderName !== "" ? ` • ${i.senderName}` : ""),
      timeText: formatTime(i.date),
      approved: i.approved,
      rejected: i.rejected,
    };
  }), [items]);
  const unread = useMemo(
    () => data.filter((i) => isApprovalUnread(viewed, i.key, i.date)),
    [data, viewed]
  );
  const unreadKeys = useMemo(() => new Set(unread.map((i) => i.key)), [unread]);
  const tabCounts = {
    "all-approval": unread.length,
    quote: unread.filter((i) => i.kind === "quote").length,
    contract: unread.filter((i) => i.kind === "contract").length,
    approved: unread.filter((i) => i.approved).length,
    rejected: unread.filter((i) => i.rejected).length,
  };
  const close = () => setOpen(false);
  const toggle = () => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("notification-drawer-open");
    }
    setOpen((prev) => !prev);
  };

  const renderCards = (filter) => {
    const rows =
      filter === "approved"
        ? data.filter((i) => i.approved)
        : filter === "rejected"
          ? data.filter((i) => i.rejected)
          : filter === "contract"
            ? data.filter((i) => i.kind === "contract")
            : filter === "quote"
              ? data.filter((i) => i.kind === "quote")
              : data;
    if (approvalsQuery.isLoading || (open && contractApprovalsQuery.isLoading)) {
      return <div className="approval-empty-state">Loading approvals...</div>;
    }
    if (approvalsQuery.isError || contractApprovalsQuery.isError) {
      return (
        <div className="approval-empty-state">
          Failed to load approvals.{" "}
          <button type="button" onClick={() => { approvalsQuery.refetch(); contractApprovalsQuery.refetch(); }}>
            Retry
          </button>
        </div>
      );
    }
    if (rows.length === 0) {
      return <div className="approval-empty-state">{EMPTY_TEXT[filter]}</div>;
    }
    return (
      <div className="lead-owner-notification-list">
        {rows.map((item) => (
          <div className={`lead-owner-notification-card${unreadKeys.has(item.key) ? "" : " is-viewed"}`} key={item.key}>
            <div className="lead-owner-notification-card__icon">
              <QuoteGlyph />
            </div>
            <div className="lead-owner-notification-card__content">
              <div className="lead-owner-notification-card__top">
                <h4>{item.titleText}</h4>
                <span className={`lead-owner-notification-card__status ${item.statusClass}`}>
                  {item.statusText}
                </span>
              </div>
              {item.metaText !== "" && (
                <div className="lead-owner-notification-card__meta">{item.metaText}</div>
              )}
              <div className="lead-owner-notification-card__time">
                <ClockGlyph />
                <span>{item.timeText}</span>
              </div>
            </div>
            <a
              href={item.leadId ? `/lead/edit-lead/${item.leadId}` : "#"}
              className="lead-owner-notification-card__action"
              aria-label="View lead owner notification"
              onClick={(e) => {
                if (!item.leadId) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                markViewed(item.key, item.date);
                close();
                router.push(`/lead/edit-lead/${item.leadId}`);
              }}
            >
              <ViewGlyph />
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Drawer
      drawerId="approvalDrawer"
      backdropId="approvalDrawerBackdrop"
      toggleId="approvalDrawerToggle"
      toggleClassName="approval-drawer-toggle"
      bodyClass="approval-drawer-open"
      backdropClass="approval-drawer-backdrop"
      panelClass="approval-drawer"
      title="Approval Notifications"
      label="Approval Notifications"
      icon={<ApprovalGlyph />}
      badge={tabCounts["all-approval"]}
      open={open}
      onToggle={toggle}
      onClose={close}
    >
      <DrawerTabs
        tabs={[
          { id: "all-approval", label: "All Approval", count: tabCounts["all-approval"] },
          { id: "quote", label: "Quote", count: tabCounts.quote },
          { id: "contract", label: "Contract", count: tabCounts.contract },
          { id: "approved", label: "Approved", count: tabCounts.approved },
          { id: "rejected", label: "Rejected", count: tabCounts.rejected },
        ]}
        active={tab}
        onChange={setTab}
      />
      <p className="notification-drawer-meta normal_text">Review lead owner approval activity</p>
      <div className="notification-drawer-body">
        {PANELS.map((panel) => (
          <div
            key={panel}
            className={`approval-drawer-panel${tab === panel ? " is-active" : ""}`}
          >
            {tab === panel && renderCards(panel)}
          </div>
        ))}
      </div>
    </Drawer>
  );
}

export default ApprovalDrawer;
