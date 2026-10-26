// Placeholder data + helpers for the Contracts UI (edit-lead > All Contracts).
// Replace the marked helpers with real API calls once backend contracts endpoints are shared.

export const API_PENDING_MESSAGE =
  "This action will be enabled once the contract API is integrated.";

// payment_is_check parity: 1 Check, 2 Wire, 3 Cash, 6 Manual, 5 Digital, 4 PO
export const paymentModeOptions = [
  { value: "1", label: "Payment by Check" },
  { value: "2", label: "Wire Transfer" },
  { value: "3", label: "Cash" },
  { value: "6", label: "Manual" },
  { value: "5", label: "Digital Payment" },
];

export const PO_PAYMENT_MODE = "4";
export const DIGITAL_PAYMENT_MODE = "5";

// No contract exists until one is created (Payment Mode / PO / Email Contract
// stay hidden while this list is empty).
export const initialContracts = [];

export function createContractRecord(index, payload = {}) {
  return {
    id: `contract-${Date.now()}-${index}`,
    contractId: payload.contractId || "",
    name: payload.name || `Contract ${index + 1}`,
    status: "",
    signDate: "",
    paymentMode: DIGITAL_PAYMENT_MODE,
    quoteId: payload.quoteId || "",
    manufacturerId: payload.manufacturerId || "",
    templateId: payload.templateId || "",
    fields: payload.fields || {},
    isVoid: false,
    isCancelled: false,
    isRevised: false,
  };
}

export function contractLabel(contract, idx) {
  return contract?.name || `Contract ${idx + 1}`;
}

export function quoteLabel(quote, idx) {
  return quote?.name || quote?.quoteNumber || `Quote ${idx + 1}`;
}
