import styles from "@/features/auth/auth.module.scss";
import { PasswordInput } from "@/components/shared";

function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <g clipPath="url(#clip_signup)">
        <path d="M8 1C4.15 1 1 4.15 1 8C1 11.85 4.15 15 8 15C11.85 15 15 11.85 15 8C15 4.15 11.85 1 8 1ZM7.45 4H8.55V9.5H7.45V4ZM8 12.5C7.6 12.5 7.25 12.15 7.25 11.75C7.25 11.35 7.6 11 8 11C8.4 11 8.75 11.35 8.75 11.75C8.75 12.15 8.4 12.5 8 12.5Z" fill="#FB2C36" />
      </g>
      <defs>
        <clipPath id="clip_signup">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M19,13.375,14.625,9l-.884.884,2.866,2.866H4V14H16.608l-2.866,2.866.884.884Z" transform="translate(-1.5 -3.375)" fill="#fff" />
      <rect width="20" height="20" fill="none" />
    </svg>
  );
}

export default function SignupForm({ formValues, submitted, loading, validationErrors, onUpdateField, onSubmit }) {
  const err = (field) => submitted && !!validationErrors?.[field];
  const msg = (field, fallback) => (err(field) ? validationErrors[field] || fallback : "");

  return (
    <form className={styles.loginForm} onSubmit={onSubmit} noValidate>
      <div className={styles.loginFields}>
        <div className={`${styles.formFloating} ${err("companyName") ? styles.errorMsgDiv : ""}`}>
          <input
            className={`${styles.formControl} ${formValues.companyName ? styles.hasValue : ""}`}
            id="companyName"
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={formValues.companyName}
            onChange={onUpdateField("companyName")}
            disabled={loading}
          />
          <label className={styles.floatingLabel} htmlFor="companyName">
            Company Name<span className={styles.required}> *</span>
          </label>
          <div className={styles.errorMsgLine}>
            {err("companyName") ? (
              <>
                <ErrorIcon />
                <span>{msg("companyName", "Company Name is required")}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className={`${styles.formFloating} ${err("email") ? styles.errorMsgDiv : ""}`}>
          <input
            className={`${styles.formControl} ${formValues.email ? styles.hasValue : ""}`}
            id="signupEmail"
            type="email"
            name="email"
            placeholder="Work Email"
            value={formValues.email}
            onChange={onUpdateField("email")}
            autoComplete="email"
            disabled={loading}
          />
          <label className={styles.floatingLabel} htmlFor="signupEmail">
            Work Email<span className={styles.required}> *</span>
          </label>
          <div className={styles.errorMsgLine}>
            {err("email") ? (
              <>
                <ErrorIcon />
                <span>{msg("email", "Valid email is required")}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className={`${styles.formFloating} ${err("password") ? styles.errorMsgDiv : ""}`}>
          <PasswordInput
            className={`${styles.formControl} ${formValues.password ? styles.hasValue : ""} ${styles.pwControl}`}
            toggleClassName={styles.pwToggle}
            id="signupPassword"
            name="password"
            placeholder="Password"
            value={formValues.password}
            onChange={onUpdateField("password")}
            autoComplete="new-password"
            disabled={loading}
          />
          <label className={styles.floatingLabel} htmlFor="signupPassword">
            Password<span className={styles.required}> *</span>
          </label>
          <div className={styles.errorMsgLine}>
            {err("password") ? (
              <>
                <ErrorIcon />
                <span>{msg("password", "Password is required")}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className={`${styles.formFloating} ${err("phone") ? styles.errorMsgDiv : ""}`}>
          <input
            className={`${styles.formControl} ${formValues.phone ? styles.hasValue : ""}`}
            id="phone"
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formValues.phone}
            onChange={onUpdateField("phone")}
            autoComplete="tel"
            disabled={loading}
          />
          <label className={styles.floatingLabel} htmlFor="phone">
            Phone Number<span className={styles.required}> *</span>
          </label>
          <div className={styles.errorMsgLine}>
            {err("phone") ? (
              <>
                <ErrorIcon />
                <span>{msg("phone", "Phone Number is required")}</span>
              </>
            ) : null}
          </div>
        </div>

      </div>

      <div className={styles.loginAction}>
        <div className={styles.loginBtnDiv}>
          <button className={styles.loginSubmitButton} type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowIcon />
              </>
            )}
          </button>
        </div>
        <p className={styles.helperText}>Secured with industry-standard encryption.</p>
      </div>
    </form>
  );
}
