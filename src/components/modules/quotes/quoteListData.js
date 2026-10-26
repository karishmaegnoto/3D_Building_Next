export const createdByOptions = [
  "john_doe",
  "jane_smith",
  "mike_jones",
  "sarah_williams",
];

export const leadSourceOptions = [
  "Website",
  "Facebook",
  "Google Ads",
  "Referral",
  "Walk-in",
];

export const leadOwnerOptions = [
  "john_doe",
  "jane_smith",
  "mike_jones",
  "sarah_williams",
  
];

export const stateOptions = [
  { id: "1", name: "Texas" },
  { id: "2", name: "Florida" },
  { id: "3", name: "California" },
  { id: "4", name: "Georgia" },
  { id: "5", name: "Ohio" },
];

export const manufacturerOptions = [
  "Viking Steel",
  "Eagle Metal",
  "Rhino Buildings",
  "Titan Structures",
];

export const leadStatusOptions = [
  "New",
  "Contacted",
  "Quoted",
  "Negotiation",
  "Won",
  "Lost",
];

export const webformOptions = [
  "Contact Form",
  "Quote Form",
  "Barn Form",
  "Garage Form",
];

export const dateFilterOptions = [
  "on",
  "before",
  "after",
  "between",
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "this_year",
  "last_year",
];

export const statusBadgeClass = {
  "Contract Sent": "ls_customer",
  "New Lead": "ls_success",
  "Quote Sent": "ls_incomplete",
  New: "ls_success",
  Contacted: "ls_success",
  Quoted: "ls_incomplete",
  Negotiation: "ls_inprogress",
  Won: "ls_customer",
  Lost: "ls_taskbuilding",
};

export function formatOwner(username) {
  return String(username || "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const mockQuotes = [
  { id: 201, pid: 201, name: "Jimmy Kelly", owner: "viking_steel_structures", total: "40000", dateAdded: "08/19/2026", status: "Contract Sent", source: "Website", stateId: "1", zip: "75001", manufacturer: "Viking Steel", webform: "Quote Form", createdBy: "john_doe" },
  { id: 202, pid: 202, name: "Colter Lewis", owner: "viking_steel_structures", total: "40,000.00", dateAdded: "08/17/2026", status: "Contract Sent", source: "Facebook", stateId: "2", zip: "32003", manufacturer: "Eagle Metal", webform: "Barn Form", createdBy: "jane_smith" },
  { id: 203, pid: 203, name: "Amy Stephanie", owner: "viking_steel_structures", total: "12000", dateAdded: "08/06/2026", status: "New Lead", source: "Google Ads", stateId: "1", zip: "75082", manufacturer: "Rhino Buildings", webform: "Quote Form", createdBy: "john_doe" },
  { id: 204, pid: 204, name: "Amy Stephanie", owner: "viking_steel_structures", total: "12000", dateAdded: "08/06/2026", status: "Quote Sent", source: "Referral", stateId: "4", zip: "30301", manufacturer: "Titan Structures", webform: "Contact Form", createdBy: "sarah_williams" },
];

export const ROWS_PER_PAGE = 10;
