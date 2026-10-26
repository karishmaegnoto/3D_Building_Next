
export const LEAD_FIELD_GROUPS = [
  {
    group: 'Lead Details & Customer',
    icon: '👤',
    fields: [
      { key: 'fullName', label: 'Full Name' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'leadOwner', label: 'Lead Owner' },
      { key: 'leadOwnerAssist', label: 'Lead Owner Assist' },
      { key: 'primaryEmailType', label: 'Primary Email Selection' },
      { key: 'email', label: 'Primary Email Address' },
      { key: 'alternateEmail', label: 'Alternate Email' },
      { key: 'mobileNumber', label: 'Mobile' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'websiteSourceForm', label: 'Web Form' },
      { key: 'leadStatus', label: 'Lead Status' },
      { key: 'leadSource', label: 'Lead Source' },
      { key: 'manufacturer', label: 'Manufacturer' },
      { key: 'contactDate', label: 'Contact Date & Time' },
      { key: 'zipCode', label: 'Lead Zipcode' },
      { key: 'notes', label: 'Customer Notes' },
      { key: 'companyName', label: 'Company Name' },
    ],
  },
  {
    group: 'Address Details',
    icon: '📍',
    fields: [
      { key: 'address.addressLine1', label: 'Address Line 1' },
      { key: 'address.addressLine2', label: 'Address Line 2' },
      { key: 'address.city', label: 'City' },
      { key: 'address.state', label: 'State' },
      { key: 'address.country', label: 'Country' },
    ],
  },
  {
    group: 'Product Details',
    icon: '📦',
    fields: [
      { key: 'productDetails.productTitle', label: 'Product Title' },
      { key: 'productDetails.productUrl', label: 'Product URL' },
      { key: 'productDetails.estimated3DModel', label: '3D Estimator Model / URL' },
    ],
  },
  {
    group: 'Pricing Details',
    icon: '💰',
    fields: [
      { key: 'pricing.retailPrice', label: 'Retail Price' },
      { key: 'pricing.manufacturerDiscount', label: 'Manufacturer Discount' },
      { key: 'pricing.dealerDiscount', label: 'Dealer Discount' },
      { key: 'pricing.totalDiscount', label: 'Total Discount' },
      { key: 'pricing.subTotal', label: 'Sub Total' },
      { key: 'pricing.downPayment', label: 'Down Payment' },
      { key: 'pricing.tax', label: 'Tax' },
      { key: 'pricing.total', label: 'Total' },
      { key: 'pricing.extraLabor', label: 'Extra Labor' },
      { key: 'pricing.permitFees', label: 'Permit Fees' },
      { key: 'pricing.otherFees', label: 'Other Fees' },
      { key: 'pricing.surcharge', label: 'Surcharge' },
      { key: 'pricing.balanceDue', label: 'Balance Due' },
    ],
  },
  {
    group: 'Building Specifications (Main)',
    icon: '🏗️',
    fields: [
      { key: 'buildingSpecifications.installationZipcode', label: 'Installation Zipcode' },
      { key: 'buildingSpecifications.buildingType', label: 'Building Type' },
      { key: 'buildingSpecifications.surface', label: 'Installation Surface' },
      { key: 'buildingSpecifications.width', label: 'Building Width (ft)' },
      { key: 'buildingSpecifications.length', label: 'Building Length (ft)' },
      { key: 'buildingSpecifications.height', label: 'Building Height (ft)' },
      { key: 'buildingSpecifications.certification', label: 'Certification' },
      { key: 'buildingSpecifications.gauge', label: 'Gauge' },
      { key: 'buildingSpecifications.roofStyle', label: 'Roof Style' },
      { key: 'buildingSpecifications.wallSiding', label: 'Wall Siding' },
      { key: 'buildingSpecifications.frontend', label: 'Front End' },
      { key: 'buildingSpecifications.backend', label: 'Back End' },
      { key: 'buildingSpecifications.leftside', label: 'Left Side' },
      { key: 'buildingSpecifications.rightSide', label: 'Right Side' },
    ],
  },
  {
    group: 'Garage Door Options',
    icon: '🚪',
    fields: [
      { key: 'buildingSpecifications.allGarageDoorsSummary', label: '★ All Garage Doors (Combined Summary - All Rows)' },
      { key: 'buildingSpecifications.garageDoors.0.size', label: 'Garage Door 1 Size (e.g. 6\'x6\', 8\'x8\', 10\'x10\')' },
      { key: 'buildingSpecifications.garageDoors.0.sideEnd', label: 'Garage Door 1 Side/End (e.g. Left Side, Front, Back)' },
      { key: 'buildingSpecifications.garageDoors.0.qty', label: 'Garage Door 1 Quantity' },
      { key: 'buildingSpecifications.garageDoors.0.doorColor', label: 'Garage Door 1 Color' },
      { key: 'buildingSpecifications.garageDoors.0.certification', label: 'Garage Door 1 Certification' },
      { key: 'buildingSpecifications.garageDoors.0.notes', label: 'Garage Door 1 Notes' },
      { key: 'buildingSpecifications.garageDoors.1.size', label: 'Garage Door 2 Size' },
      { key: 'buildingSpecifications.garageDoors.1.sideEnd', label: 'Garage Door 2 Side/End' },
      { key: 'buildingSpecifications.garageDoors.1.qty', label: 'Garage Door 2 Quantity' },
      { key: 'buildingSpecifications.garageDoors.1.doorColor', label: 'Garage Door 2 Color' },
      { key: 'buildingSpecifications.garageDoors.1.certification', label: 'Garage Door 2 Certification' },
      { key: 'buildingSpecifications.garageDoors.1.notes', label: 'Garage Door 2 Notes' },
      { key: 'buildingSpecifications.garageDoors.2.size', label: 'Garage Door 3 Size' },
      { key: 'buildingSpecifications.garageDoors.2.qty', label: 'Garage Door 3 Quantity' },
    ],
  },
  {
    group: 'Walk-In Door Options',
    icon: '🚶',
    fields: [
      { key: 'buildingSpecifications.allWalkInDoorsSummary', label: '★ All Walk-in Doors (Combined Summary - All Rows)' },
      { key: 'buildingSpecifications.walkInDoors.0.size', label: 'Walk-in Door 1 Size (e.g. 36\'x80\')' },
      { key: 'buildingSpecifications.walkInDoors.0.location', label: 'Walk-in Door 1 Location (e.g. Right Side)' },
      { key: 'buildingSpecifications.walkInDoors.0.color', label: 'Walk-in Door 1 Color / Style (e.g. With Window)' },
      { key: 'buildingSpecifications.walkInDoors.0.qty', label: 'Walk-in Door 1 Quantity' },
      { key: 'buildingSpecifications.walkInDoors.0.notes', label: 'Walk-in Door 1 Notes' },
      { key: 'buildingSpecifications.walkInDoors.1.size', label: 'Walk-in Door 2 Size' },
      { key: 'buildingSpecifications.walkInDoors.1.location', label: 'Walk-in Door 2 Location' },
      { key: 'buildingSpecifications.walkInDoors.1.color', label: 'Walk-in Door 2 Color / Style' },
      { key: 'buildingSpecifications.walkInDoors.1.qty', label: 'Walk-in Door 2 Quantity' },
      { key: 'buildingSpecifications.walkInDoors.1.notes', label: 'Walk-in Door 2 Notes' },
    ],
  },
  {
    group: 'Window Options',
    icon: '🪟',
    fields: [
      { key: 'buildingSpecifications.allWindowsSummary', label: '★ All Windows (Combined Summary - All Rows)' },
      { key: 'buildingSpecifications.windowOptions.0.size', label: 'Window 1 Size (e.g. 30\'x36\')' },
      { key: 'buildingSpecifications.windowOptions.0.location', label: 'Window 1 Location (e.g. Right Side)' },
      { key: 'buildingSpecifications.windowOptions.0.qty', label: 'Window 1 Quantity' },
      { key: 'buildingSpecifications.windowOptions.0.notes', label: 'Window 1 Notes' },
      { key: 'buildingSpecifications.windowOptions.1.size', label: 'Window 2 Size' },
      { key: 'buildingSpecifications.windowOptions.1.location', label: 'Window 2 Location' },
      { key: 'buildingSpecifications.windowOptions.1.qty', label: 'Window 2 Quantity' },
      { key: 'buildingSpecifications.windowOptions.1.notes', label: 'Window 2 Notes' },
    ],
  },
  {
    group: 'Color Options',
    icon: '🎨',
    fields: [
      { key: 'buildingSpecifications.colorOptions.roofColor', label: 'Roof Color' },
      { key: 'buildingSpecifications.colorOptions.wallColor', label: 'Wall Color' },
      { key: 'buildingSpecifications.colorOptions.trimColor', label: 'Trim Color' },
      { key: 'buildingSpecifications.colorOptions.garageDoorColor', label: 'Garage Door Color' },
      { key: 'buildingSpecifications.colorOptions.wainscoat', label: 'Wainscoat / Wainscot Color' },
    ],
  },
  {
    group: 'Other Building Options',
    icon: '⚙️',
    fields: [
      { key: 'buildingSpecifications.otherOptions.gaugePanel', label: 'Gauge Panel' },
      { key: 'buildingSpecifications.otherOptions.jTrim', label: 'J-Trim' },
      { key: 'buildingSpecifications.otherOptions.extraAnchors', label: 'Extra Anchors' },
      { key: 'buildingSpecifications.otherOptions.extraBraces', label: 'Extra Braces' },
      { key: 'buildingSpecifications.otherOptions.extraBow', label: 'Extra Bow' },
      { key: 'buildingSpecifications.otherOptions.trussUpgraded', label: 'Truss Upgraded' },
      { key: 'buildingSpecifications.otherOptions.coloredScrews', label: 'Colored Screws' },
    ],
  },
];

// ============================================================================
// 2. Legacy / Compatibility Defaults (Kept empty for safety)
// ============================================================================

export const DEFAULT_TEMPLATE_FIELDS = [];
export const DEFAULT_INITIAL_MAPPINGS = {};

// ============================================================================
// 3. Smart Auto-Match Heuristic Rules (Regex pattern -> Canonical field key)
// ============================================================================

export const AUTO_MATCH_RULES = [
  // --- Customer & Contact Identity ---
  { test: /customer.*name|client.*name|^name$/i, match: 'fullName' },
  { test: /first.*name/i, match: 'firstName' },
  { test: /last.*name/i, match: 'lastName' },
  { test: /alt.*email/i, match: 'alternateEmail' },
  { test: /email/i, match: 'email' },
  { test: /cell|mobile/i, match: 'mobileNumber' },
  { test: /phone|tel/i, match: 'phone' },
  { test: /company/i, match: 'companyName' },
  { test: /title|job/i, match: 'jobTitle' },
  { test: /lead.*num|lead.*id|quote.*num/i, match: 'leadNumber' },
  { test: /date|quote.*date/i, match: 'contactDate' },
  { test: /prefer.*date|delivery.*date/i, match: 'preferDateTime' },
  { test: /dealer|specialist|rep|owner/i, match: 'leadOwner' },
  { test: /manufactur/i, match: 'manufacturer' },
  { test: /lead.*source|source/i, match: 'leadSource' },
  { test: /note|special.*instruct/i, match: 'notes' },

  // --- Address & Location ---
  { test: /address.*2|apt|suite|unit/i, match: 'address.addressLine2' },
  { test: /address|street/i, match: 'address.addressLine1' },
  { test: /city/i, match: 'address.city' },
  { test: /state/i, match: 'address.state' },
  { test: /zip|postal/i, match: 'zipCode' },
  { test: /country/i, match: 'address.country' },

  // --- Product & 3D Model ---
  { test: /product.*title|item.*title/i, match: 'productDetails.productTitle' },
  { test: /product.*url/i, match: 'productDetails.productUrl' },
  { test: /3d.*ref|estimator.*ref|3d.*model/i, match: 'reference3dNumber' },

  // --- Building Specifications ---
  { test: /install.*zip/i, match: 'buildingSpecifications.installationZipcode' },
  { test: /build.*type/i, match: 'buildingSpecifications.buildingType' },
  { test: /surface|ground|foundation/i, match: 'buildingSpecifications.surface' },
  { test: /^w\.?$|width/i, match: 'buildingSpecifications.width' },
  { test: /^l\.?$|length/i, match: 'buildingSpecifications.length' },
  { test: /^ht\.?$|height/i, match: 'buildingSpecifications.height' },
  { test: /roof.*style|roof/i, match: 'buildingSpecifications.roofStyle' },
  { test: /gauge/i, match: 'buildingSpecifications.gauge' },
  { test: /certif/i, match: 'buildingSpecifications.certification' },
  { test: /wall.*siding|siding/i, match: 'buildingSpecifications.wallSiding' },
  { test: /front.*end/i, match: 'buildingSpecifications.frontend' },
  { test: /back.*end/i, match: 'buildingSpecifications.backend' },
  { test: /left.*side/i, match: 'buildingSpecifications.leftside' },
  { test: /right.*side/i, match: 'buildingSpecifications.rightSide' },

  // --- Garage Doors ---
  { test: /garage.*door.*size|door.*1.*size|^gd.*size/i, match: 'buildingSpecifications.garageDoors.0.size' },
  { test: /garage.*door.*side|door.*1.*side|^gd.*side/i, match: 'buildingSpecifications.garageDoors.0.sideEnd' },
  { test: /garage.*door.*qty|door.*1.*qty/i, match: 'buildingSpecifications.garageDoors.0.qty' },
  { test: /garage.*door.*color|door.*1.*color/i, match: 'buildingSpecifications.garageDoors.0.doorColor' },
  { test: /garage.*door.*cert|door.*1.*cert/i, match: 'buildingSpecifications.garageDoors.0.certification' },

  // --- Walk-in Doors ---
  { test: /walk.*door.*size|man.*door.*size|walkin.*size/i, match: 'buildingSpecifications.walkInDoors.0.size' },
  { test: /walk.*door.*loc|walkin.*loc/i, match: 'buildingSpecifications.walkInDoors.0.location' },
  { test: /walk.*door.*qty|walkin.*qty/i, match: 'buildingSpecifications.walkInDoors.0.qty' },
  { test: /walk.*door.*col|walkin.*col/i, match: 'buildingSpecifications.walkInDoors.0.color' },

  // --- Windows ---
  { test: /window.*size|win.*1.*size/i, match: 'buildingSpecifications.windowOptions.0.size' },
  { test: /window.*loc|win.*1.*loc/i, match: 'buildingSpecifications.windowOptions.0.location' },
  { test: /window.*qty|win.*1.*qty/i, match: 'buildingSpecifications.windowOptions.0.qty' },

  // --- Colors ---
  { test: /roof.*color/i, match: 'buildingSpecifications.colorOptions.roofColor' },
  { test: /wall.*color/i, match: 'buildingSpecifications.colorOptions.wallColor' },
  { test: /trim.*color/i, match: 'buildingSpecifications.colorOptions.trimColor' },
  { test: /wainscot|wainscoat/i, match: 'buildingSpecifications.colorOptions.wainscoat' },

  // --- Accessories & Hardware ---
  { test: /gauge.*panel/i, match: 'buildingSpecifications.otherOptions.gaugePanel' },
  { test: /j.*trim/i, match: 'buildingSpecifications.otherOptions.jTrim' },
  { test: /anchor/i, match: 'buildingSpecifications.otherOptions.extraAnchors' },
  { test: /brace/i, match: 'buildingSpecifications.otherOptions.extraBraces' },
  { test: /extra.*bow/i, match: 'buildingSpecifications.otherOptions.extraBow' },
  { test: /truss/i, match: 'buildingSpecifications.otherOptions.trussUpgraded' },
  { test: /screw/i, match: 'buildingSpecifications.otherOptions.coloredScrews' },

  // --- Financials, Pricing & Taxes ---
  { test: /retail.*price/i, match: 'pricing.retailPrice' },
  { test: /manufactur.*discount/i, match: 'pricing.manufacturerDiscount' },
  { test: /dealer.*discount/i, match: 'pricing.dealerDiscount' },
  { test: /total.*discount/i, match: 'pricing.totalDiscount' },
  { test: /subtotal|sub.*total/i, match: 'pricing.subTotal' },
  { test: /down.*payment|deposit/i, match: 'pricing.downPayment' },
  { test: /^tax$|tax.*amount/i, match: 'pricing.tax' },
  { test: /^total$|total.*amount|total.*price/i, match: 'pricing.total' },
  { test: /extra.*labor|labor/i, match: 'pricing.extraLabor' },
  { test: /permit.*fee/i, match: 'pricing.permitFees' },
  { test: /other.*fee/i, match: 'pricing.otherFees' },
  { test: /surcharge/i, match: 'pricing.surcharge' },
  { test: /balance.*due/i, match: 'pricing.balanceDue' },
];

const QUOTE_FIELD_CATEGORY_RULES = [
  {
    group: 'Customer & Contact Details',
    pattern: /^(name|first_name|last_name|full_name|email|phone|day_phone|evening_phone|cell|mobile|address|install_address|city|state|zip|county|inside_city|dealer|dealer_name|dealer_ph)/i,
  },
  {
    group: 'Building Specifications',
    pattern: /^(width|length|height|roof|vertical_roof|boxed_eve|regular_style|sildes_ends|sides_ends|trim|framing_gauage|framing_gauge|gauge|certification|surface|building)/i,
  },
  {
    group: 'Line Items & Descriptions',
    pattern: /^(description|price|item|desc)\d*$/i,
  },
  {
    group: 'Pricing & Calculations',
    pattern: /^(subtotal|tax|total|down_payment|extra_labor|equip__rental|equip_rental|balance_due|card_fee|crad_balance|deposit|payment|discount|fees|surcharge)/i,
  },
  {
    group: 'Dates, Signatures & Notes',
    pattern: /^(date|date1|contactdate|signature|signature_\d+|sign|order_date)/i,
  },
];

export function groupQuoteTemplateFields(fieldsList = []) {
  if (!Array.isArray(fieldsList) || fieldsList.length === 0) return [];

  const buckets = new Map();
  QUOTE_FIELD_CATEGORY_RULES.forEach(({ group }) => buckets.set(group, []));
  buckets.set('Other Quote Fields', []);

  fieldsList.forEach((fieldKey) => {
    if (typeof fieldKey !== 'string') return;
    const cleanKey = fieldKey.trim();
    if (!cleanKey) return;

    const matchedRule = QUOTE_FIELD_CATEGORY_RULES.find(({ pattern }) => pattern.test(cleanKey));
    const targetGroup = matchedRule ? matchedRule.group : 'Other Quote Fields';

    buckets.get(targetGroup).push({ key: cleanKey, label: cleanKey });
  });

  const grouped = [];
  buckets.forEach((fields, group) => {
    if (fields.length > 0) {
      grouped.push({ group, fields });
    }
  });

  return grouped.length > 0
    ? grouped
    : [{ group: 'Quote Template Fields', fields: fieldsList.map((f) => ({ key: f, label: f })) }];
}
