"use client";

import styles from "./FieldError.module.scss";

export default function FieldError({ message, id }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className={styles.fieldError}>
      {message}
    </p>
  );
}
