export const US_PHONE_MAX_DIGITS = 16;
export const US_PHONE_MIN_DIGITS = 10;
export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_DIGITS = 15;
export const ZIP_MAX_LENGTH = 6;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function stripNonDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function formatUSPhoneNumber(value) {
  let digits = stripNonDigits(value).substring(0, US_PHONE_MAX_DIGITS);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.substring(0, 3)}-${digits.substring(3, 6)}`;
  return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6, 16)}`;
}

export function isValidUSPhone(value) {
  return stripNonDigits(value).length >= US_PHONE_MIN_DIGITS;
}

export function isValidPhoneFlexible(value) {
  const len = stripNonDigits(value).length;
  return len >= PHONE_MIN_DIGITS && len <= PHONE_MAX_DIGITS;
}

export function sanitizeZipCode(value) {
  return stripNonDigits(value).substring(0, ZIP_MAX_LENGTH);
}

export function isValidZipCode(value) {
  const digits = stripNonDigits(value);
  return digits.length > 0 && digits.length <= ZIP_MAX_LENGTH;
}

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value ?? "").trim());
}

export function isRequired(value) {
  if (Array.isArray(value)) return value.length > 0;
  return String(value ?? "").trim().length > 0;
}

export function validatePasswordPair(password, confirmPassword) {
  const next = String(password ?? "");
  const confirm = String(confirmPassword ?? "");
  if (next === "" && confirm === "") return null;
  if (next !== "" && confirm === "") return "Please confirm the new password.";
  if (next === "" && confirm !== "") return "Enter the new password first.";
  if (next !== confirm) return "Passwords do not match.";
  return null;
}

export function validateLeadForm(data = {}) {
  const errors = {};
  const v = (key) => (typeof data[key] === "string" ? data[key].trim() : data[key]);

  if (!isRequired(v("lastName"))) {
    errors.lastName = "Last Name is required.";
  }
  if (!isRequired(v("leadOwner"))) {
    errors.leadOwner = "Lead Owner is required.";
  }
  if (!isRequired(v("leadOwnerAssist")) || v("leadOwnerAssist") === "None") {
    errors.leadOwnerAssist = "Lead Owner Assist is required.";
  }

  if (!isRequired(data.mobileNumber)) {
    errors.mobileNumber = "Mobile No. is required.";
  } else if (!isValidUSPhone(data.mobileNumber)) {
    errors.mobileNumber = "Enter a valid 10-digit Mobile No.";
  }

  if (isRequired(data.phone) && !isValidUSPhone(data.phone)) {
    errors.phone = "Enter a valid 10-digit Phone No.";
  }

  if (!isRequired(data.zipCode)) {
    errors.zipCode = "Zipcode is required.";
  } else if (!isValidZipCode(data.zipCode)) {
    errors.zipCode = "Zipcode must be up to 6 digits.";
  }

  if (data.primaryEmailType === "alternate") {
    if (!isRequired(v("alternateEmail"))) {
      errors.alternateEmail = "Alternate Email is required.";
    } else if (!isValidEmail(data.alternateEmail)) {
      errors.alternateEmail = "Enter a valid Alternate Email.";
    }
  } else {
    if (!isRequired(v("email"))) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(data.email)) {
      errors.email = "Enter a valid Email.";
    }
  }

  return errors;
}
