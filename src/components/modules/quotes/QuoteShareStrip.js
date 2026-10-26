"use client";

import styles from "./quoteShareStrip.module.scss";

function personName(person) {
  if (!person || typeof person !== "object") return "Lead Owner";
  const full = [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
  return full || person.name || person.username || person.email || "Lead Owner";
}

function statusText(status) {
  if (status === "Approved") return "By Approved";
  if (status === "Rejected") return "By Rejected";
  return "For Approval";
}

function messageDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function sharedOnLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return date.toLocaleString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function ShareNodesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M14.3751 12.5C13.9072 12.5024 13.4459 12.6097 13.0251 12.8142C12.6043 13.0186 12.2348 13.3149 11.9438 13.6813L7.37505 10.825C7.54156 10.2876 7.54156 9.71242 7.37505 9.17502L11.9438 6.31877C12.4075 6.89297 13.0595 7.28451 13.7843 7.42403C14.509 7.56354 15.2598 7.44204 15.9035 7.08104C16.5473 6.72003 17.0425 6.14283 17.3014 5.45168C17.5603 4.76052 17.5662 4.00003 17.3181 3.30492C17.0701 2.6098 16.5839 2.02493 15.9459 1.65391C15.3079 1.2829 14.5591 1.14968 13.8323 1.27786C13.1054 1.40603 12.4474 1.78734 11.9748 2.35422C11.5021 2.9211 11.2454 3.63697 11.2501 4.37502C11.253 4.65451 11.2951 4.9322 11.3751 5.20002L6.8063 8.05627C6.40296 7.54851 5.85164 7.1788 5.22877 6.99839C4.60591 6.81798 3.94234 6.83581 3.33006 7.0494C2.71778 7.263 2.18711 7.66177 1.81161 8.19046C1.43611 8.71915 1.23438 9.35155 1.23438 10C1.23437 10.6485 1.43611 11.2809 1.81161 11.8096C2.18711 12.3383 2.71778 12.737 3.33006 12.9506C3.94234 13.1642 4.60591 13.1821 5.22877 13.0016C5.85164 12.8212 6.40296 12.4515 6.8063 11.9438L11.3751 14.8C11.2951 15.0678 11.253 15.3455 11.2501 15.625C11.2501 16.2431 11.4333 16.8473 11.7767 17.3612C12.1201 17.8751 12.6081 18.2756 13.1792 18.5121C13.7502 18.7487 14.3785 18.8106 14.9847 18.69C15.5909 18.5694 16.1477 18.2718 16.5848 17.8347C17.0218 17.3977 17.3194 16.8409 17.44 16.2347C17.5606 15.6285 17.4987 15.0002 17.2622 14.4291C17.0257 13.8581 16.6251 13.3701 16.1112 13.0267C15.5973 12.6833 14.9931 12.5 14.3751 12.5Z" fill="currentColor" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.13876 17.2754C6.57769 18.2368 8.26942 18.75 10 18.75C12.3206 18.75 14.5462 17.8281 16.1872 16.1872C17.8281 14.5462 18.75 12.3206 18.75 10C18.75 8.26942 18.2368 6.57769 17.2754 5.13876C16.3139 3.69983 14.9473 2.57832 13.3485 1.91606C11.7496 1.25379 9.9903 1.08051 8.29296 1.41813C6.59563 1.75575 5.03653 2.58911 3.81282 3.81282C2.58911 5.03653 1.75575 6.59563 1.41813 8.29296C1.08051 9.9903 1.25379 11.7496 1.91606 13.3485C2.57832 14.9473 3.69983 16.3139 5.13876 17.2754ZM5.83323 3.76398C7.0666 2.93987 8.51664 2.5 10 2.5C11.9891 2.5 13.8968 3.29018 15.3033 4.6967C16.7098 6.10323 17.5 8.01088 17.5 10C17.5 11.4834 17.0601 12.9334 16.236 14.1668C15.4119 15.4001 14.2406 16.3614 12.8701 16.9291C11.4997 17.4968 9.99168 17.6453 8.53683 17.3559C7.08197 17.0665 5.7456 16.3522 4.6967 15.3033C3.64781 14.2544 2.9335 12.918 2.64411 11.4632C2.35473 10.0083 2.50325 8.50032 3.07091 7.12988C3.63856 5.75943 4.59986 4.58809 5.83323 3.76398ZM9.375 10.2563L12.8688 13.75L13.75 12.8687L10.625 9.7375V4.375H9.375V10.2563Z" fill="currentColor" />
    </svg>
  );
}

export function QuoteShareStrip({ share, onSendMessage }) {
  if (!share) return null;
  const sender = personName(share.sharedBy);
  const owner = personName(share.user);
  const dateLabel = sharedOnLabel(share.updatedAt || share.sharedAt);
  const thread = (Array.isArray(share.messages) ? share.messages : [])
    .filter((m) => m && String(m.message || "").trim() !== "")
    .map((m, idx) => ({
      key: String(m._id || idx),
      senderName: personName(m.sender),
      dateLabel: messageDate(m.createdAt),
      text: m.message,
    }));
  if (thread.length === 0 && share.notes && String(share.notes).trim() !== "") {
    thread.push({
      key: "notes",
      senderName: sender,
      dateLabel: sharedOnLabel(share.sharedAt),
      text: share.notes,
    });
  }

  return (
    <div className={styles.shareStripGroup}>
      <div className={styles.shareStrip}>
        <div className={styles.shareStripRow}>
          <ul className={styles.shareStripList}>
            <li className={styles.shareStripItem}>
              <ShareNodesIcon />
              <span className={styles.shareStripText}>
                {sender} Share to {owner}
              </span>
              <span className={styles.shareStripStatus}>{statusText(share.status)}</span>
            </li>
            {dateLabel && (
              <li className={styles.shareStripItem}>
                <ClockIcon />
                <span className={styles.shareStripText}>Shared on {dateLabel}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <details className={styles.shareConversation}>
        <summary className={styles.shareConversationSummary}>
          Conversation + ({thread.length})
        </summary>
        <div className={styles.shareConversationBody}>
          <div className={styles.shareDiscussionList}>
            {thread.length > 0 ? (
              thread.map((msg) => (
                <div key={msg.key} className={styles.shareDiscussionItem}>
                  <div className={styles.shareDiscussionMeta}>
                    <span className={styles.shareDiscussionSender}>{msg.senderName}</span>
                    <span className={styles.shareDiscussionDate}>{msg.dateLabel}</span>
                  </div>
                  <div className={styles.shareDiscussionText}>{msg.text}</div>
                </div>
              ))
            ) : (
              <div className={styles.shareConversationEmpty}>No conversation yet.</div>
            )}
          </div>
          <form
            className={styles.shareDiscussionForm}
            onSubmit={(e) => {
              e.preventDefault();
              const text = new FormData(e.currentTarget).get("message");
              if (onSendMessage && String(text || "").trim() !== "") {
                onSendMessage(String(text).trim());
                e.currentTarget.reset();
              }
            }}
          >
            <textarea name="message" rows={3} placeholder="Write a message..." aria-label="Write a message" />
            <div className={styles.shareDiscussionActions}>
              <button
                type="submit"
                className={styles.shareDiscussionSubmit}
                disabled={!onSendMessage}
                title={onSendMessage ? "Send message" : "Messaging will be enabled soon"}
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </details>
    </div>
  );
}

export default QuoteShareStrip;
