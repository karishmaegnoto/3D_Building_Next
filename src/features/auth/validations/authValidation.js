export const validateEmail = (email) => {
  if (!email || typeof email !== "string") return "Email is required";
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return "Please enter a valid email address";
  return null;
};

export const validatePassword = (password) => {
  if (!password || typeof password !== "string") return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
};

export const validateOtp = (otp) => {
  if (!otp || typeof otp !== "string") return "OTP code is required";
  const clean = otp.replace(/\D/g, "");
  if (clean.length < 6) return "Please enter the complete verification code";
  return null;
};

export const validateCompanyName = (name) => {
  if (!name || typeof name !== "string") return "Company name is required";
  if (!name.trim()) return "Company name is required";
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || typeof phone !== "string") return "Phone number is required";
  const clean = phone.trim();
  if (!clean) return "Phone number is required";
  if (clean.length < 7) return "Please enter a valid phone number";
  return null;
};

export const validateAddress = (address) => {
  if (!address || typeof address !== "string") return "Address is required";
  if (!address.trim()) return "Address is required";
  return null;
};

export const maskEmail = (email) => {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return "d*@outlook.com";
  }
  const [user, domain] = email.split("@");
  if (user.length <= 1) {
    return `${user}*@${domain}`;
  }
  return `${user[0]}*@${domain}`;
};
