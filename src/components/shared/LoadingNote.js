"use client";

import styles from "./LoadingNote.module.scss";

export default function LoadingNote({ children }) {
  return <div className={styles.loadingNote}>{children}</div>;
}
