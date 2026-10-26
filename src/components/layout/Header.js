"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/lib/constants";
import { RefreshIcon, SunIcon, MoonIcon } from "./icons";
import { useThemeStore } from "@/store/themeStore";
import { NotificationDrawer } from "@/components/shared";
import { ApprovalDrawer } from "@/components/modules/quotes";
import { leadsApi } from "@/lib/api/leads";
import styles from "./layout.module.scss";

function LeadHeaderBreadcrumb({ pathname, defaultTitle, defaultSubheading }) {
  const leadId = pathname ? pathname.replace("/lead/edit-lead/", "").split("/")[0] : null;
  const [leadName, setLeadName] = useState("");

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    leadsApi.getLead(leadId).then((lead) => {
      if (cancelled || !lead) return;
      const fn = lead.firstName || "";
      const ln = lead.lastName || "";
      const full = `${fn} ${ln}`.trim();
      if (full) {
        setLeadName(full);
      } else if (lead.companyName) {
        setLeadName(lead.companyName);
      } else {
        setLeadName(`Lead #${leadId}`);
      }
    }).catch(() => { });
    return () => { cancelled = true; };
  }, [leadId]);

  return (
    <>
      <div className={styles.breadcrumbNav}>
        <Link href="/leads" className={styles.breadcrumbLink}>All leads</Link>
        <span className={styles.breadcrumbDivider}>&gt;</span>
        <span className={styles.breadcrumbCurrent}>{leadName || "Loading..."}</span>
      </div>
      <p className={styles.headerSubheadingText}>{defaultSubheading}</p>
    </>
  );
}

const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/quotes": "Quotes",
  "/quote/quote-list": "Quotes",
  "/quote/edit-quote": "Edit Quote",
  "/customers": "Customers",
  "/invoices": "Invoices",
  "/sales": "Sales",
  "/reports": "Reports",
  "/chat": "Email / Chat",
  "/settings": "Settings",
  "/price-book": "Pricing Tools",
  "/payments": "Payments",
  "/payment/connection": "Integrations & Configuration",
  "/payment": "Integrations & Configuration",
  "/users": "Users",
  "/user/all-users": "Users",
  "/permissions": "Permissions",
  "/permission": "Permissions",
  "/permission/all-permission": "Permissions",
  "/manufacturers": "Manufacturer",
  "/manufacturer/manufacturer-list": "Manufacturer",
  "/manufacturer/add-manufacturer": "Manufacturer",
  "/manufacturer/edit-manufacturer": "Manufacturer",
};

const ROUTE_SUBHEADINGS = {
  "/dashboard": "Overview of key metrics, leads, and activity",
  "/leads": "Manage and track all incoming leads",
  "/quote/quote-list": "Manage and track all customer quotes and estimates",
  "/quote-pdf-template": "Customize PDF quote templates and layout options",
  "/customers": "Manage customer accounts and contact histories",
  "/contracts": "Manage contracts, terms, and signed agreements",
  "/invoices": "Manage invoices, payments, and billing details",
  "/task-activities": "Track task activities, follow-ups, and schedules",
  "/chat": "Access inbox emails, messaging, and chat logs",
  "/price-book": "Manage pricing tools, products, and price books",
  "/payments": "Review payment transactions and bank statements",
  "/payment/connection": "Manage payment gateways, email providers, and connected services",
  "/payment": "Manage payment gateways, email providers, and connected services",
  "/user/all-users": "Manage user profiles, roles, and system access",
  "/permission/all-permission": "Manage system permissions and role capabilities",
  "/manufacturers": "Manage manufacturer listings and partner profiles",
  "/manufacturer/manufacturer-list": "Manage manufacturer listings and partner profiles",
  "/manufacturer/add-manufacturer": "Manage manufacturer listings and partner profiles",
  "/manufacturer/edit-manufacturer": "Manage manufacturer listings and partner profiles",
};

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function HeaderSearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SidebarToggleIcon({ collapsed }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="3.5" />
      <line x1="9" y1="4" x2="9" y2="20" />
      {collapsed ? (
        <>
          <line x1="12" y1="12" x2="16" y2="12" />
          <path d="m14 9 3 3-3 3" />
        </>
      ) : (
        <>
          <line x1="16" y1="12" x2="12" y2="12" />
          <path d="m14 9-3 3 3 3" />
        </>
      )}
    </svg>
  );
}

export default function Header({ onToggleSidebar, collapsed }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentTitle =
    ROUTE_TITLES[pathname] ||
    ROUTE_TITLES[
    Object.keys(ROUTE_TITLES).find((p) => p !== "/dashboard" && pathname.startsWith(p))
    ] ||
    "Dashboard";

  const currentSubheading =
    ROUTE_SUBHEADINGS[pathname] ||
    ROUTE_SUBHEADINGS[
    Object.keys(ROUTE_SUBHEADINGS).find((p) => p !== "/dashboard" && pathname.startsWith(p))
    ] ||
    "Manage and track your CRM activities";

  const displayName =
    user?.name?.trim() ||
    (user?.email ? user.email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "");

  const getInitials = () => {
    if (displayName) {
      const parts = displayName.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return "AD";
  };

  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSignOut = () => {
    logout();
    router.push(ROUTES.AUTH.LOGIN);
  };

  return (
    <header className={`prtm-header ${styles.headerShell}`}>
      <nav className={`navbar navbar-default ${styles.navbarThemed} ${collapsed ? styles.navbarThemedCollapsed : ""}`}>
        <div className={`container-fluid ${styles.containerFluid}`}>
          <div className={`navbar-header ${styles.navbarHeader}`}>
            <button
              type="button"
              className={`navbar-toggle collapsed ${styles.navTogglePhp} ${navOpen ? styles.show : ""}`}
              data-toggle="collapse"
              data-target="#navbar"
              aria-expanded={navOpen}
              aria-controls="navbar"
              onClick={() => setNavOpen(!navOpen)}
            >
              <span className="sr-only">Toggle navigation</span>
              <span className={`icon-bar ${styles.iconBar}`} />
              <span className={`icon-bar ${styles.iconBar}`} />
              <span className={`icon-bar ${styles.iconBar}`} />
            </button>

            <div className={`prtm-logo ${styles.logoWrap} ${collapsed ? styles.collapsed : ""}`}>
              <Link href="/dashboard" className={styles.logoLink}>
                {collapsed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none" className="mono_logo">
                    <path d="M30.462 36H5.538C2.478 36 0 33.522 0 30.462V5.538C0 2.478 2.478 0 5.538 0H30.462C33.522 0 36 2.478 36 5.538V30.462C36 33.522 33.522 36 30.462 36Z" fill="#ffffff" />
                    <path d="M31.4939 12.3181V4.1521H4.50586V31.8481H18.0959L27.9419 21.9901V31.8481H31.4939V15.8701H27.9419H16.2239V19.4221H25.5179L16.6379 28.2961H8.05786V7.7041H27.9419V12.3181H31.4939Z" fill="#1c1917" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="164" height="36" viewBox="0 0 164 36" fill="none" className="full_logo">
                    <g clipPath="url(#clip0_php_header)">
                      <path d="M41.8979 19.5423C41.8979 13.2158 46.5247 8.37956 52.5639 8.37956C56.9632 8.37956 60.0038 11.0431 60.315 15.1131H56.4784C56.2509 12.9883 54.6888 11.7074 52.3125 11.7074C48.5537 11.7074 45.7645 15.0353 45.7645 19.4645C45.7645 22.3854 47.632 24.3785 50.3673 24.3785C52.9231 24.3785 55.0479 22.8403 55.6883 20.2845H50.5708L51.0796 17.2619H60.2073C59.3095 23.6663 55.5507 27.5328 49.9782 27.5328C45.2198 27.5328 41.8979 24.2528 41.8979 19.5423Z" fill="currentColor" />
                      <path d="M61.207 27.1498L64.4571 8.76263H71.3643C75.0453 8.76263 77.4993 10.8096 77.4993 13.9101C77.4993 17.0105 75.6558 19.2131 72.28 20.1349L75.8593 27.1498H71.7174L68.4673 20.6197H66.0911L64.9659 27.1498H61.207ZM66.6537 17.4415H69.6704C72.2561 17.4415 73.7105 16.3162 73.7105 14.3171C73.7105 12.7788 72.6391 11.9109 70.6161 11.9109H67.6473L66.6478 17.4415H66.6537Z" fill="currentColor" />
                      <path d="M78.2891 27.1498L81.5391 8.76263H85.298L82.0479 27.1498H78.2891Z" fill="currentColor" />
                      <path d="M90.6192 21.1285L89.5957 27.1438H85.8369L89.087 8.75664H95.6111C99.2682 8.75664 101.674 10.8815 101.674 14.0837C101.674 18.3333 98.4242 21.1225 93.4384 21.1225H90.6252L90.6192 21.1285ZM92.2533 12.0127L91.2058 17.8784H93.9651C96.3712 17.8784 97.8795 16.5496 97.8795 14.4966C97.8795 12.9584 96.7782 12.0127 94.9886 12.0127H92.2533Z" fill="currentColor" />
                      <path d="M103.901 17.9323C103.901 12.5574 108.019 8.37956 113.238 8.37956C118.457 8.37956 122.162 11.7314 122.749 16.5975H117.631C117.248 14.2931 115.537 12.707 113.286 12.707C110.575 12.707 108.863 14.8079 108.863 17.9323C108.863 21.0566 110.575 23.2054 113.286 23.2054C115.513 23.2054 117.224 21.6193 117.631 19.285H122.749C122.132 24.199 118.272 27.5328 113.238 27.5328C108.204 27.5328 103.901 23.3311 103.901 17.9323Z" fill="currentColor" />
                      <path d="M125.257 27.1498V8.76263H132.774C137.736 8.76263 140.573 10.9892 140.573 14.9096C140.573 17.2679 139.167 19.2131 136.689 20.2606L141.19 27.1498H135.438L131.679 21.0327H130.093V27.1498H125.257ZM130.087 17.0345H132.565C134.714 17.0345 135.713 16.3701 135.713 14.9096C135.713 13.4492 134.714 12.7609 132.565 12.7609H130.087V17.0345Z" fill="currentColor" />
                      <path d="M147.738 16.5496V27.1498H143.363V8.76263H149.067L153.694 21.2302L158.296 8.76263H164V27.1498H159.625V16.418L155.663 27.1498H151.671L147.732 16.5496H147.738Z" fill="currentColor" />
                      <path d="M30.3879 35.9124H5.52453C2.47197 35.9124 0 33.4404 0 30.3879V5.52453C0 2.47197 2.47197 0 5.52453 0H30.3879C33.4404 0 35.9124 2.47197 35.9124 5.52453V30.3879C35.9124 33.4404 33.4404 35.9124 30.3879 35.9124Z" fill="#ffffff" />
                      <path d="M31.4175 12.288V4.1419H4.49512V31.7705H18.0521L27.8741 21.9365V31.7705H31.4175V15.8314H27.8741H16.1846V19.3747H25.456L16.5976 28.2272H8.03847V7.68526H27.8741V12.288H31.4175Z" fill="#1c1917" />
                    </g>
                    <defs><clipPath id="clip0_php_header"><rect width="164" height="35.9124" fill="white" /></clipPath></defs>
                  </svg>
                )}
              </Link>
            </div>

            <div
              className={`${styles.barsBtn} ${collapsed ? styles.barsBtnCollapsed : ""}`}
              onClick={onToggleSidebar}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <SidebarToggleIcon collapsed={collapsed} />
            </div>
          </div>

          <div id="navbar" className={`${styles.navbarCollapse} ${navOpen ? styles.navbarCollapseOpen : ""}`}>
            {/* Header Left Side: Title & Subheading */}
            <div className={styles.headerLeft}>
              {pathname?.startsWith("/lead/edit-lead/") ? (
                <LeadHeaderBreadcrumb pathname={pathname} defaultTitle={currentTitle} defaultSubheading={currentSubheading} />
              ) : (
                <>
                  <h1 className={styles.headerTitleText}>{currentTitle}</h1>
                  <p className={styles.headerSubheadingText}>{currentSubheading}</p>
                </>
              )}
            </div>

            {/* Header Right Side: Actions & Profile */}
            <div className={styles.headerRight}>

              <div className={styles.searchBox}>
                <span className={styles.searchIcon}>
                  <HeaderSearchIcon />
                </span>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search"
                />
                <span className={styles.cmdBadge}>⌘+k</span>
              </div>

              {/* Quick Add Action Button */}
              <button
                type="button"
                className={styles.actionIconBtn}
                title="Create / Add"
                aria-label="Create / Add"
                onClick={() => router.push("/lead/add-lead")}
              >
                <PlusIcon />
              </button>

              {/* Refresh Action Button */}
              <button
                type="button"
                className={styles.actionIconBtn}
                title="Refresh page"
                aria-label="Refresh page"
                onClick={() => window.location.reload()}
              >
                <RefreshIcon />
              </button>

              {/* Notification Drawer */}
              <NotificationDrawer />

              {/* Quote Approval / Rejection Drawer */}
              <ApprovalDrawer />

              {/* Theme Toggle Button */}
              <button
                type="button"
                className={styles.actionIconBtn}
                title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                onClick={toggleTheme}
              >
                {theme === "light" ? <MoonIcon /> : <SunIcon />}
              </button>

              {/* Profile Avatar Dropdown */}
              <div className={styles.avatarMenuContainer} ref={dropdownRef}>
                <button
                  type="button"
                  className={styles.avatarCircle}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  title={displayName || "User profile"}
                >
                  {getInitials()}
                </button>
                {dropdownOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownName}>{displayName}</div>
                      <div className={styles.dropdownEmail}>{user?.email}</div>
                    </div>
                    <button
                      type="button"
                      className={`${styles.dropdownItem} ${styles.logoutItem}`}
                      onClick={handleSignOut}
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.navbarToggle}
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(!navOpen)}
          >
            <span className={styles.iconBar} />
            <span className={styles.iconBar} />
            <span className={styles.iconBar} />
          </button>
        </div>
      </nav>
    </header>
  );
}
