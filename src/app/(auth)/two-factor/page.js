"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {AuthBrandingPanel,OtpVerificationForm,useOtpForm,} from "@/features/auth";
import { ROUTES } from "@/lib/constants";
import styles from "@/features/auth/auth.module.scss";

function TwoFactorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {error,successMessage,pendingEmail,isAuthenticated,clearError,setPendingEmail,} = useAuthStore();

  const emailParam = searchParams.get("email");
  const email = pendingEmail || emailParam || "";

  useEffect(() => {
    if (emailParam && !pendingEmail) {
      setPendingEmail(emailParam);
    }
  }, [emailParam, pendingEmail, setPendingEmail]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(ROUTES.DASHBOARD.ROOT);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const otpFormState = useOtpForm(() => router.push(ROUTES.DASHBOARD.ROOT));

  return (
    <div className={styles.authBox}>
      {successMessage && (
        <div className={styles.alertSuccess} role="status">
          <span aria-hidden="true">✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      <OtpVerificationForm
        digits={otpFormState.digits}
        otp={otpFormState.otp}
        inputRefs={otpFormState.inputRefs}
        loading={otpFormState.loading}
        resendCooldown={otpFormState.resendCooldown}
        email={email}
        error={error}
        onDigitChange={otpFormState.handleDigitChange}
        onKeyDown={otpFormState.handleKeyDown}
        onPaste={otpFormState.handlePaste}
        onResend={otpFormState.handleResend}
        onBack={() => router.push(ROUTES.AUTH.LOGIN)}
        onSubmit={otpFormState.handleSubmit}
      />
    </div>
  );
}


export default function TwoFactorPage() {
  return (
    <main className={styles.page}>
      <div className="row g-0">
        <AuthBrandingPanel />

        <section className={`${styles.colRightBox} ${styles.otpTheme} col-12 col-md-7`}>
          <div className={styles.authWrapper}>
            <Suspense fallback={<div className={styles.spinner} />}>
              <TwoFactorContent />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
