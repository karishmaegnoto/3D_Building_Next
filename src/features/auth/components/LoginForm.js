import styles from "@/features/auth/auth.module.scss";
import { PasswordInput } from "@/components/shared";

function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <g clipPath="url(#clip0_6215_520_login)">
        <path d="M8 1C4.15 1 1 4.15 1 8C1 11.85 4.15 15 8 15C11.85 15 15 11.85 15 8C15 4.15 11.85 1 8 1ZM7.45 4H8.55V9.5H7.45V4ZM8 12.5C7.6 12.5 7.25 12.15 7.25 11.75C7.25 11.35 7.6 11 8 11C8.4 11 8.75 11.35 8.75 11.75C8.75 12.15 8.4 12.5 8 12.5Z" fill="#FB2C36" />
      </g>
      <defs>
        <clipPath id="clip0_6215_520_login">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg id="direction--straight--right" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path id="Path_37886" data-name="Path 37886" d="M19,13.375,14.625,9l-.884.884,2.866,2.866H4V14H16.608l-2.866,2.866.884.884Z" transform="translate(-1.5 -3.375)" fill="#fff" />
      <rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" width="20" height="20" fill="none" />
    </svg>
  );
}

export default function LoginForm({ formValues, submitted, loading, onUpdateField, onSubmit }) {
  const showEmailError = submitted && !formValues.email?.trim();
  const showPasswordError = submitted && !formValues.password;
  const emailErrorText = showEmailError ? "Email field is required" : "";
  const passwordErrorText = showPasswordError ? "Password field is required" : "";

  return (
    <form className={styles.loginForm} onSubmit={onSubmit} noValidate data-toggle="validator" id="loginformss">
      <div className={styles.loginFields}>
        <div className={`${styles.formFloating} ${showEmailError ? styles.errorMsgDiv : ""}`}>
          <input
            className={`${styles.formControl} ${formValues.email ? styles.hasValue : ""}`}
            id="Email"
            type="email"
            name="email"
            placeholder="Email"
            value={formValues.email}
            onChange={onUpdateField("email")}
            autoComplete="email"
            disabled={loading}
          />
          <label className={styles.floatingLabel} htmlFor="Email">
            Email<span className={styles.required}> *</span>
          </label>
          <div className={styles.errorMsgLine}>{emailErrorText}</div>
        </div>

        <div className={`${styles.formFloating} ${showPasswordError ? styles.errorMsgDiv : ""}`}>
          <PasswordInput
            className={`${styles.formControl} ${formValues.password ? styles.hasValue : ""} ${styles.pwControl}`}
            toggleClassName={styles.pwToggle}
            id="password"
            name="password"
            placeholder="Password"
            value={formValues.password}
            onChange={onUpdateField("password")}
            autoComplete="current-password"
            disabled={loading}
          />
          <label className={styles.floatingLabel} htmlFor="password">
            Password<span className={styles.required}> *</span>
          </label>
          <div className={styles.errorMsgLine} aria-live="polite">
            {showPasswordError ? (
              <>
                <ErrorIcon />
                <span>{passwordErrorText}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className={styles.rememberRow}>
          <input
            type="checkbox"
            className={styles.rememberCheckbox}
            name="checkall"
            id="checkall"
            checked={!!formValues.remember}
            onChange={onUpdateField("remember")}
            disabled={loading}
          />
          <label className={styles.rememberLabel} htmlFor="checkall">
            Remember Me
          </label>
        </div>
      </div>

      <div className={styles.loginAction}>
        <div className={styles.loginBtnDiv}>
          <button className={styles.loginSubmitButton} type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowIcon />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
