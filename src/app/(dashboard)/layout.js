"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, Header } from "@/components/layout";
import { Toaster } from "@/components/shared";
import { SocketNotifications } from "@/components/shared";
import { QueryProvider } from "@/lib/query/queryClient";
import { useAuthStore } from "@/store/authStore";
import styles from "@/components/layout/layout.module.scss";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const { isAuthenticated, user, fetchProfile } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setAuthorized(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile();
    }
  }, [isAuthenticated, user, fetchProfile]);

  const isMobile = () => {
    if (typeof window === "undefined") return false;
    const m = window.matchMedia("(max-width: 992px)");
    if (m.matches) {
      document.body.classList.add("mobile");
      document.body.classList.remove("desktop");
      return true;
    } else {
      document.body.classList.remove("mobile");
      document.body.classList.add("desktop");
      return false;
    }
  };

  useEffect(() => {
    isMobile();
    const onResize = () => isMobile();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleCollapse = () => {
    const sidebarNav = document.querySelector(".sidebar-nav");
    const subMenu = document.querySelectorAll(".sub-menu");
    const hasChildren = document.querySelectorAll("li.has-children");
    if (sidebarNav) sidebarNav.style.opacity = "0";
    subMenu.forEach((el) => (el.style.display = "none"));
    hasChildren.forEach((el) => el.classList.remove("opened"));

    const sidebar = document.querySelector(".prtm-sidebar");
    const hamburger = document.querySelector(".prtm-bars");
    const body = document.body;

    if (isMobile()) {
      if (sidebar) {
        sidebar.classList.toggle("mobile-menu-in");
        if (sidebar.style.display === "none") {
          sidebar.style.display = "";
        } else {
          const cur = window.getComputedStyle(sidebar).display;
          sidebar.style.display = cur === "none" ? "" : "none";
        }
      }
    } else {
      if (hamburger) {
        hamburger.classList.toggle("prtm-sidebar-closed");
        hamburger.classList.toggle("is-active");
      }
      body.classList.toggle("prtm-sidebar-closed");
      body.classList.toggle("is-active");
      if (sidebar) sidebar.classList.toggle("collapse");
      setCollapsed((prev) => !prev);
    }

    setTimeout(() => {
      if (sidebarNav) sidebarNav.style.opacity = "1";
    }, 500);
  };

  if (!authorized) {
    return <div className={styles.bootSplash} />;
  }

  return (
    <div className={`${styles.dashboardShell} prtm-main`}>
      <QueryProvider>
        <Header onToggleSidebar={handleCollapse} collapsed={collapsed} />
        <div className="prtm-main-body">
          <Sidebar collapsed={collapsed} />
          <div className={`${styles.mainWrapper} prtm-content-wrapper`}>
            <div className={`${styles.contentArea} prtm-content dashboard_page`}>{children}</div>
          </div>
        </div>
        <SocketNotifications />
      </QueryProvider>
      <Toaster />
    </div>
  );
}
