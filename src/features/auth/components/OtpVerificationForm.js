import { maskEmail } from "../validations/authValidation";
import styles from "@/features/auth/auth.module.scss";

export default function OtpVerificationForm({
  digits = ["", "", "", "", "", ""],
  otp = "",
  inputRefs = [],
  loading = false,
  resendCooldown = 0,
  email = "",
  error = "",
  onDigitChange,
  onKeyDown,
  onPaste,
  onResend,
  onBack,
  onSubmit,
}) {
  const currentDigits =
    Array.isArray(digits) && digits.length === 6
      ? digits
      : (otp || "").padEnd(6, " ").slice(0, 6).split("").map((c) => (c === " " ? "" : c));

  const otpLength = currentDigits.join("").trim().length;
  const isSubmitDisabled = loading || otpLength < 6;

  return (
    <div className={styles.otpCard}>
      <header className={styles.otpHeader}>
        <h2 className={styles.otpTitle}>Verify your identity</h2>
        <p className={styles.otpSubtitle}>
          We&apos;ve sent a 6-digit verification code to your registered email address ({maskEmail(email)}).
        </p>
      </header>

      {error && (
        <div className={styles.alertError} role="alert">
          <span aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form className={styles.otpForm} onSubmit={onSubmit} noValidate>
        <div className={styles.otpBoxesGroup} onPaste={onPaste}>
          {currentDigits.map((digit, index) => (
            <div key={index} className={styles.otpBoxWrapper}>
              <input
                ref={inputRefs?.[index]}
                className={`${styles.otpDigitBox} ${digit ? styles.filled : ""} ${error ? styles.boxError : ""}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={digit}
                autoFocus={index === 0}
                disabled={loading}
                aria-label={`Digit ${index + 1}`}
                onFocus={(e) => e.target.select()}
                onChange={(e) => onDigitChange && onDigitChange(index, e.target.value)}
                onKeyDown={(e) => onKeyDown && onKeyDown(index, e)}
              />
            </div>
          ))}
        </div>

        <div className={styles.resendPrompt}>
          <span>Didn&apos;t receive the code?</span>
          <button
            type="button"
            onClick={onResend}
            disabled={resendCooldown > 0 || loading}
          >
            {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
          </button>
        </div>

        <div className={styles.otpAction}>
          <button
            className={styles.otpSubmitButton}
            type="submit"
            disabled={isSubmitDisabled}
          >
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span className={styles.btnArrow} aria-hidden="true">←</span>
                <span>Continue</span>
                <span className={styles.btnArrow} aria-hidden="true">→</span>
              </>
            )}
          </button>

          <p className={styles.securityNote}>
            Secured with industry-standard encryption.
          </p>

          {onBack && (
            <button
              type="button"
              className={styles.backButton}
              onClick={onBack}
              disabled={loading}
            >
              ← Back to sign in
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
