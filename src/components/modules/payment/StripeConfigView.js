import Link from "next/link";
import styles from "./configForm.module.scss";

export default function StripeConfigView({ initialConfig }) {
  const stripeConfig = initialConfig || {
    clientId: "",
    clientSecret: "",
    redirectUri: "",
  };

  return (
    <div className={styles.configPage}>
      <div className={styles.blockContent}>
        <div className={styles.cardHeader}>
          <h4 className={styles.title}>Stripe Configuration</h4>
          <Link href="/payment/connection" className={styles.btnHeaderBack}>
            Back
          </Link>
        </div>
        <div className={styles.cardBody}>
          <form action="/payment/save-stripe-config" method="post">
            <div className={styles.formGrid}>
              <div className={`${styles.fieldGroup} ${styles.colFull}`}>
                <label className={styles.label} htmlFor="stripe_client_id">
                  Client ID
                </label>
                <input
                  className={styles.input}
                  id="stripe_client_id"
                  type="text"
                  name="stripe_client_id"
                  placeholder="Client ID"
                  defaultValue={stripeConfig.clientId}
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.colFull}`}>
                <label className={styles.label} htmlFor="stripe_client_secret">
                  Client Secret
                </label>
                <input
                  className={styles.input}
                  id="stripe_client_secret"
                  type="text"
                  name="stripe_client_secret"
                  placeholder="Client Secret"
                  defaultValue={stripeConfig.clientSecret}
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.colFull}`}>
                <label className={styles.label} htmlFor="stripe_redirect_uri">
                  Redirect URI
                </label>
                <input
                  className={styles.input}
                  id="stripe_redirect_uri"
                  type="text"
                  name="stripe_redirect_uri"
                  placeholder="Redirect URI"
                  defaultValue={stripeConfig.redirectUri}
                />
              </div>
            </div>

            <div className={styles.actionsRow}>
              <button type="submit" className={styles.cmSaveBtn} title="Save Settings">
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.819,7.306,15.694,4.181A.625.625,0,0,0,15.25,4h-10A1.25,1.25,0,0,0,4,5.25v12.5A1.25,1.25,0,0,0,5.25,19h12.5A1.25,1.25,0,0,0,19,17.75v-10A.625.625,0,0,0,18.819,7.306ZM9,5.25h5v2.5H9Zm5,12.5H9v-5h5Zm1.25,0v-5A1.25,1.25,0,0,0,14,11.5H9a1.25,1.25,0,0,0-1.25,1.25v5H5.25V5.25h2.5v2.5A1.25,1.25,0,0,0,9,9h5a1.25,1.25,0,0,0,1.25-1.25V5.506l2.5,2.5V17.75Z" transform="translate(-1.5 -1.5)" />
                </svg>
                <span>Save Settings</span>
              </button>

              <Link href="/stripeauth/login" className={styles.cmnBtnStyle}>
                Connect with Stripe
              </Link>

              <Link href="/payment/connection" className={styles.btnOutline}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
