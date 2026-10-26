import Link from "next/link";
import styles from "./configForm.module.scss";

export default function RingCentralConfigView({ initialConfig }) {
  const config = initialConfig || {
    clientId: "",
    clientSecret: "",
    serverUrl: "https://platform.ringcentral.com",
    redirectUri: "",
  };

  return (
    <div className={styles.configPage}>
      <div className={styles.blockContent}>
        <div className={styles.cardHeader}>
          <h4 className={styles.title}>RingCentral Configuration</h4>
          <Link href="/payment/connection" className={styles.btnHeaderBack}>
            Back
          </Link>
        </div>
        <div className={styles.cardBody}>
          <form action="/ringcentral/save-settings" method="post">
            <div className={styles.formGrid}>
              <div className={`${styles.fieldGroup} ${styles.colHalf}`}>
                <label className={styles.label} htmlFor="ringcentral_client_id">
                  Client ID
                </label>
                <input
                  className={styles.input}
                  id="ringcentral_client_id"
                  type="text"
                  name="ringcentral_client_id"
                  placeholder="RingCentral Client ID"
                  defaultValue={config.clientId}
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.colHalf}`}>
                <label className={styles.label} htmlFor="ringcentral_client_secret">
                  Client Secret
                </label>
                <input
                  className={styles.input}
                  id="ringcentral_client_secret"
                  type="text"
                  name="ringcentral_client_secret"
                  placeholder="RingCentral Client Secret"
                  defaultValue={config.clientSecret}
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.colHalf}`}>
                <label className={styles.label} htmlFor="ringcentral_server_url">
                  Server URL
                </label>
                <input
                  className={styles.input}
                  id="ringcentral_server_url"
                  type="text"
                  name="ringcentral_server_url"
                  placeholder="https://platform.ringcentral.com"
                  defaultValue={config.serverUrl}
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.colHalf}`}>
                <label className={styles.label} htmlFor="ringcentral_redirect_uri">
                  Redirect URI
                </label>
                <input
                  className={styles.input}
                  id="ringcentral_redirect_uri"
                  type="text"
                  readOnly
                  defaultValue={config.redirectUri}
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.colFull}`}>
                <label className={styles.label}>Required App Permissions</label>
                <textarea
                  className={styles.textarea}
                  readOnly
                  defaultValue="Required RingCentral app permissions: ReadAccounts, ReadCallLog, RingOut, SMS"
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

              <Link href="/ringcentral/connect" className={styles.cmnBtnStyle}>
                Connect RingCentral
              </Link>

              <Link href="/ringcentral/call-logs" className={styles.btnOutline}>
                View Call Logs
              </Link>

              <Link href="/payment/connection" className={styles.btnOutline}>
                Back
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
