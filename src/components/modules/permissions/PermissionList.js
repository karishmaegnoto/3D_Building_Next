"use client";

import { useState, useMemo } from "react";
import styles from "./permissions.module.scss";

const MOCK_ROLES = [
  { id: 1, role: "Admin", slug: "admin" },
  { id: 2, role: "Manager", slug: "manager" },
  { id: 3, role: "Sales", slug: "sales" },
  { id: 4, role: "Support", slug: "support" },
  { id: 6, role: "Designer", slug: "designer" },
];

const MOCK_MODULES = [
  {
    name: "Dashboard",
    share: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect width="7.5" height="7.5" transform="translate(1.25 1.25)" fill="white" fillOpacity="0.8" />
        <rect width="7.5" height="7.5" transform="translate(11.25 1.25)" fill="white" fillOpacity="0.8" />
        <rect width="7.5" height="7.5" transform="translate(1.25 11.25)" fill="white" fillOpacity="0.8" />
        <rect width="7.5" height="7.5" transform="translate(11.25 11.25)" fill="white" fillOpacity="0.8" />
      </svg>
    ),
  },
  {
    name: "Leads",
    share: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2.5L2.5 6.25V13.75L10 17.5L17.5 13.75V6.25L10 2.5Z" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Quotes",
    share: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 2.5H15V17.5H5V2.5Z" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    name: "Customers",
    share: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="6.25" r="3.75" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" />
        <path d="M3.75 16.25C3.75 13.75 6.25 12.5 10 12.5C13.75 12.5 16.25 13.75 16.25 16.25" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    name: "Contracts",
    share: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect width="13.75" height="15" transform="translate(3.125 2.5)" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    name: "Invoices",
    share: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 2.5H16V17.5L13.5 16L10 17.5L6.5 16L4 17.5V2.5Z" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    name: "Payments",
    share: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect width="16.25" height="11.25" transform="translate(1.875 4.375)" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" />
        <line x1="1.875" y1="8.125" x2="18.125" y2="8.125" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const INITIAL_PERMISSIONS = {
  1: {
    dashboard: { view: true, edit: true, delete: true, add: true, mass: false, share: false, all: true },
    leads: { view: true, edit: true, delete: true, add: true, mass: true, share: true, all: true },
    quotes: { view: true, edit: true, delete: true, add: true, mass: true, share: true, all: true },
    customers: { view: true, edit: true, delete: true, add: true, mass: true, share: true, all: true },
    contracts: { view: true, edit: true, delete: true, add: true, mass: false, share: false, all: true },
    invoices: { view: true, edit: true, delete: true, add: true, mass: false, share: false, all: true },
    payments: { view: true, edit: true, delete: true, add: true, mass: false, share: false, all: true },
  },
  2: {
    dashboard: { view: true, edit: true, delete: false, add: true, mass: false, share: false, all: false },
    leads: { view: true, edit: true, delete: true, add: true, mass: true, share: true, all: false },
    quotes: { view: true, edit: true, delete: false, add: true, mass: true, share: true, all: false },
    customers: { view: true, edit: true, delete: false, add: true, mass: true, share: true, all: false },
    contracts: { view: true, edit: true, delete: false, add: true, mass: false, share: false, all: false },
    invoices: { view: true, edit: true, delete: false, add: true, mass: false, share: false, all: false },
    payments: { view: true, edit: true, delete: false, add: true, mass: false, share: false, all: false },
  },
  3: {
    dashboard: { view: true, edit: false, delete: false, add: false, mass: false, share: false, all: false },
    leads: { view: true, edit: true, delete: false, add: true, mass: false, share: true, all: false },
    quotes: { view: true, edit: true, delete: false, add: true, mass: false, share: true, all: false },
    customers: { view: true, edit: false, delete: false, add: false, mass: false, share: false, all: false },
    contracts: { view: true, edit: false, delete: false, add: false, mass: false, share: false, all: false },
    invoices: { view: true, edit: false, delete: false, add: false, mass: false, share: false, all: false },
    payments: { view: false, edit: false, delete: false, add: false, mass: false, share: false, all: false },
  },
};

export function PermissionList() {
  const [roles] = useState(MOCK_ROLES);
  const [activeTab, setActiveTab] = useState(1); // role ID or 'custom'
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [flash, setFlash] = useState(null);

  const currentRole = roles.find((r) => r.id === activeTab) || { role: "Custom", id: "custom" };

  const roleStats = useMemo(() => {
    const stats = {};
    roles.forEach((r) => {
      const rolePerms = permissions[r.id] || {};
      let active = 0;
      let total = 0;

      MOCK_MODULES.forEach((m) => {
        const mKey = m.name.toLowerCase();
        const actions = ["view", "edit", "delete", "add"];
        if (m.share) {
          actions.push("mass", "share");
        }
        total += actions.length;

        const mPerms = rolePerms[mKey] || {};
        actions.forEach((act) => {
          if (mPerms[act]) active++;
        });
      });

      const percent = total > 0 ? Math.round((active / total) * 100) : 0;
      stats[r.id] = { active, total, percent };
    });
    return stats;
  }, [permissions, roles]);

  const activeStats = roleStats[activeTab] || { active: 0, total: 34, percent: 0 };

  const handleToggle = (roleId, moduleName, action) => {
    if (roleId === "custom") return;
    const mKey = moduleName.toLowerCase();
    setPermissions((prev) => {
      const roleState = prev[roleId] || {};
      const modState = roleState[mKey] || { view: false, edit: false, delete: false, add: false, mass: false, share: false, all: false };

      if (action === "all") {
        const nextVal = !modState.all;
        return {
          ...prev,
          [roleId]: {
            ...roleState,
            [mKey]: {
              view: nextVal,
              edit: nextVal,
              delete: nextVal,
              add: nextVal,
              mass: nextVal,
              share: nextVal,
              all: nextVal,
            },
          },
        };
      }

      const updatedMod = { ...modState, [action]: !modState[action] };
      const actions = ["view", "edit", "delete", "add"];
      if (MOCK_MODULES.find((m) => m.name === moduleName)?.share) {
        actions.push("mass", "share");
      }
      const allChecked = actions.every((act) => updatedMod[act]);
      updatedMod.all = allChecked;

      return {
        ...prev,
        [roleId]: {
          ...roleState,
          [mKey]: updatedMod,
        },
      };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFlash("Permission settings updated successfully.");
    setTimeout(() => setFlash(null), 3000);
  };

  return (
    <div className={`prtm-content-wrapper common_search_html new_lead_data ${styles.permission_page_ui}`}>
      <div className={styles.permission_layout_wrap}>
        {/* Left Sidebar */}
        <div className={styles.permission_sidebar}>
          <div className={styles.permission_sidebar_inner}>
            <ul className={styles.permission_role_list}>
              {roles.map((r) => {
                const st = roleStats[r.id] || { active: 0, total: 34, percent: 0 };
                const isActive = activeTab === r.id;
                return (
                  <li key={r.id} className={`${styles.permission_role_item} ${isActive ? styles.active : ""}`}>
                    <button type="button" onClick={() => setActiveTab(r.id)}>
                      <span className={styles.permission_role_link}>
                        <div className={styles.permission_role_top}>
                          <span className={styles.permission_role_name}>{r.role}</span>
                          <span className={styles.permission_role_arrow}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none">
                              <path d="M4.275 3.75L0.525 7.5L0 6.975L3.225 3.75L0 0.525L0.525 0L4.275 3.75Z" fill="white" />
                            </svg>
                          </span>
                        </div>
                        <div className={styles.permission_role_progress_wrap}>
                          <div className={styles.permission_role_progress}>
                            <span style={{ width: `${st.percent}%` }} />
                          </div>
                          <span className={styles.permission_role_percent}>{st.percent}%</span>
                        </div>
                      </span>
                    </button>
                  </li>
                );
              })}
              <li className={`${styles.permission_role_item} ${activeTab === "custom" ? styles.active : ""}`}>
                <button type="button" onClick={() => setActiveTab("custom")}>
                  <span className={styles.permission_role_link}>
                    <div className={styles.permission_role_top}>
                      <span className={styles.permission_role_name}>Custom</span>
                      <span className={styles.permission_role_arrow}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none">
                          <path d="M4.275 3.75L0.525 7.5L0 6.975L3.225 3.75L0 0.525L0.525 0L4.275 3.75Z" fill="white" />
                        </svg>
                      </span>
                    </div>
                    <div className={styles.permission_role_progress_wrap}>
                          <div className={styles.permission_role_progress}>
                            <span className={styles.progressFillZero} />
                          </div>
                      <span className={styles.permission_role_percent}>User Override</span>
                    </div>
                  </span>
                </button>
              </li>
            </ul>

            <div className={styles.permission_role_summary}>
              <p className={styles.permission_summary_label}>ROLE SUMMARY</p>
              <div className={styles.permission_summary_box}>
                <div className={styles.permission_summary_item}>
                  <span>Active Permissions</span>
                  <strong>{activeStats.active}</strong>
                </div>
                <div className={styles.permission_summary_item}>
                  <span>Total Available</span>
                  <strong>{activeStats.total}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className={styles.permission_content_panel}>
          {flash && (
            <div className={styles.flashBanner}>
              {flash}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className={styles.permission_page_header}>
              <div className={styles.permission_header_title}>
                <h3>Permission Settings</h3>
                <p>
                  {currentRole.role} - {activeStats.percent}% enabled
                </p>
              </div>

              <div className={styles.permission_header_actions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setActiveTab(1)}>
                  Cancel
                </button>
                <button type="submit" className={styles.cm_save_btn} title="Save">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                    <path d="M18.819,7.306,15.694,4.181A.625.625,0,0,0,15.25,4h-10A1.25,1.25,0,0,0,4,5.25v12.5A1.25,1.25,0,0,0,5.25,19h12.5A1.25,1.25,0,0,0,19,17.75v-10A.625.625,0,0,0,18.819,7.306ZM9,5.25h5v2.5H9Zm5,12.5H9v-5h5Zm1.25,0v-5A1.25,1.25,0,0,0,14,11.5H9a1.25,1.25,0,0,0-1.25,1.25v5H5.25V5.25h2.5v2.5A1.25,1.25,0,0,0,9,9h5a1.25,1.25,0,0,0,1.25-1.25V5.506l2.5,2.5V17.75Z" transform="translate(-1.5 -1.5)" fill="#131416" />
                  </svg>
                  Save
                </button>
              </div>
            </div>

            <div className={styles.permission_tab_content}>
              {activeTab === "custom" ? (
                <div className={styles.permission_matrix_wrap}>
                  <div className={styles.custom_permission_empty_state}>Select a user to manage custom permission overrides.</div>
                </div>
              ) : (
                <div className={styles.permission_matrix_wrap}>
                  <table className={styles.permission_matrix_table}>
                    <thead>
                      <tr>
                        <th className={styles.module_col}>Module</th>
                        <th>View</th>
                        <th>Edit</th>
                        <th>Delete</th>
                        <th>Add</th>
                        <th>Mass Transfer</th>
                        <th>Share</th>
                        <th>Full Ctrl</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_MODULES.map((m) => {
                        const mKey = m.name.toLowerCase();
                        const rolePerms = (permissions[activeTab] || {})[mKey] || {};
                        const actions = ["view", "edit", "delete", "add"];
                        if (m.share) actions.push("mass", "share");
                        const activeCnt = actions.filter((a) => rolePerms[a]).length;
                        const totalCnt = actions.length;

                        return (
                          <tr key={m.name}>
                            <td className={styles.module_cell}>
                              <div className={styles.module_info_box}>
                                <div className={styles.module_icon_box}>{m.icon}</div>
                                <div className={styles.module_text_box}>
                                  <h5>{m.name}</h5>
                                  <span>
                                    {activeCnt}/{totalCnt} Active
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <label className={styles.permission_switch}>
                                <input type="checkbox" checked={!!rolePerms.view} onChange={() => handleToggle(activeTab, m.name, "view")} />
                                <span className={styles.permission_slider} />
                              </label>
                            </td>

                            <td>
                              <label className={styles.permission_switch}>
                                <input type="checkbox" checked={!!rolePerms.edit} onChange={() => handleToggle(activeTab, m.name, "edit")} />
                                <span className={styles.permission_slider} />
                              </label>
                            </td>

                            <td>
                              <label className={styles.permission_switch}>
                                <input type="checkbox" checked={!!rolePerms.delete} onChange={() => handleToggle(activeTab, m.name, "delete")} />
                                <span className={styles.permission_slider} />
                              </label>
                            </td>

                            <td>
                              <label className={styles.permission_switch}>
                                <input type="checkbox" checked={!!rolePerms.add} onChange={() => handleToggle(activeTab, m.name, "add")} />
                                <span className={styles.permission_slider} />
                              </label>
                            </td>

                            <td className={!m.share ? styles.permission_na_cell : ""}>
                              {m.share ? (
                                <label className={styles.permission_switch}>
                                  <input type="checkbox" checked={!!rolePerms.mass} onChange={() => handleToggle(activeTab, m.name, "mass")} />
                                  <span className={styles.permission_slider} />
                                </label>
                              ) : (
                                <span className={styles.permission_na}>—</span>
                              )}
                            </td>

                            <td className={!m.share ? styles.permission_na_cell : ""}>
                              {m.share ? (
                                <label className={styles.permission_switch}>
                                  <input type="checkbox" checked={!!rolePerms.share} onChange={() => handleToggle(activeTab, m.name, "share")} />
                                  <span className={styles.permission_slider} />
                                </label>
                              ) : (
                                <span className={styles.permission_na}>—</span>
                              )}
                            </td>

                            <td>
                              <label className={styles.permission_switch}>
                                <input type="checkbox" checked={!!rolePerms.all} onChange={() => handleToggle(activeTab, m.name, "all")} />
                                <span className={styles.permission_slider} />
                              </label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PermissionList;
