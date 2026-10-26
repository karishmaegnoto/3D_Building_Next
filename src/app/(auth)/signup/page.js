"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AuthBrandingPanel, SignupForm, OtpVerificationForm, useSignupForm, useOtpForm } from "@/features/auth";
import { ROUTES } from "@/lib/constants";
import styles from "@/features/auth/auth.module.scss";

export default function SignupPage() {
  const router = useRouter();
  const { error, successMessage, otpRequired, pendingEmail, isAuthenticated, clearError, resetOtpStep } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.push(ROUTES.DASHBOARD.ROOT);
  }, [isAuthenticated, router]);
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSignupSuccess = (result) => {
    if (!result?.otpRequired) router.push(ROUTES.DASHBOARD.ROOT);
  };

  const signupFormState = useSignupForm(handleSignupSuccess);
  const otpFormState = useOtpForm(() => router.push(ROUTES.DASHBOARD.ROOT));

  const handleBackToDetails = () => {
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
                    <h2>Create your GripCRM account</h2>
                    <p>Get started with modern customer management.</p>
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

                  <SignupForm
                    formValues={signupFormState.formValues}
                    submitted={signupFormState.submitted}
                    loading={signupFormState.loading}
                    validationErrors={signupFormState.validationErrors}
                    onUpdateField={signupFormState.updateField}
                    onSubmit={signupFormState.handleSubmit}
                  />

                  <div className={`${styles.authSwitchPrompt} ${styles.authSwitchGap}`}>
                    <span>Already have an account?</span>
                    <Link href={ROUTES.AUTH.LOGIN} className={styles.authSwitchLink}>
                      Sign in
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
                  email={pendingEmail || signupFormState.formValues.email}
                  error={error}
                  onDigitChange={otpFormState.handleDigitChange}
                  onKeyDown={otpFormState.handleKeyDown}
                  onPaste={otpFormState.handlePaste}
                  onResend={otpFormState.handleResend}
                  onBack={handleBackToDetails}
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
