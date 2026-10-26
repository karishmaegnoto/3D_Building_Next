import Link from "next/link";
import styles from "./configForm.module.scss";

export default function GoogleConfigView() {
  return (
    <div className={styles.configPage}>
      <div className={styles.blockContent}>
        <div className={styles.cardHeader}>
          <h4 className={styles.title}>Gmail Configuration</h4>
          <Link href="/payment/connection" className={styles.btnHeaderBack}>
            Back
          </Link>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.actionsRow}>
            <Link href="/google/gmail_login" className={styles.cmnBtnStyle}>
              Login With Gmail
            </Link>

            <Link href="/payment/connection" className={styles.btnOutline}>
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
