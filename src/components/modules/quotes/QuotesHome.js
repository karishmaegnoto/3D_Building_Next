"use client";

import { useState, useRef, useEffect } from "react";
import { SelectQuoteTypeModal } from "@/components/modules/quotes";
import styles from "@/components/modules/leads/addLead.module.scss";
import homeStyles from "./quotesHome.module.scss";

function QuickQuoteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </svg>
  );
}

function QuoteWithLeadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

function EmptyQuoteDocIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="12" x2="13" y2="12" />
      <line x1="8" y1="16" x2="11" y2="16" />
      <path d="M18.5 12.5a2.121 2.121 0 0 1 3 3L16 21l-3 1 1-3 5.5-6.5z" />
    </svg>
  );
}

export default function QuotesHome() {
  const [showQuoteMenu, setShowQuoteMenu] = useState(false);
  const [showQuickQuoteModal, setShowQuickQuoteModal] = useState(false);
  const quoteMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (quoteMenuRef.current && !quoteMenuRef.current.contains(e.target)) {
        setShowQuoteMenu(false);
      }
    }
    if (showQuoteMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showQuoteMenu]);

  return (
    <div className={homeStyles.quotesHomeShell}>
      <section className={styles.quotesSectionWrap}>
        <div className={styles.quotesHeaderRow}>
          <div className={styles.quotesTitleGroup}>
            <div className={styles.quotesAccentBar} />
            <h3 className={styles.quotesTitle}>All Quotes</h3>
          </div>

          <div className={styles.createQuoteDropdownWrap} ref={quoteMenuRef}>
            <button
              type="button"
              className={styles.createQuoteBtn}
              onClick={() => setShowQuoteMenu((prev) => !prev)}
            >
              <span className={styles.plusSign}>+</span>
              <span>Create Quote</span>
            </button>

            {showQuoteMenu && (
              <div className={styles.quoteDropdownMenu}>
                <button
                  type="button"
                  className={styles.quoteDropdownItem}
                  onClick={() => {
                    setShowQuoteMenu(false);
                    setShowQuickQuoteModal(true);
                  }}
                >
                  <QuickQuoteIcon />
                  <span>Quick Quote</span>
                </button>
                <button
                  type="button"
                  className={styles.quoteDropdownItem}
                  onClick={() => {
                    setShowQuoteMenu(false);
                  }}
                >
                  <QuoteWithLeadIcon />
                  <span>Quote With Lead</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.emptyQuoteCardBox}>
          <div className={styles.emptyQuoteCircleIcon}>
            <EmptyQuoteDocIcon />
          </div>
          <h4 className={styles.emptyQuoteTitle}>No Quote Created Yet</h4>
          <p className={styles.emptyQuoteSubtitle}>
            Create your first contract to formalize agreements and track deal progress.
          </p>
        </div>

        <SelectQuoteTypeModal
          isOpen={showQuickQuoteModal}
          onClose={() => setShowQuickQuoteModal(false)}
          onContinue={() => {
            setShowQuickQuoteModal(false);
          }}
        />
      </section>
    </div>
  );
}
