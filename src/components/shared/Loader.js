import styles from "./Loader.module.scss";

export default function Loader() {
  return (
    <div className={styles.loaderWraps}>
      <div className={styles.showbox}>
        <div className={styles.loader}>
          <svg className={styles.circular} viewBox="25 25 50 50">
            <circle
              className={styles.path}
              cx="50"
              cy="50"
              r="20"
              fill="none"
              strokeWidth="3.5"
              strokeMiterlimit="10"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
