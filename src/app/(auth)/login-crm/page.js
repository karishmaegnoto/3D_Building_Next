"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AuthBrandingPanel, LoginForm, OtpVerificationForm, useLoginForm, useOtpForm } from "@/features/auth";
import { ROUTES } from "@/lib/constants";
import styles from "@/features/auth/auth.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const { error, successMessage, otpRequired, pendingEmail, isAuthenticated, clearError, resetOtpStep } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.push(ROUTES.DASHBOARD.ROOT);
  }, [isAuthenticated, router]);
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleAuthSuccess = (result) => {
    if (!result?.otpRequired) router.push(ROUTES.DASHBOARD.ROOT);
  };

  const loginFormState = useLoginForm(handleAuthSuccess);
  const otpFormState = useOtpForm(() => router.push(ROUTES.DASHBOARD.ROOT));

  const handleBackToCredentials = () => {
    resetOtpStep();
    if (otpFormState.resetDigits) otpFormState.resetDigits();
  };

  return (
    <div className={`prtm-wrapper login_main_page ${styles.page}`}>
      <AuthBrandingPanel />

      <div className="col-right-box">
        <div className="auth-wrapper d-flex no-block justify-content-center align-items-center">
          <div className="auth-box">
            <div id="loginform">
              {!otpRequired ? (
                <>
                  <div className="logo">
                    <h2>Sign in to GripCRM</h2>
                    <p>Manage your work in one place.</p>
                  </div>

                  {error && (
                    <div className={styles.alertError} role="alert">
                      <span>{error}</span>
                    </div>
                  )}
                  {successMessage && (
                    <div className={styles.alertSuccess} role="status">
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <LoginForm
                    formValues={loginFormState.formValues}
                    submitted={loginFormState.submitted}
                    loading={loginFormState.loading}
                    onUpdateField={loginFormState.updateField}
                    onSubmit={loginFormState.handleSubmit}
                  />

                  <div className={`${styles.authSwitchPrompt} ${styles.authSwitchGap}`}>
                    <span>Don&apos;t have an account?</span>
                    <Link href={ROUTES.AUTH.SIGNUP} className={styles.authSwitchLink}>
                      Sign up
                    </Link>
                  </div>
                </>
              ) : (
                <OtpVerificationForm
                  digits={otpFormState.digits}
                  otp={otpFormState.otp}
                  inputRefs={otpFormState.inputRefs}
                  loading={otpFormState.loading}
                  resendCooldown={otpFormState.resendCooldown}
                  email={pendingEmail || loginFormState.formValues.email}
                  error={error}
                  onDigitChange={otpFormState.handleDigitChange}
                  onKeyDown={otpFormState.handleKeyDown}
                  onPaste={otpFormState.handlePaste}
                  onResend={otpFormState.handleResend}
                  onBack={handleBackToCredentials}
                  onSubmit={otpFormState.handleSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
