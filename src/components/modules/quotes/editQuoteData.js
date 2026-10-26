export const navTabs = [
  { id: "tab_39", label: "Add Quote" },
  { id: "tab_32", label: "Lead Details" },
  { id: "tab_40", label: "Building Specialist Info" },
  { id: "tab_33", label: "Address Details" },
  { id: "tab_34", label: "Product Details" },
  { id: "tab_35", label: "Building Specifications" },
  { id: "tab_42", label: "All Quotes" },
  { id: "tab_43", label: "All Contracts" },
  { id: "tab_36", label: "Attachments" },
];

export const ownerAssistOptions = ["john_doe", "jane_smith", "mike_jones", "sarah_williams"];
export const manufacturerOptions = ["Viking Steel", "Eagle Metal", "Rhino Buildings", "Titan Structures"];
export const leadStatusOptions = ["New Lead", "Contacted", "Quote Sent", "Quoted", "Contract Sent", "Contract Signed", "Customer Won"];
export const leadSourceOptions = ["Website", "Facebook", "Google Ads", "Referral", "Walk-in"];
export const buildingTypeOptions = ["Garage", "Carport", "Barn", "Custom", "Commercial"];

export function formatOwner(username) {
  return String(username || "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const mockQuote = {
  id: "201",
  leadOwner: "viking_steel_structures",
  shareWith: [],
  ownerAssist: ["john_doe"],
  manufacturer: "Viking Steel",
  mobile: "(214) 555-0182",
  phone: "(214) 555-0147",
  zipcode: "75001",
  firstName: "Jimmy",
  lastName: "Kelly",
  emailPrimary: "jimmy.kelly@example.com",
  emailAlternate: "",
  webform: "Quote Form",
  leadStatus: "Contract Sent",
  leadSource: "Website",
  contactDate: "08/19/2026 10:30:00",
  notes: "",
  quoteDate: "08/19/2026",
  quoteName: "Jimmy Kelly",
  directLine: "(214) 555-0190",
  officeNotes: [
    { text: "Customer asked for engineered drawings.", by: "john_doe", editedOn: "Tuesday, Aug 18, 2026, 2:15 PM" },
    { text: "Follow up on deposit next week.", by: "jane_smith", editedOn: "Monday, Aug 17, 2026, 11:02 AM" },
  ],
  address: { line1: "4214 Commerce St", line2: "Suite 120", city: "Dallas", state: "Texas", country: "USA" },
  product: { title: "30x40 Vertical Roof Garage", url: "https://example.com/products/30x40-garage", colorUrl: "https://example.com/colors/charcoal" },
  building: { zipcode: "75001", surface: "Concrete Foundation", type: "Garage" },
  colors: [
    { key: "roof_color", label: "Roof Color", value: "Charcoal" },
    { key: "wall_color", label: "Wall Color", value: "Sandalwood" },
    { key: "trim_color", label: "Trim Color", value: "White" },
    { key: "garage_door_color", label: "Garage Door Color", value: "Charcoal" },
    { key: "wainscoat", label: "Wainscoat", value: "None" },
  ],
  otherOptions: [
    { key: "gauge_panel", label: "Gauge Panel", value: "14 Gauge" },
    { key: "jtrim", label: "J-Trim", value: "Yes" },
    { key: "extra_anchors", label: "Extra Anchors", value: "4" },
    { key: "extra_braces", label: "Extra Braces", value: "2" },
    { key: "extra_bow", label: "Extra Bow", value: "0" },
    { key: "truss_upgrade", label: "Truss Upgrade", value: "No" },
    { key: "colored_screws", label: "Colored Screws", value: "Yes" },
  ],
  quoteHistory: [
    { name: "Quote 1", date: "08/19/2026 10:30 AM", badge: "Sent" },
    { name: "Quote 2", date: "08/18/2026 03:12 PM", badge: "Opened" },
  ],
  contractHistory: [
    { name: "Contract 1", date: "08/19/2026 11:00 AM", badge: "Sent" },
  ],
  attachments: [{ name: "site-photo-front.jpg" }, { name: "permit-draft.pdf" }],
  order: {
    buildingPrice: "40000.00",
    manuDiscountPct: "5",
    discountPrice: "500.00",
    dealerDiscountPct: "2",
    subtotal: "37200.00",
    deposit: "3720.00",
    depositType: "$",
    taxPct: "8.25",
    totalBeforeAddons: "40269.00",
    extraLabor: "350.00",
    permitFees: "250.00",
    calcsPlans: "450.00",
    surchargePct: "0",
    balanceDue: "41319.00",
    downPayment: "3720.00",
  },
};
