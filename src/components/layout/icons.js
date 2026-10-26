export function GripLogoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="19" height="19" rx="3.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M15 8.5H9C7.6 8.5 6.5 9.6 6.5 11V13C6.5 14.4 7.6 15.5 9 15.5H15V12H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CollapseIcon({ collapsed }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      {collapsed ? (
        <polyline points="14 9 17 12 14 15" />
      ) : (
        <polyline points="16 9 13 12 16 15" />
      )}
    </svg>
  );
}

export function DashboardIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function LeadsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

export function QuotesIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function CustomersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function InvoicesIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l3-2 3 2 3-2 3 2 4-2V2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="12" y2="15" />
    </svg>
  );
}

export function TaskActivitiesIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <polyline points="9 14 11 16 15 11" />
    </svg>
  );
}

export function EmailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function PricingToolsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function MyBankIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <polyline points="3 10 12 4 21 10" />
      <line x1="6" y1="10" x2="6" y2="21" />
      <line x1="10" y1="10" x2="10" y2="21" />
      <line x1="14" y1="10" x2="14" y2="21" />
      <line x1="18" y1="10" x2="18" y2="21" />
    </svg>
  );
}

export function ConfigurationIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

export function AuditLogIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="11" cy="14" r="3" />
      <line x1="13.2" y1="16.2" x2="16" y2="19" />
    </svg>
  );
}

export function ReportIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function PermissionsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function ManufacturerIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

// Top Bar Action Icons
export function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <path d="M16.8971 16.0133L12.1771 11.2932C13.3113 9.9316 13.8768 8.1851 13.7561 6.41707C13.6354 4.64904 12.8378 2.99561 11.529 1.80073C10.2203 0.605848 8.50131 -0.0384808 6.72962 0.00177916C4.95794 0.0420392 3.26998 0.763788 2.01688 2.01688C0.763788 3.26998 0.0420392 4.95794 0.00177916 6.72962C-0.0384808 8.50131 0.605848 10.2203 1.80073 11.529C2.99561 12.8378 4.64904 13.6354 6.41707 13.7561C8.1851 13.8768 9.9316 13.3113 11.2932 12.1771L16.0133 16.8971L16.8971 16.0133ZM1.27212 6.89712C1.27212 5.7846 1.60202 4.69706 2.2201 3.77204C2.83819 2.84701 3.71669 2.12604 4.74453 1.7003C5.77236 1.27456 6.90336 1.16316 7.9945 1.3802C9.08565 1.59725 10.0879 2.13297 10.8746 2.91964C11.6613 3.70631 12.197 4.70859 12.414 5.79974C12.6311 6.89088 12.5197 8.02188 12.0939 9.04971C11.6682 10.0775 10.9472 10.9561 10.0222 11.5741C9.09718 12.1922 8.00964 12.5221 6.89712 12.5221C5.40579 12.5205 3.97601 11.9273 2.92147 10.8728C1.86694 9.81823 1.27377 8.38845 1.27212 6.89712Z" fill="currentColor" />
    </svg>
  );
}

export function RefreshIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M1.25 8.13379C1.24999 9.61579 1.72884 11.0584 2.61524 12.2461C3.50164 13.4337 4.74824 14.303 6.16895 14.7246C7.58977 15.1462 9.10919 15.0979 10.5 14.5859C11.8908 14.0739 13.0794 13.126 13.8877 11.8838H10.625V10.6338H15.625V15.6338H14.375V13.333C13.3069 14.6188 11.868 15.5442 10.2549 15.9824C8.6419 16.4206 6.93311 16.3508 5.36133 15.7822C3.78958 15.2137 2.43109 14.1743 1.47168 12.8057C0.512338 11.437 -0.00163948 9.80523 3.92876e-06 8.13379H1.25ZM5.99512 0.284182C7.60807 -0.153958 9.31694 -0.084127 10.8887 0.484377C12.4606 1.05299 13.8189 2.0931 14.7783 3.46192C15.7377 4.8307 16.2517 6.46229 16.25 8.13379H15C15.0001 6.65166 14.5212 5.20832 13.6348 4.02051C12.7484 2.83293 11.5017 1.96362 10.0811 1.54199C8.66016 1.12036 7.14088 1.16961 5.75 1.68164C4.35914 2.19368 3.17065 3.1415 2.36231 4.38379H5.625V5.63379H0.625004V0.633791H1.875V2.9336C2.94309 1.64777 4.38202 0.722419 5.99512 0.284182Z" fill="currentColor" />
    </svg>
  );
}

export function ScreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9.375 17.5H8.125V15.625H9.375V17.5ZM4.375 14.0127L3.0498 15.3379L2.16895 14.4561L3.49414 13.125L4.375 14.0127ZM15.3359 14.4521L14.4521 15.3359L13.127 14.0107L14.0107 13.126L15.3359 14.4521ZM8.75 3.75C10.0761 3.75 11.3475 4.27716 12.2852 5.21484C13.2228 6.15253 13.75 7.42392 13.75 8.75C13.75 9.73891 13.4566 10.7061 12.9072 11.5283C12.3578 12.3504 11.5766 12.9908 10.6631 13.3691C9.74951 13.7475 8.74425 13.8472 7.77441 13.6543C6.80453 13.4614 5.91409 12.9844 5.21484 12.2852C4.5156 11.5859 4.03864 10.6955 3.8457 9.72559C3.65279 8.75575 3.75249 7.75049 4.13086 6.83691C4.50924 5.92342 5.14962 5.14217 5.97168 4.59277C6.79392 4.04337 7.76109 3.75 8.75 3.75ZM8.75 5C7.75544 5 6.80189 5.39537 6.09863 6.09863C5.39537 6.80189 5 7.75544 5 8.75C5 9.74456 5.39537 10.6981 6.09863 11.4014C6.80189 12.1046 7.75544 12.5 8.75 12.5V5ZM1.875 9.375H0V8.125H1.875V9.375ZM17.5 9.375H15.625V8.125H17.5V9.375ZM4.36621 3.49414L3.48242 4.37793L2.15625 3.05176L3.04004 2.16797L4.36621 3.49414ZM15.335 3.0459L14.0088 4.37207L13.125 3.48828L14.4512 2.16211L15.335 3.0459ZM9.375 1.875H8.125V0H9.375V1.875Z" fill="currentColor" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg width="15" height="17" viewBox="0 0 15 17" fill="none" aria-hidden="true">
      <path d="M5.93923 1.5085C5.6527 2.73177 5.61372 3.99998 5.82456 5.23854C6.03541 6.4771 6.49183 7.66098 7.16698 8.72054C7.84212 9.78009 8.72235 10.6939 9.75588 11.4083C10.7894 12.1226 11.9554 12.623 13.1852 12.8801C12.5386 13.549 11.7642 14.0812 10.908 14.4451C10.0518 14.809 9.13118 14.9971 8.20085 14.9984C8.11429 14.9984 8.02698 15.0016 7.93973 14.9984C6.32014 14.9411 4.77179 14.3184 3.56358 13.2383C2.35538 12.1582 1.56366 10.689 1.32594 9.08593C1.08821 7.48286 1.41949 5.84716 2.26224 4.46293C3.10499 3.07869 4.40597 2.03336 5.93923 1.5085ZM6.86267 0C6.82608 5.71078e-05 6.78956 0.00331956 6.75354 0.00974998C4.76339 0.363242 2.97442 1.44063 1.73122 3.03441C0.48802 4.62818 -0.121479 6.6256 0.0201206 8.64194C0.161721 10.6583 1.0444 12.5509 2.49815 13.9553C3.9519 15.3597 5.87389 16.1764 7.89392 16.2483C7.99648 16.2521 8.09904 16.2483 8.20073 16.2483C9.51249 16.249 10.8051 15.9338 11.9694 15.3295C13.1336 14.7251 14.1352 13.8493 14.8895 12.7761C14.9506 12.6836 14.9863 12.5766 14.993 12.4659C14.9996 12.3553 14.977 12.2448 14.9273 12.1457C14.8777 12.0465 14.8028 11.9622 14.7102 11.9012C14.6176 11.8403 14.5106 11.8048 14.3999 11.7983C13.1513 11.6888 11.9446 11.2936 10.873 10.6433C9.80148 9.99299 8.89382 9.105 8.22021 8.04797C7.5466 6.99093 7.12507 5.79315 6.98821 4.54721C6.85135 3.30128 7.00282 2.04056 7.43092 0.8625C7.46733 0.768246 7.48071 0.666655 7.46993 0.566187C7.45914 0.465718 7.42451 0.36928 7.36892 0.284901C7.31333 0.200523 7.23838 0.130647 7.15032 0.0810903C7.06227 0.0315341 6.96364 0.00373236 6.86267 0Z" fill="currentColor" />
    </svg>
  );
}

export function PdfTemplateIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <rect x="8" y="9" width="3" height="3" rx="0.5" />
    </svg>
  );
}

