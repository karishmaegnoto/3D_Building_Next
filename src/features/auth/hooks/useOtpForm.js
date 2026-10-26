import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";

const RESEND_COOLDOWN_SECONDS = 30;

export function useOtpForm(onSuccess) {
  const { verifyOtp, resendOtp, clearError, loading, error } = useAuthStore();

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const otp = digits.join("");

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    if (error) clearError();

    // If pasted or typed multiple digits
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 1) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = cleaned[i] || "";
      }
      setDigits(newDigits);
      const nextFocus = Math.min(cleaned.length, 5);
      inputRefs[nextFocus]?.current?.focus();
      return;
    }

    // Single digit input
    const singleChar = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleChar;
    setDigits(newDigits);

    // Auto advance focus to next box
    if (singleChar && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs[index - 1]?.current?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    if (error) clearError();
    const pastedData = event.clipboardData.getData("text/plain");
    const cleaned = pastedData.replace(/\D/g, "").slice(0, 6);
    if (!cleaned) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < cleaned.length; i++) {
      newDigits[i] = cleaned[i];
    }
    setDigits(newDigits);
    const targetIndex = Math.min(cleaned.length, 5);
    inputRefs[targetIndex]?.current?.focus();
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    const result = await resendOtp();
    if (result.success) {
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    if (otp.length < 6) return;

    const result = await verifyOtp(otp);
    if (result.success && onSuccess) {
      onSuccess(result);
    }
  };

  const resetDigits = () => {
    setDigits(["", "", "", "", "", ""]);
    inputRefs[0]?.current?.focus();
  };

  return {
    digits,
    setDigits,
    otp,
    inputRefs,
    resendCooldown,
    loading,
    error,
    handleDigitChange,
    handleKeyDown,
    handlePaste,
    handleResend,
    handleSubmit,
    resetDigits,
  };
}

export default useOtpForm;
