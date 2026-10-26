"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PdfTemplateIcon } from "./icons";
import styles from "./sidebar.module.scss";

const DYNAMIC_MODULES = [
  { ModuleName: "Dashboard", FetchClass: "DashboardController", FetchMethod: "index", FetchAction: "dashboard/index", ICONS: `<svg id="dashboard" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect id="Rectangle_6560" class="str0" data-name="Rectangle 6560" width="1.25" height="3.125" transform="translate(15 13.125)" fill="#fff" /><rect id="Rectangle_6561" class="str0" data-name="Rectangle 6561" width="1.25" height="6.25" transform="translate(12.5 10)" fill="#fff" /><path id="Path_37974" data-name="Path 37974" d="M9.125,22.25A3.129,3.129,0,0,1,6,19.125H7.25A1.875,1.875,0,1,0,9.125,17.25V16a3.125,3.125,0,0,1,0,6.25Z" transform="translate(-2.25 -6)" fill="#fff" /><path id="Path_37975" data-name="Path 37975" d="M18.25,2h-15A1.251,1.251,0,0,0,2,3.25v15A1.251,1.251,0,0,0,3.25,19.5h15a1.252,1.252,0,0,0,1.25-1.25v-15A1.251,1.251,0,0,0,18.25,2Zm0,5.625H9.5V3.25h8.75ZM8.25,3.25V7.625h-5V3.25Zm-5,15V8.875h15V18.25Z" transform="translate(-0.75 -0.75)" fill="#fff" /><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" width="20" height="20" fill="none" /></svg>` },
  { ModuleName: "Leads", FetchClass: "LeadController", FetchMethod: "index", FetchAction: "lead/all-leads", ICONS: `<svg id="notebook--reference" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path id="Path_37988" data-name="Path 37988" d="M3.25,20v1.25H5.491L2,24.741l.884.884,3.491-3.491v2.241h1.25V20Z" transform="translate(-0.75 -7.5)" fill="#fff"/><rect id="Rectangle_6576" class="str0" data-name="Rectangle 6576" width="4.375" height="1.25" transform="translate(11.875 6.25)" fill="#fff"/><rect id="Rectangle_6577" class="str0" data-name="Rectangle 6577" width="4.375" height="1.25" transform="translate(11.875 9.375)" fill="#fff"/><rect id="Rectangle_6578" class="str0" data-name="Rectangle 6578" width="4.375" height="1.25" transform="translate(11.875 12.5)" fill="#fff"/><path id="Path_37989" data-name="Path 37989" d="M18.25,5h-15A1.251,1.251,0,0,0,2,6.25V12.5H3.25V6.25h6.875v12.5H18.25A1.251,1.251,0,0,0,19.5,17.5V6.25A1.251,1.251,0,0,0,18.25,5ZM11.375,17.5V6.25H18.25V17.5Z" transform="translate(-0.75 -1.875)" fill="#fff"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" width="20" height="20" fill="none"/></svg>` },
  { ModuleName: "Quotes", FetchClass: "QuoteController", FetchMethod: "index", FetchAction: "quote/quote-list", ICONS: `<svg id="currency" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path id="Path_37881" data-name="Path 37881" d="M17.25,10.125V8.875h-2.5V7H13.5V8.875H12.25A1.251,1.251,0,0,0,11,10.125V12a1.251,1.251,0,0,0,1.25,1.25H16v1.875H11v1.25h2.5V18.25h1.25V16.375H16a1.251,1.251,0,0,0,1.25-1.25V13.25A1.251,1.251,0,0,0,16,12H12.25V10.125Z" transform="translate(-4.125 -2.625)" fill="#fff" /><path id="Path_37882" data-name="Path 37882" d="M10.75,3.25a7.5,7.5,0,1,1-7.5,7.5,7.5,7.5,0,0,1,7.5-7.5m0-1.25a8.75,8.75,0,1,0,8.75,8.75A8.75,8.75,0,0,0,10.75,2Z" transform="translate(-0.75 -0.75)" fill="#fff" /><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" width="20" height="20" fill="none" /></svg>` },
  {
    ModuleName: "Quote PDF Template",
    label: "Quote PDF Template",
    href: "/quote-pdf-template",
    icon: PdfTemplateIcon,
    FetchClass: "QuoteController",
    FetchMethod: "pdfTemplate",
    FetchAction: "quote/pdf-template",
    ICONS: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><rect x="8" y="9" width="3" height="3" rx="0.5"/></svg>`,
  },
  { ModuleName: "Customers", FetchClass: "CustomerController", FetchMethod: "index", FetchAction: "customer/customer-list", ICONS: `<svg id="order-details" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path id="Path_37991" data-name="Path 37991" d="M15.625,21h-3.75A1.875,1.875,0,0,0,10,22.875v1.25h1.25v-1.25a.625.625,0,0,1,.625-.625h3.75a.625.625,0,0,1,.625.625v1.25H17.5v-1.25A1.875,1.875,0,0,0,15.625,21Z" transform="translate(-3.75 -7.875)" fill="#fff"/><path id="Path_37992" data-name="Path 37992" d="M14.5,17A2.5,2.5,0,1,0,12,14.5,2.5,2.5,0,0,0,14.5,17Zm0-3.75a1.25,1.25,0,1,1-1.25,1.25A1.25,1.25,0,0,1,14.5,13.25Z" transform="translate(-4.5 -4.5)" fill="#fff"/><path id="Path_37993" data-name="Path 37993" d="M17.5,3.875H15.625V3.25A1.25,1.25,0,0,0,14.375,2h-5a1.25,1.25,0,0,0-1.25,1.25v.625H6.25A1.25,1.25,0,0,0,5,5.125V18.25A1.25,1.25,0,0,0,6.25,19.5H17.5a1.25,1.25,0,0,0,1.25-1.25V5.125A1.25,1.25,0,0,0,17.5,3.875ZM9.375,3.25h5v2.5h-5Zm8.125,15H6.25V5.125H8.125V7h7.5V5.125H17.5Z" transform="translate(-1.875 -0.75)" fill="#fff"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" width="20" height="20" fill="none"/></svg>` },
  { ModuleName: "Task Activities", FetchClass: "TaskController", FetchMethod: "index", FetchAction: "task/all-task", ICONS: `<svg id="task--star" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path id="Path_38002" data-name="Path 38002" d="M20.375,17l1.394,2.7,2.981.425L22.563,22.1l.938,3.021L20.375,23.38,17.25,25.125l.938-3.021L16,20.125l3.063-.425Z" transform="translate(-6 -6.375)" fill="#fff"></path><path id="Path_38003" data-name="Path 38003" d="M17.5,3.875H15.625V3.25A1.254,1.254,0,0,0,14.375,2h-5a1.254,1.254,0,0,0-1.25,1.25v.625H6.25A1.254,1.254,0,0,0,5,5.125V18.25A1.254,1.254,0,0,0,6.25,19.5h4.375V18.25H6.25V5.125H8.125V7h7.5V5.125H17.5V9.5h1.25V5.125A1.254,1.254,0,0,0,17.5,3.875ZM14.375,5.75h-5V3.25h5Z" transform="translate(-1.875 -0.75)" fill="#fff"></path><rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" width="20" height="20" fill="none"></rect></svg>` },
  { ModuleName: "Audit Log", FetchClass: "DashboardController", FetchMethod: "getAuditLog", FetchAction: "audit-log", ICONS: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.75 17.5H10V18.75H3.75C3.0625 18.75 2.5 18.1875 2.5 17.5V15H1.25V13.75H2.5V10.625H1.25V9.375H2.5V6.25H1.25V5H2.5V2.5C2.5 1.8125 3.0625 1.25 3.75 1.25H15C15.6875 1.25 16.25 1.8125 16.25 2.5V12.5H15V2.5H3.75V5H5V6.25H3.75V9.375H5V10.625H3.75V13.75H5V15H3.75V17.5ZM12.5 5H7.5V6.25H12.5V5ZM7.5 8.125H12.5V9.375H7.5V8.125ZM12.5 11.25H7.5V12.5H12.5V11.25ZM14.375 16.9998L12.75 15.3748L11.875 16.2498L14.375 18.7498L18.75 14.3748L17.875 13.4998L14.375 16.9998Z" fill="#fff"/></svg>` },
  { ModuleName: "Report", FetchClass: "ReportController", FetchMethod: "index", FetchAction: "report/report-all", ICONS: `<svg id="receipt" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect class="str0" id="Rectangle_6593" data-name="Rectangle 6593" width="1.25" height="1.25" transform="translate(13.125 10)" fill="#fff"/><rect class="str0" id="Rectangle_6594" data-name="Rectangle 6594" width="5" height="1.25" transform="translate(5.625 10)" fill="#fff"/><rect class="str0" id="Rectangle_6595" data-name="Rectangle 6595" width="1.25" height="1.25" transform="translate(13.125 7.5)" fill="#fff"/><rect class="str0" id="Rectangle_6596" data-name="Rectangle 6596" width="5" height="1.25" transform="translate(5.625 7.5)" fill="#fff"/><rect class="str0" id="Rectangle_6597" data-name="Rectangle 6597" width="8.75" height="1.25" transform="translate(5.625 5)" fill="#fff"/><path id="Path_38007" data-name="Path 38007" d="M17.5,2H6.25A1.251,1.251,0,0,0,5,3.25V18.875a.625.625,0,0,0,.625.625H6.25a.624.624,0,0,0,.5-.25l1.375-1.833L9.5,19.25a.647.647,0,0,0,1,0l1.375-1.833L13.25,19.25a.647.647,0,0,0,1,0l1.375-1.833L17,19.25a.625.625,0,0,0,.5.25h.625a.625.625,0,0,0,.625-.625V3.25A1.251,1.251,0,0,0,17.5,2Zm0,15.833L16.125,16a.647.647,0,0,0-1,0L13.75,17.833,12.375,16a.647.647,0,0,0-1,0L10,17.833,8.625,16a.647.647,0,0,0-1,0L6.25,17.833V3.25H17.5Z" transform="translate(-1.875 -0.75)" fill="#fff"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" width="20" height="20" fill="none"/></svg>` },
  { ModuleName: "Email", FetchClass: "EmailController", FetchMethod: "index", FetchAction: "email/email-list", ICONS: `<svg id="email" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path id="Path_37933" data-name="Path 37933" d="M18.25,6h-15A1.25,1.25,0,0,0,2,7.25v10A1.25,1.25,0,0,0,3.25,18.5h15a1.25,1.25,0,0,0,1.25-1.25v-10A1.25,1.25,0,0,0,18.25,6ZM16.875,7.25,10.75,11.488,4.625,7.25ZM3.25,17.25V7.819l7.144,4.944a.625.625,0,0,0,.712,0L18.25,7.819V17.25Z" transform="translate(-0.75 -2.25)" fill="#fff"></path><rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" width="20" height="20" fill="none"></rect></svg>` },
  { ModuleName: "Pricing Tools", FetchClass: "PriceBookController", FetchMethod: "index", FetchAction: "pricebook/price-book-list", ICONS: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.3749 13.7499H14.6874C15.6897 13.7435 16.6542 13.3669 17.3955 12.6924C18.1369 12.0179 18.6028 11.0932 18.7036 10.096C18.8044 9.09884 18.533 8.09959 17.9416 7.29039C17.3502 6.48119 16.4806 5.91916 15.4999 5.71235C15.2301 4.45393 14.5369 3.32609 13.536 2.51702C12.535 1.70796 11.2869 1.2666 9.99991 1.2666C8.71288 1.2666 7.46478 1.70796 6.46386 2.51702C5.46293 3.32609 4.76973 4.45393 4.49991 5.71235C3.51921 5.91916 2.64957 6.48119 2.05819 7.29039C1.46681 8.09959 1.19544 9.09884 1.29624 10.096C1.39705 11.0932 1.86291 12.0179 2.60428 12.6924C3.34564 13.3669 4.31017 13.7435 5.31241 13.7499H5.62491V12.4999H5.31241C4.56649 12.5297 3.83927 12.262 3.29072 11.7556C2.74218 11.2493 2.41725 10.5458 2.38741 9.79986C2.35757 9.05393 2.62528 8.32671 3.13162 7.77817C3.63797 7.22962 4.34149 6.90469 5.08741 6.87485H5.62491L5.63741 6.36235C5.77607 5.31013 6.29249 4.34419 7.09048 3.64447C7.88846 2.94474 8.91359 2.55895 9.97491 2.55895C11.0362 2.55895 12.0614 2.94474 12.8593 3.64447C13.6573 4.34419 14.1738 5.31013 14.3124 6.36235L14.3749 6.87485H14.9124C15.6583 6.90469 16.3619 7.22962 16.8682 7.77817C17.3745 8.32671 17.6422 9.05393 17.6124 9.79986C17.5826 10.5458 17.2576 11.2493 16.7091 11.7556C16.1606 12.262 15.4333 12.5297 14.6874 12.4999H14.3749V13.7499ZM7.75616 12.1311L6.87491 11.2499L9.99991 8.12486L13.1249 11.2499L12.2437 12.1311L10.6249 10.5186V18.1249H9.37491V10.5186L7.75616 12.1311Z" fill="white"/></svg>` },
  { ModuleName: "Users", FetchClass: "UserController", FetchMethod: "index", FetchAction: "user/all-users", ICONS: `<svg id="user--multiple" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path id="Path_37924" data-name="Path 37924" d="M27.375,25.5h-1.25V22.375A3.129,3.129,0,0,0,23,19.25V18a4.38,4.38,0,0,1,4.375,4.375Z" transform="translate(-8.625 -6.75)" fill="#fff"/><path id="Path_37925" data-name="Path 37925" d="M14.5,25.5H13.25V22.375a3.129,3.129,0,0,0-3.125-3.125H6.375A3.129,3.129,0,0,0,3.25,22.375V25.5H2V22.375A4.38,4.38,0,0,1,6.375,18h3.75A4.38,4.38,0,0,1,14.5,22.375Z" transform="translate(-0.75 -6.75)" fill="#fff"/><path id="Path_37926" data-name="Path 37926" d="M20,2V3.25A3.125,3.125,0,0,1,20,9.5v1.25A4.375,4.375,0,1,0,20,2Z" transform="translate(-7.5 -0.75)" fill="#fff"/><path id="Path_37927" data-name="Path 37927" d="M9.375,3.25A3.125,3.125,0,1,1,6.25,6.375,3.125,3.125,0,0,1,9.375,3.25m0-1.25A4.375,4.375,0,1,0,13.75,6.375A4.375,4.375,0,0,0,9.375,2Z" transform="translate(-1.875 -0.75)" fill="#fff"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" width="20" height="20" fill="none"/></svg>` },
  { ModuleName: "Permissions", FetchClass: "PermissionController", FetchMethod: "index", FetchAction: "permission/all-permission", ICONS: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 1.25C15.6875 1.25 16.25 1.8125 16.25 2.5V7.5H15V2.5H2.5V10.625C2.5 12.6875 3.625 14.625 5.5 15.5625L8.125 17V18.4375L4.875 16.6875C2.625 15.5 1.25 13.1875 1.25 10.625V2.5C1.25 1.8125 1.8125 1.25 2.5 1.25H15ZM12.5 6.25H5V7.5H12.5V6.25ZM17.5 11.875V13.75C18.1875 13.75 18.75 14.3125 18.75 15V18.125C18.75 18.8125 18.1875 19.375 17.5 19.375H12.5C11.8125 19.375 11.25 18.8125 11.25 18.125V15C11.25 14.3125 11.8125 13.75 12.5 13.75V11.875C12.5 10.5 13.625 9.375 15 9.375C16.375 9.375 17.5 10.5 17.5 11.875ZM15 10.625C14.3125 10.625 13.75 11.1875 13.75 11.875V13.75H16.25V11.875C16.25 11.1875 15.6875 10.625 15 10.625ZM12.5 15V18.125H17.5V15H12.5ZM5 10H8.75V11.25H5V10Z" fill="white"/></svg>` },
  { ModuleName: "My Bank", FetchClass: "BankingController", FetchMethod: "myBank", FetchAction: "banking/mybank", ICONS: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.3169 6.6919C17.1997 6.80911 17.0408 6.87496 16.875 6.87496H16.25V15H17.5V16.25H2.5V15H3.75V6.87496H3.125C2.95924 6.87496 2.80027 6.80911 2.68306 6.6919C2.56585 6.57469 2.5 6.41572 2.5 6.24996V4.37496C2.50005 4.24652 2.53968 4.12121 2.61349 4.01608C2.6873 3.91096 2.79171 3.83113 2.9125 3.78746L9.7875 1.28746C9.92482 1.23782 10.0752 1.23782 10.2125 1.28746L17.0875 3.78746C17.2083 3.83113 17.3127 3.91096 17.3865 4.01608C17.4603 4.12121 17.4999 4.24652 17.5 4.37496V6.24996C17.5 6.41572 17.4342 6.57469 17.3169 6.6919ZM10 2.53746L3.75 4.81246V5.62496H16.25V4.81246L10 2.53746ZM8.75 6.87496V15H11.25V6.87496H8.75ZM7.5 6.87496H5V15H7.5V6.87496H12.5V15H15V6.87496H12.5V15ZM1.25 18.75V17.5H18.75V18.75H1.25Z" fill="#fff"/></svg>` },
  { ModuleName: "Invoices", FetchClass: "InvoiceController", FetchMethod: "index", FetchAction: "invoice/invoice-list", ICONS: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 1.25H16.25C16.5815 1.25 16.8995 1.3817 17.1339 1.61612C17.3683 1.85054 17.5 2.16848 17.5 2.5V17.5C17.5 17.8315 17.3683 18.1495 17.1339 18.3839C16.8995 18.6183 16.5815 18.75 16.25 18.75H5C4.66848 18.75 4.35054 18.6183 4.11612 18.3839C3.8817 18.1495 3.75 17.8315 3.75 17.5V15H2.5V13.75H3.75V10.625H2.5V9.375H3.75V6.25H2.5V5H3.75V2.5C3.75 2.16848 3.8817 1.85054 4.11612 1.61612C4.35054 1.3817 4.66848 1.25 5 1.25ZM5 17.5H16.25V2.5H5V5H6.25V6.25H5V9.375H6.25V10.625H5V13.75H6.25V15H5V17.5ZM8.75 5H13.75V6.25H8.75V5ZM13.75 9.375H8.75V10.625H13.75V9.375ZM8.75 13.75H13.75V15H8.75V13.75Z" fill="white"/></svg>` },
  { ModuleName: "Manufacturer", FetchClass: "ManufacturerController", FetchMethod: "index", FetchAction: "manufacturer/manufacturer-list", ICONS: `<svg id="users" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path id="Path_37957" data-name="Path 37957" d="M17.78,11.24v-.956l1.2-1.05a1.25,1.25,0,0,0,.237-1.594l-1.475-2.5a1.261,1.261,0,0,0-1.481-.562l-1.519.512a7.094,7.094,0,0,0-.819-.469L13.6,3.046a1.25,1.25,0,0,0-1.25-1.006H9.43A1.25,1.25,0,0,0,8.18,3.046L7.861,4.621a7.175,7.175,0,0,0-.825.469L5.549,4.552a1.25,1.25,0,0,0-.4-.038,1.25,1.25,0,0,0-1.081.625L2.592,7.64a1.25,1.25,0,0,0,.256,1.569L4.03,10.29v.956L2.849,12.3a1.25,1.25,0,0,0-.256,1.594l1.475,2.5a1.261,1.261,0,0,0,1.481.563l1.519-.512a7.094,7.094,0,0,0,.819.469L8.2,18.484a1.25,1.25,0,0,0,1.25,1.006H12.4a1.25,1.25,0,0,0,1.25-1.006l.319-1.575a7.175,7.175,0,0,0,.825-.469l1.513.513a1.261,1.261,0,0,0,1.481-.562l1.425-2.5a1.25,1.25,0,0,0-.256-1.569Zm-1.119,4.525-2.144-.725a5.538,5.538,0,0,1-1.694.981l-.444,2.244H9.43l-.444-2.219A5.85,5.85,0,0,1,7.3,15.065l-2.15.7-1.475-2.5,1.7-1.5a5.562,5.562,0,0,1,0-1.956l-1.7-1.544,1.475-2.5,2.144.725a5.537,5.537,0,0,1,1.694-.981L9.43,3.265h2.95l.444,2.219a5.85,5.85,0,0,1,1.688.981l2.15-.7,1.475,2.5-1.7,1.5a5.563,5.563,0,0,1,0,1.956l1.7,1.544Z" transform="translate(-0.905 -0.765)" fill="#fff"></path><path id="Path_37958" data-name="Path 37958" d="M13.75,17.5a3.75,3.75,0,1,1,3.75-3.75,3.713,3.713,0,0,1-3.75,3.75Zm0-6.25a2.444,2.444,0,1,0,1.785.715A2.444,2.444,0,0,0,13.75,11.25Z" transform="translate(-3.75 -3.75)" fill="#fff"></path><rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" width="20" height="20" fill="none"></rect></svg>` },
  { ModuleName: "Configuration", FetchClass: "PaymentController", FetchMethod: "index", FetchAction: "payment/connection", ICONS: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" viewBox="0 0 24 24"><path d="M2 5.75C2 4.78 2.78 4 3.75 4h16.5C21.22 4 22 4.78 22 5.75v12.5c0 .97-.78 1.75-1.75 1.75H3.75C2.78 20 2 19.22 2 18.25V5.75ZM3.5 8.5v9.75c0 .14.11.25.25.25h16.5c.14 0 .25-.11.25-.25V8.5H3.5ZM20.5 6.5H3.5v1h17v-1ZM6 14h4a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1 0-1.5Z"/></svg>` },
];

const CATEGORY_MAP = {
  Dashboard: "CORE", Leads: "CORE", Quotes: "CORE", "Quote PDF Template": "CORE", Customers: "CORE", Invoices: "CORE", Agreements: "CORE",
  "Task Activities": "WORK", Email: "WORK",
  Configuration: "FINANCE", "My Bank": "FINANCE", "Pricing Tools": "FINANCE",
  Report: "REPORT", "Audit Log": "REPORT",
  Users: "ADMIN", Permissions: "ADMIN", Manufacturer: "ADMIN",
};

const GROUP_ORDER = ["CORE", "WORK", "FINANCE", "REPORT", "ADMIN", "OTHERS"];
const ROUTE_MAP = {
  Dashboard: "/dashboard", Leads: "/leads", Quotes: "/quote/quote-list", "Quote PDF Template": "/quote-pdf-template", Customers: "/customers", Invoices: "/invoices",
  "Task Activities": "/task-activities", Email: "/chat", "Pricing Tools": "/price-book", "My Bank": "/payments", Configuration: "/payment/connection", Report: "/reports", "Audit Log": "/reports", Users: "/user/all-users", Permissions: "/permission/all-permission", Manufacturer: "/manufacturer/manufacturer-list",
};

export default function Sidebar({ collapsed }) {
  const pathname = usePathname();
  const grouped = { CORE: [], WORK: [], FINANCE: [], REPORT: [], ADMIN: [], OTHERS: [] };
  DYNAMIC_MODULES.forEach((m) => {
    const cat = CATEGORY_MAP[m.ModuleName] || "OTHERS";
    grouped[cat].push(m);
  });

  return (
    <div className={`prtm-sidebar ${collapsed ? "collapse" : ""} ${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={`prtm-sidebar-back ${styles.sidebarBack}`} />
      <div className={`prtm-sidebar-nav-wrapper ${styles.navWrapper}`}>
        <div className={`prtm-sidebar-menu ${styles.navMenu}`}>
          <nav className={`sidebar-nav collapse ${collapsed ? "" : "in"} ${styles.sideNav}`}>
            <div className={`sidebar-wrapper ${styles.sideWrap}`}>
              {(() => {
                let isFirstSection = true;
                return GROUP_ORDER.map((section) => {
                  const mods = grouped[section];
                  if (!mods || mods.length === 0) return null;
                  const isFirst = isFirstSection;
                  if (section !== "OTHERS") {
                    isFirstSection = false;
                  }
                  return (
                    <Fragment key={section}>
                      {section !== "OTHERS" && (
                        <div
                          className={`menu-section-header ${styles.sectionHeader} ${isFirst ? styles.firstSectionHeader : ""
                            }`}
                        >
                          {!collapsed && section}
                        </div>
                      )}

                      <ul className={`list-unstyled sidebar-menu ${styles.menuList}`}>
                        {mods.map((m) => {
                          const href = m.href || ROUTE_MAP[m.ModuleName] || `/${m.slug}`;
                          const label = m.label || m.ModuleName;
                          const isActive =
                            pathname === href ||
                            (href !== "/dashboard" && pathname.startsWith(href)) ||
                            (m.ModuleName === "Leads" && pathname.startsWith("/lead/"));
                          return (
                            <li key={m.ModuleName || label} className={isActive ? "active" : ""}>
                              <Link
                                href={href}
                                prefetch={false}
                                title={collapsed ? label : undefined}
                                className={`${styles.menuLink} ${isActive ? styles.active : ""}`}
                              >
                                {m.icon ? (
                                  <span className={`menu-icon ${styles.menuIcon}`}>
                                    <m.icon />
                                  </span>
                                ) : (
                                  <span className={`menu-icon ${styles.menuIcon}`} dangerouslySetInnerHTML={{ __html: m.ICONS }} />
                                )}
                                <span className={`menu-text ${styles.menuText}`}>{label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </Fragment>
                  );
                });
              })()}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
