"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./dashboard.module.scss";

const mockOverview = {
  label: "This Month",
  leads: { total: 124, trend: 12, direction: "up" },
  quotes: { total: 86, trend: 4, direction: "down" },
  customers: { total: 42, trend: 8, direction: "up" },
  contracts: { total: 31, trend: 2, direction: "up" },
};

const mockSources = [
  { label: "Facebook", count: 42, percent: 42, bar: styles.barPrimary },
  { label: "Google", count: 28, percent: 28, bar: styles.barSecondary },
  { label: "Call", count: 18, percent: 18, bar: styles.barInfo },
  { label: "3D Estimator", count: 12, percent: 12, bar: styles.barSuccess },
  { label: "Website Lead", count: 9, percent: 9, bar: styles.barInfo },
];

const mockRows = {
  newLead: [
    { name: "John Carter", email: "john.carter@example.com", status: "New Lead", source: "Facebook", owner: "Rati M", time: "May 16, 2024, 7:19 AM" },
    { name: "Katy Heath", email: "katy@vikingsteelstructures.com", status: "Quoted", source: "Website", owner: "Amy M", time: "May 15, 2024, 4:22 PM" },
  ],
  needsQuote: [
    { name: "Brett B", email: "brett@vikingsteelstructures.com", status: "Needs Quote", source: "Google", owner: "Brett B", time: "May 14, 2024, 9:10 AM" },
  ],
  quoted: [
    { name: "Estefania E", email: "estefania.e@vikingsteelstructures.com", status: "Quoted", source: "Call", owner: "Estefania E", time: "May 13, 2024, 11:30 AM" },
  ],
  newCustomer: [
    { name: "Tania M", email: "tania@vikingsteelstructures.com", status: "Customer", source: "3D Estimator", owner: "Tania M", time: "May 12, 2024, 2:15 PM" },
  ],
};

const mockOpenTasks = [
  { owner: "Rati M", status: "Open", priority: "High", due: "May 20, 2024 10:00 AM" },
  { owner: "Amy M", status: "In Progress", priority: "Medium", due: "May 22, 2024 02:30 PM" },
  { owner: "Brett B", status: "Open", priority: "Low", due: "May 25, 2024 09:00 AM" },
];

function TrendIcon({ direction }) {
  return direction === "up" ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5" fill="none">
      <path d="M0 5L4 0L8 5H0Z" fill="#00C950" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5" fill="none">
      <path d="M8 0L4 5L0 0H8Z" fill="#FB2C36" />
    </svg>
  );
}

function KpiIconLeads() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14" fill="none">
      <path d="M16.25 0C16.5814 0.000380458 16.8995 0.131873 17.1338 0.366211C17.3681 0.600549 17.4996 0.918596 17.5 1.25V12.5C17.4996 12.8314 17.3681 13.1495 17.1338 13.3838C16.8995 13.6181 16.5814 13.7496 16.25 13.75H1.25C0.918596 13.7496 0.600549 13.6181 0.366211 13.3838C0.131873 13.1495 0.000380458 12.8314 0 12.5V1.25C0.000330923 0.918581 0.131862 0.60056 0.366211 0.366211C0.60056 0.131862 0.918581 0.000330923 1.25 0H16.25ZM1.25 1.25V12.5H8.125V1.25H1.25ZM9.375 1.25V12.5H16.251L16.25 1.25H9.375ZM15 10.625H10.625V9.375H15V10.625ZM15 7.5H10.625V6.25H15V7.5ZM15 4.375H10.625V3.125H15V4.375Z" fill="white" />
    </svg>
  );
}

function KpiIconQuote() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M8.75012 0C11.0686 0.00679314 13.2903 0.93088 14.9298 2.57031C16.5693 4.20979 17.4933 6.43145 17.5001 8.75C17.5001 10.4806 16.987 12.1724 16.0255 13.6113C15.0641 15.0502 13.6976 16.1717 12.0988 16.834C10.4999 17.4963 8.74043 17.6697 7.04309 17.332C5.34579 16.9944 3.78631 16.1612 2.56262 14.9375C1.33895 13.7138 0.505707 12.1543 0.168092 10.457C-0.169512 8.75972 0.00388029 7.0002 0.666139 5.40137C1.32839 3.80259 2.44995 2.43605 3.88879 1.47461C5.32769 0.513171 7.01958 2.58753e-05 8.75012 0ZM8.75012 1.25C6.76284 1.25585 4.85848 2.04789 3.45325 3.45312C2.04803 4.85838 1.25594 6.7627 1.25012 8.75C1.25012 10.2333 1.68971 11.6836 2.51379 12.917C3.33786 14.1503 4.50966 15.111 5.88001 15.6787C7.25035 16.2463 8.75826 16.3948 10.213 16.1055C11.6678 15.8161 13.0049 15.1026 14.0538 14.0537C15.1027 13.0048 15.8172 11.6677 16.1066 10.2129C16.3959 8.7582 16.2474 7.25017 15.6798 5.87988C15.1122 4.50944 14.1505 3.33778 12.9171 2.51367C11.6838 1.6896 10.2334 1.25 8.75012 1.25ZM9.37512 3.125V5H11.8751V6.25H6.87512V8.125H10.6251C10.9565 8.12533 11.2746 8.2569 11.5089 8.49121C11.7433 8.72556 11.8748 9.04358 11.8751 9.375V11.25C11.8747 11.5814 11.7432 11.8995 11.5089 12.1338C11.2746 12.3681 10.9565 12.4996 10.6251 12.5H9.37512V14.375H8.12512V12.5H5.62512V11.25H10.6251V9.375H6.87512C6.54375 9.37464 6.22565 9.24311 5.99133 9.00879C5.75702 8.77445 5.62545 8.45639 5.62512 8.125V6.25C5.62545 5.91861 5.75702 5.60055 5.99133 5.36621C6.22565 5.13189 6.54375 5.00036 6.87512 5H8.12512V3.125H9.37512Z" fill="white" />
    </svg>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("newLead");

  const tabs = [
    { id: "newLead", label: "New Lead" },
    { id: "needsQuote", label: "Needs Quote" },
    { id: "quoted", label: "Quoted" },
    { id: "newCustomer", label: "New Customer" },
  ];

  const rows = mockRows[activeTab] || [];

  return (
    <div className={styles.dashboardMain}>
      <div className={styles.overview}>
        <div className={styles.sectionHeader}>
          <h2>Overview Metrics</h2>
          <div className={styles.sectionActions}>
            <span className={styles.sectionActionsLabel}>View By</span>
            <button type="button" className={styles.dropdownBtn}>
              {mockOverview.label} <span className={styles.caret}>▼</span>
            </button>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiItem}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiTitle}>
                <h2>Total Leads</h2>
                <p>{mockOverview.leads.total}</p>
              </div>
              <div className={styles.kpiIcon}><KpiIconLeads /></div>
            </div>
            <div className={styles.kpiBottom}>
              <span className={`${styles.trend} ${mockOverview.leads.direction === "up" ? styles.trendUp : styles.trendDown}`}>
                <TrendIcon direction={mockOverview.leads.direction} /> {mockOverview.leads.trend}%
              </span>
              <span>{mockOverview.label.toLowerCase()}</span>
            </div>
          </div>

          <div className={styles.kpiItem}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiTitle}>
                <h2>Total Quote</h2>
                <p>{mockOverview.quotes.total}</p>
              </div>
              <div className={styles.kpiIcon}><KpiIconQuote /></div>
            </div>
            <div className={styles.kpiBottom}>
              <span className={`${styles.trend} ${mockOverview.quotes.direction === "up" ? styles.trendUp : styles.trendDown}`}>
                <TrendIcon direction={mockOverview.quotes.direction} /> {mockOverview.quotes.trend}%
              </span>
              <span>{mockOverview.label.toLowerCase()}</span>
            </div>
          </div>

          <div className={styles.kpiItem}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiTitle}>
                <h2>Total Customers</h2>
                <p>{mockOverview.customers.total}</p>
              </div>
              <div className={styles.kpiIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M8.125 10C9.28491 10.0014 10.3966 10.463 11.2168 11.2832C12.037 12.1034 12.4986 13.2151 12.5 14.375V17.5H11.25V14.375C11.249 13.5465 10.9198 12.7519 10.334 12.166C9.74814 11.5802 8.9535 11.251 8.125 11.25H4.375C3.5465 11.251 2.75186 11.5802 2.16602 12.166C1.58018 12.7519 1.25098 13.5465 1.25 14.375V17.5H0V14.375C0.00135636 13.2151 0.463026 12.1034 1.2832 11.2832C2.10338 10.463 3.21509 10.0014 4.375 10H8.125ZM6.25 0C7.41032 0 8.52328 0.460779 9.34375 1.28125C10.1642 2.10172 10.625 3.21468 10.625 4.375C10.625 5.24029 10.3684 6.0862 9.8877 6.80566C9.40697 7.52512 8.72325 8.08586 7.92383 8.41699C7.1245 8.748 6.24502 8.8348 5.39648 8.66602C4.54782 8.49721 3.7681 8.0806 3.15625 7.46875C2.5444 6.8569 2.12779 6.07718 1.95898 5.22852C1.7902 4.37998 1.877 3.5005 2.20801 2.70117C2.53914 1.90175 3.09988 1.21803 3.81934 0.737305C4.5388 0.256574 5.38471 4.12413e-07 6.25 0ZM6.25 1.25C5.4212 1.25 4.62609 1.57899 4.04004 2.16504C3.45399 2.75109 3.125 3.5462 3.125 4.375C3.125 4.99306 3.30799 5.59743 3.65137 6.11133C3.99465 6.62508 4.4829 7.02517 5.05371 7.26172C5.62462 7.4982 6.2533 7.56091 6.85938 7.44043C7.46557 7.31985 8.02292 7.022 8.45996 6.58496C8.897 6.14792 9.19485 5.59057 9.31543 4.98438C9.43591 4.3783 9.3732 3.74962 9.13672 3.17871C8.90017 2.6079 8.50008 2.11965 7.98633 1.77637C7.47243 1.433 6.86806 1.25 6.25 1.25Z" fill="white" />
                </svg>
              </div>
            </div>
            <div className={styles.kpiBottom}>
              <span className={`${styles.trend} ${mockOverview.customers.direction === "up" ? styles.trendUp : styles.trendDown}`}>
                <TrendIcon direction={mockOverview.customers.direction} /> {mockOverview.customers.trend}%
              </span>
              <span>{mockOverview.label.toLowerCase()}</span>
            </div>
          </div>

          <div className={styles.kpiItem}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiTitle}>
                <h2>Total Contract</h2>
                <p>{mockOverview.contracts.total}</p>
              </div>
              <div className={styles.kpiIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18" fill="none">
                  <path d="M7.5 0C7.56256 0 7.68756 -6.22905e-05 7.75 0.0625C7.81248 0.0625415 7.87508 0.125271 7.9375 0.1875L12.3125 4.5625C12.375 4.62503 12.3751 4.68747 12.4375 4.75C12.5001 4.81256 12.5 4.93744 12.5 5V9.37012H11.25V6.25H7.5C7.1875 6.25 6.87494 6.12494 6.625 5.875C6.37494 5.62506 6.25 5.3125 6.25 5V1.25H1.25V16.25H6.2168V17.5H1.25C0.9375 17.5 0.624937 17.3749 0.375 17.125C0.124938 16.8751 0 16.5625 0 16.25V1.25C0 0.9375 0.124938 0.624937 0.375 0.375C0.624937 0.125063 0.9375 0 1.25 0H7.5ZM7.5 5H11L7.5 1.5V5Z" fill="white" />
                </svg>
              </div>
            </div>
            <div className={styles.kpiBottom}>
              <span className={`${styles.trend} ${mockOverview.contracts.direction === "up" ? styles.trendUp : styles.trendDown}`}>
                <TrendIcon direction={mockOverview.contracts.direction} /> {mockOverview.contracts.trend}%
              </span>
              <span>{mockOverview.label.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.analyticRow}>
        <div className={styles.analyticCard}>
          <div className={styles.analyticHeader}>
            <div className={styles.analyticTitle}>
              <h2>Leads by Source</h2>
            </div>
            <button type="button" className={styles.dropdownBtn}>This Year <span className={styles.caret}>▼</span></button>
          </div>
          <ul className={styles.sourceList}>
            {mockSources.map((s) => (
              <li key={s.label}>
                <p><span>{s.count} {s.label}</span><span>{s.percent}%</span></p>
                <div className={styles.progress}>
                  <div className={`${styles.progressBar} ${s.bar}`} style={{ width: `${s.percent}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.analyticCard}>
          <div className={styles.analyticHeader}>
            <div className={styles.analyticTitle}>
              <h2>Leads by State</h2>
              <p>Total 124 leads this month.</p>
            </div>
            <button type="button" className={styles.dropdownBtn}>Choose State <span className={styles.caret}>▼</span></button>
          </div>
          <div className={styles.stateChart}>Chart (ApexCharts) - wire to /api/dashboard/state-summary</div>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <div className={styles.recentHeader}>
          <ul className={styles.tabs}>
            <li className={styles.tabsTitle}>Recent Activity</li>
            {tabs.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === t.id ? styles.active : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.activityTable}>
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Email</th>
                <th>Lead Status</th>
                <th>Source Form</th>
                <th>Lead Owners</th>
                <th>Created Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={6}><div className={styles.emptyState}><h3>No Leads Found</h3><p>No data for this period.</p></div></td></tr>
              ) : rows.map((r, i) => (
                <tr key={i}>
                  <td><Link href="/leads">{r.name}</Link></td>
                  <td>{r.email}</td>
                  <td><span className={`${styles.statusBadge} ${r.status === "New Lead" ? styles.badgeNeed : r.status === "Quoted" ? styles.badgeQuoted : styles.badgeCustomer}`}>{r.status}</span></td>
                  <td>{r.source}</td>
                  <td>{r.owner}</td>
                  <td>{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.viewAll}>
          <Link href="/leads">View All →</Link>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <div className={styles.recentHeader}>
          <ul className={styles.tabs}>
            <li className={styles.tabsTitle}>Open Task</li>
          </ul>
          <button type="button" className={styles.dropdownBtn}>This Year <span className={styles.caret}>▼</span></button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.activityTable}>
            <thead>
              <tr>
                <th>Owner</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {mockOpenTasks.length === 0 ? (
                <tr><td colSpan={4}><div className={styles.emptyState}><h3>No Open Tasks</h3><p>No open task data available for this period.</p><span>When a task is assigned and still open, it will appear here.</span></div></td></tr>
              ) : mockOpenTasks.map((t, i) => (
                <tr key={i}>
                  <td>{t.owner}</td>
                  <td>{t.status}</td>
                  <td>{t.priority}</td>
                  <td>{t.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.viewAll}>
          <Link href="/task/all-task">View All →</Link>
        </div>
      </div>
    </div>
  );
}
