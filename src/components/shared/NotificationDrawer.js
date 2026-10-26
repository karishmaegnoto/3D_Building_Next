"use client";

import { useMemo, useState } from "react";
import Drawer, { DrawerTabs } from "./Drawer";
import { useNotificationStore } from "@/store/notificationStore";

function BellGlyph() {
  return (
    <svg id="notification--new" xmlns="http://www.w3.org/2000/svg" width="17" height="19" viewBox="0 0 17 19" fill="none" aria-hidden="true">
      <path d="M8.75 0V1.28223C9.39726 1.34839 10.0301 1.5159 10.625 1.7793V3.17676C9.86585 2.73525 9.0032 2.50169 8.125 2.5C7.24696 2.49839 6.38375 2.72848 5.62305 3.16699C4.86231 3.60558 4.23061 4.23732 3.79199 4.99805C3.3534 5.7588 3.12339 6.62187 3.125 7.5V10C3.12496 10.1657 3.05862 10.3242 2.94141 10.4414L1.25 12.1338V13.125H15V12.1338L13.3086 10.4414C13.1914 10.3242 13.125 10.1657 13.125 10V8.125H14.375V9.74121L16.0664 11.4336C16.1836 11.5508 16.25 11.7093 16.25 11.875V13.75C16.25 13.9158 16.1846 14.0752 16.0674 14.1924C15.9502 14.3096 15.7908 14.375 15.625 14.375H11.25V15C11.25 15.8288 10.921 16.6239 10.335 17.21C9.74891 17.796 8.9538 18.125 8.125 18.125C7.2962 18.125 6.50109 17.796 5.91504 17.21C5.32899 16.6239 5 15.8288 5 15V14.375H0.625C0.45924 14.375 0.299827 14.3096 0.182617 14.1924C0.0654071 14.0752 0 13.9158 0 13.75V11.875C3.53984e-05 11.7093 0.0663755 11.5508 0.183594 11.4336L1.875 9.74121V7.5C1.87701 5.95122 2.45319 4.45814 3.49219 3.30957C4.53117 2.16102 5.9592 1.43901 7.5 1.28223V0H8.75ZM6.25 14.375V15C6.25 15.4973 6.4472 15.9745 6.79883 16.3262C7.15046 16.6778 7.62772 16.875 8.125 16.875C8.62228 16.875 9.09954 16.6778 9.45117 16.3262C9.8028 15.9745 10 15.4973 10 15V14.375H6.25ZM14.375 1.875C15.7557 1.875 16.875 2.99429 16.875 4.375C16.875 5.75571 15.7557 6.875 14.375 6.875C12.9943 6.875 11.875 5.75571 11.875 4.375C11.875 2.99429 12.9943 1.875 14.375 1.875Z" fill="white" fillOpacity="0.8" />
    </svg>
  );
}

function ItemGlyph() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M14.3751 12.5C13.9072 12.5024 13.4459 12.6097 13.0251 12.8142C12.6043 13.0186 12.2348 13.3149 11.9438 13.6813L7.37505 10.825C7.54156 10.2876 7.54156 9.71242 7.37505 9.17502L11.9438 6.31877C12.4075 6.89297 13.0595 7.28451 13.7843 7.42403C14.509 7.56354 15.2598 7.44204 15.9035 7.08104C16.5473 6.72003 17.0425 6.14283 17.3014 5.45168C17.5603 4.76052 17.5662 4.00003 17.3181 3.30492C17.0701 2.6098 16.5839 2.02493 15.9459 1.65391C15.3079 1.2829 14.5591 1.14968 13.8323 1.27786C13.1054 1.40603 12.4474 1.78734 11.9748 2.35422C11.5021 2.9211 11.2454 3.63697 11.2501 4.37502C11.253 4.65451 11.2951 4.9322 11.3751 5.20002L6.8063 8.05627C6.40296 7.54851 5.85164 7.1788 5.22877 6.99839C4.60591 6.81798 3.94234 6.83581 3.33006 7.0494C2.71778 7.263 2.18711 7.66177 1.81161 8.19046C1.43611 8.71915 1.23438 9.35155 1.23438 10C1.23437 10.6485 1.43611 11.2809 1.81161 11.8096C2.18711 12.3383 2.71778 12.737 3.33006 12.9506C3.94234 13.1642 4.60591 13.1821 5.22877 13.0016C5.85164 12.8212 6.40296 12.4515 6.8063 11.9438L11.3751 14.8C11.2951 15.0678 11.253 15.3455 11.2501 15.625C11.2501 16.2431 11.4333 16.8473 11.7767 17.3612C12.1201 17.8751 12.6081 18.2756 13.1792 18.5121C13.7502 18.7487 14.3785 18.8106 14.9847 18.69C15.5909 18.5694 16.1477 18.2718 16.5848 17.8347C17.0218 17.3977 17.3194 16.8409 17.44 16.2347C17.5606 15.6285 17.4987 15.0002 17.2622 14.4291C17.0257 13.8581 16.6251 13.3701 16.1112 13.0267C15.5973 12.6833 14.9931 12.5 14.3751 12.5Z" fill="#131416" />
    </svg>
  );
}

function timeAgo(value) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "";
  const diff = Math.max(0, Date.now() - time);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `About ${minutes} Mins Ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `About ${hours} Hours Ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `About ${days} Days Ago`;
  return new Date(time).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function NotificationDrawer() {
  const items = useNotificationStore((s) => s.items);
  const unread = useNotificationStore((s) => s.unread);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");

  const visible = useMemo(
    () => (tab === "new" ? items.filter((n) => !n.read) : items),
    [items, tab]
  );

  const close = () => setOpen(false);
  const toggle = () => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("approval-drawer-open");
    }
    setOpen((prev) => !prev);
  };

  return (
    <Drawer
      drawerId="notificationDrawer"
      backdropId="notificationDrawerBackdrop"
      toggleId="notificationDrawerToggle"
      toggleClassName="notification-drawer-toggle"
      bodyClass="notification-drawer-open"
      title="Notifications"
      label="Notifications"
      icon={<BellGlyph />}
      badge={unread}
      open={open}
      onToggle={toggle}
      onClose={close}
      footer={
        <div className="notification-drawer-footer">
          <button
            type="button"
            className="notification-drawer-footer-btn"
            onClick={() => {
              markAllRead();
              close();
            }}
          >
            <span>View all Notifications</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
              <path d="M7.875 0L7.07062 0.783563L11.3344 5.0625H0V6.1875H11.3344L7.07062 10.4473L7.875 11.25L13.5 5.625L7.875 0Z" fill="#211814" />
            </svg>
          </button>
        </div>
      }
    >
      <DrawerTabs
        tabs={[
          { id: "all", label: "All", count: items.length },
          { id: "new", label: "New", count: unread },
        ]}
        active={tab}
        onChange={setTab}
      />
      <p className="notification-drawer-meta normal_text">
        You have {unread} unread message{unread === 1 ? "" : "s"}
      </p>
      <div className="notification-drawer-body">
        <ul className="notification-drawer-list">
          {visible.length === 0 ? (
            <li>
              <strong className="drop-title">
                {tab === "new" ? "No new notifications found" : "No notifications found"}
              </strong>
            </li>
          ) : (
            visible.map((n) => (
              <li className="new_notify" key={n.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    markRead(n.id);
                  }}
                >
                  <span className="user-thumb">
                    <ItemGlyph />
                  </span>
                  <span className="user-content">
                    <h6>{n.title}</h6>
                    <span>
                      {[n.body, timeAgo(n.receivedAt)].filter(Boolean).join(" • ")}
                    </span>
                  </span>
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    </Drawer>
  );
}
