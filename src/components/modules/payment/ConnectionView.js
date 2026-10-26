"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./connection.module.scss";

const TABS = [
  { id: "payment", label: "Payment Configuration" },
  { id: "email", label: "Email Configuration" },
  { id: "voice", label: "Voice Configuration" },
];

const CONFIG_DATA = {
  payment: {
    title: "Payment Gateways",
    addLabel: "+ Add Gateway",
    items: [
      {
        id: "stripe",
        name: "Stripe",
        category: "Payment gateway",
        initialActive: true,
        logoBg: "#0170C8",
        logoText: "ST",
        fee: "10¢ + 2.9% per txn",
        monthly: "$25.00",
        href: "/payment/stripe",
      },
      {
        id: "card-connect",
        name: "Card Connect",
        category: "Payment gateway",
        initialActive: false,
        logoBg: "#9D89FC",
        logoText: "CC",
        fee: "10¢ + 2.9% per txn",
        monthly: "$25.00",
        href: "/payment/card-connect",
      },
      {
        id: "paytrace",
        name: "PayTrace",
        category: "Payment gateway",
        initialActive: false,
        logoBg: "#17AAC3",
        logoText: "PT",
        fee: "10¢ + 2.9% per txn",
        monthly: "$25.00",
        href: "/payment/paytrace",
      },
    ],
  },
  email: {
    title: "Email Configuration",
    addLabel: "+ Add Email Config",
    items: [
      {
        id: "gmail",
        name: "Google / Gmail",
        category: "Email service",
        initialActive: true,
        logoBg: "#EA4335",
        logoText: "GM",
        fee: "OAuth 2.0 / API",
        monthly: "$0.00",
        href: "/google/configuration",
      },
      {
        id: "outlook",
        name: "Outlook",
        category: "Email service",
        initialActive: false,
        logoBg: "#0078D4",
        logoText: "OU",
        fee: "OAuth 2.0 / Graph",
        monthly: "$0.00",
        href: "/outlook/connect",
      },
      {
        id: "yahoo",
        name: "Yahoo",
        category: "Email service",
        initialActive: false,
        logoBg: "#6001D2",
        logoText: "YH",
        fee: "SMTP / App Password",
        monthly: "$0.00",
        href: "/email/yahoo-login",
      },
      {
        id: "hotmail",
        name: "Hotmail",
        category: "Email service",
        initialActive: false,
        logoBg: "#0072C6",
        logoText: "HM",
        fee: "SMTP / OAuth",
        monthly: "$0.00",
        href: "/outlook/connect",
      },
    ],
  },
  voice: {
    title: "Voice Configuration",
    addLabel: "+ Add Voice Config",
    items: [
      {
        id: "ringcentral",
        name: "RingCentral",
        category: "Voice service",
        initialActive: true,
        logoBg: "#FF6600",
        logoText: "RC",
        fee: "Private REST API App",
        monthly: "Included",
        href: "/ringcentral/configuration",
      },
    ],
  },
};

function DashboardHeaderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="6.25" height="6.25" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.25" y="2.5" width="6.25" height="6.25" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11.25" width="6.25" height="6.25" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.25" y="11.25" width="6.25" height="6.25" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function ConnectionView() {
  const [activeTab, setActiveTab] = useState("payment");
  const [statuses, setStatuses] = useState(() => {
    const initial = {};
    Object.values(CONFIG_DATA).forEach((sec) => {
      sec.items.forEach((it) => {
        initial[it.id] = it.initialActive;
      });
    });
    return initial;
  });

  const currentSection = CONFIG_DATA[activeTab] || CONFIG_DATA.payment;
  const activeCount = currentSection.items.filter((it) => statuses[it.id]).length;
  const totalCount = currentSection.items.length;

  const toggleStatus = (id) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className={styles.container}>
      {/* Pill Navigation Tabs */}
      <div className={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabBtn} ${isActive ? styles.activeTabBtn : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Configuration Card Box Container */}
      <div className={styles.mainCard}>
        {/* Panel Top Header */}
        <div className={styles.panelHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconBox}>
              <DashboardHeaderIcon />
            </div>
            <div className={styles.headerTitles}>
              <h3 className={styles.titleText}>{currentSection.title}</h3>
              <span className={styles.subtitleText}>
                {activeCount} of {totalCount} active
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <button type="button" className={styles.addBtn}>
              {currentSection.addLabel}
            </button>
          </div>
        </div>

        {/* Configuration Cards Grid */}
        <div className={styles.cardsGrid}>
          {currentSection.items.map((item) => {
            const isActive = !!statuses[item.id];
            return (
              <div key={item.id} className={styles.configCard}>
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div
                    className={styles.logoBox}
                    style={{ backgroundColor: item.logoBg }}
                  >
                    {item.logoText}
                  </div>
                  <div className={styles.cardMeta}>
                    <h4 className={styles.cardName}>{item.name}</h4>
                    <span className={styles.cardCategory}>{item.category}</span>
                  </div>
                  <div
                    className={
                      isActive
                        ? styles.badgeActive
                        : styles.badgeInactive
                    }
                  >
                    <span className={styles.badgeDot} />
                    {isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                {/* Card Details */}
                <div className={styles.cardDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Fee</span>
                    <span className={styles.detailValue}>{item.fee}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Monthly</span>
                    <span className={styles.detailValue}>{item.monthly}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className={styles.cardActions}>
                  <Link href={item.href} className={styles.configureBtn}>
                    <span>Configure</span>
                    <ArrowRightIcon />
                  </Link>
                  <button
                    type="button"
                    className={`${styles.powerBtn} ${isActive ? styles.powerBtnActive : ""
                      }`}
                    title={isActive ? "Deactivate" : "Activate"}
                    onClick={() => toggleStatus(item.id)}
                  >
                    <PowerIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
