"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {formatUSPhoneNumber,sanitizeZipCode,validateLeadForm,} from "@/lib/utils/validation";
import styles from "./editQuote.module.scss";
import {navTabs,ownerAssistOptions,manufacturerOptions,leadStatusOptions,leadSourceOptions,buildingTypeOptions,formatOwner,mockQuote,} from "./editQuoteData";

function SaveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20">
      <path d="M18.819,7.306,15.694,4.181A.625.625,0,0,0,15.25,4h-10A1.25,1.25,0,0,0,4,5.25v12.5A1.25,1.25,0,0,0,5.25,19h12.5A1.25,1.25,0,0,0,19,17.75v-10A.625.625,0,0,0,18.819,7.306ZM9,5.25h5v2.5H9Zm5,12.5H9v-5h5Zm1.25,0v-5A1.25,1.25,0,0,0,14,11.5H9a1.25,1.25,0,0,0-1.25,1.25v5H5.25V5.25h2.5v2.5A1.25,1.25,0,0,0,9,9h5a1.25,1.25,0,0,0,1.25-1.25V5.506l2.5,2.5V17.75Z" transform="translate(-1.5 -1.5)" fill="currentColor" />
      <rect width="20" height="20" fill="none" />
    </svg>
  );
}

function TextField({ id, label, required, error, ...props }) {
  return (
    <div className={styles.field}>
      <input className={styles.input} id={id} placeholder={label} {...props} />
      <label className={styles.floatingLabel} htmlFor={id}>
        {label}{required && <span className={styles.required}> *</span>}
      </label>
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}

function SelectField({ id, label, required, options, error, ...props }) {
  return (
    <div className={styles.field}>
      <select className={styles.select} id={id} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <label className={styles.floatingLabel} htmlFor={id}>
        {label}{required && <span className={styles.required}> *</span>}
      </label>
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}

function MultiSelect({ id, label, required, options, values, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const search = query.trim().toLowerCase();
  const visible = search
    ? options.filter((o) => formatOwner(o).toLowerCase().includes(search))
    : options;

  function toggle(value) {
    onChange(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
    );
  }

  const display =
    values.length === 0
      ? "None"
      : values.map(formatOwner).join(", ");

  return (
    <div className={styles.field} ref={ref}>
      <button
        type="button"
        className={styles.select}
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.msDisplay}>{display}</span>
      </button>
      <label className={styles.floatingLabel} htmlFor={id}>
        {label}{required && <span className={styles.required}> *</span>}
      </label>
      {error && <span className={styles.fieldError}>{error}</span>}
      {open && (
        <div className={styles.msMenu} role="listbox" aria-label={label}>
          <input
            className={styles.msSearch}
            placeholder="Search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={`Search ${label}`}
          />
          <div className={styles.msList}>
            {visible.map((option) => (
              <label key={option} className={styles.msItem}>
                <span className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={values.includes(option)}
                    onChange={() => toggle(option)}
                    aria-label={formatOwner(option)}
                  />
                  <span className={styles.checkmark} aria-hidden="true" />
                </span>
                <span>{formatOwner(option)}</span>
              </label>
            ))}
            {visible.length === 0 && (
              <div className={styles.msEmpty}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CalcRow({ id, label, addon, onToggleAddon, value, onChange, amount, red = true }) {
  return (
    <>
      <td><label htmlFor={id}>{label}</label></td>
      <td>
        <div className={styles.calcGroup}>
          {onToggleAddon ? (
            <button type="button" className={styles.calcAddon} onClick={onToggleAddon} aria-label="Toggle amount or percent">
              {addon}
              <span className={styles.caret} aria-hidden="true" />
            </button>
          ) : (
            <span className={styles.calcAddon} aria-hidden="true">{addon}</span>
          )}
          <input
            type="number"
            className={styles.calcInput}
            id={id}
            aria-label={label}
            value={value}
            placeholder="0"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </td>
      <td className={red ? styles.redAmt : styles.whiteAmt}>${amount}</td>
    </>
  );
}

function Card({ id, title, children }) {  return (
    <section className={styles.card} id={id}>
      <div className={styles.cardHeader}>
        <h4>{title}</h4>
      </div>
      {children}
    </section>
  );
}

export default function EditQuoteView({ params }) {
  const quoteId = params?.id || mockQuote.id;
  const [form, setForm] = useState({ ...mockQuote });
  const [activeTab, setActiveTab] = useState("tab_39");
  const [flash, setFlash] = useState("");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState(mockQuote.officeNotes);
  const [primaryEmail, setPrimaryEmail] = useState("primary");
  const [errors, setErrors] = useState({});
  const [calc, setCalc] = useState({
    building: "40000",
    manuPct: "5",
    discountFlat: "",
    dealerPct: "5",
    depositVal: "20",
    depositType: "%",
    taxPct: "10",
    extraLabor: "",
    permitFees: "",
    calcsPlans: "",
    surchargePct: "",
  });

  function updateCalc(key, value) {
    setCalc((prev) => ({ ...prev, [key]: value }));
  }

  const num = (v) => parseFloat(String(v ?? "").replace(/,/g, "")) || 0;
  const fmt = (n) =>
    Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });


  const totals = useMemo(() => {
    const building = num(calc.building);
    const manuVal = (building * num(calc.manuPct)) / 100;
    const dealerVal = (building * num(calc.dealerPct)) / 100;
    const discountVal = num(calc.discountFlat);
    const base = building - manuVal - dealerVal;
    const taxVal = (base * num(calc.taxPct)) / 100;
    const depRaw = num(calc.depositVal);
    const depositAmt = calc.depositType === "%" ? (base * depRaw) / 100 : depRaw;
    const total = base + taxVal - depositAmt;
    const surchargeVal = (building * num(calc.surchargePct)) / 100;
    const balance =
      total + num(calc.extraLabor) + num(calc.permitFees) + num(calc.calcsPlans) + surchargeVal;
    return { manuVal, dealerVal, discountVal, base, taxVal, depositAmt, total, surchargeVal, balance };
  }, [calc]);

  const showExtraDiscountRows = num(calc.building) >= 20000;

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors({});
  }

  function updateMulti(key, values) {
    setForm((prev) => ({ ...prev, [key]: values }));
  }


  function handleSave(e) {
    e.preventDefault();
    const validation = validateLeadForm({
      lastName: form.lastName,
      leadOwner: form.leadOwner,
      leadOwnerAssist: form.ownerAssist,
      mobileNumber: form.mobile,
      phone: form.phone,
      zipCode: form.zipcode,
      email: form.emailPrimary,
      alternateEmail: form.emailAlternate,
      primaryEmailType: primaryEmail,
    });
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setFlash("");
      const firstKey = Object.keys(validation)[0];
      const targetId = {
        lastName: "last_name",
        leadOwner: "lead_owner",
        leadOwnerAssist: "lead_owner_assist",
        mobileNumber: "mobile_number",
        phone: "phone",
        zipCode: "zipcode",
        email: "email",
        alternateEmail: "alternate_email",
      }[firstKey];
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        if (target.focus) target.focus({ preventScroll: true });
      }
      return;
    }
    setErrors({});
    setFlash(`Quote ${quoteId} updated successfully.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNotes((prev) => [
      { text: noteText.trim(), by: "current_user", editedOn: new Date().toLocaleString() },
      ...prev,
    ]);
    setNoteText("");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.body}>
        {/* Left pills nav*/}
        <aside className={styles.sideNav} aria-label="Quote sections">
          <ul className={styles.navList}>
            {navTabs.map((tab) => (
              <li key={tab.id}>
                <a
                  href={`#${tab.id}`}
                  className={`${styles.navLink} ${activeTab === tab.id ? styles.navActive : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className={styles.main}>
          <form onSubmit={handleSave}>
            <div className={styles.titleBar}>
              <div className={styles.flashMsg} role="status">{flash}</div>
              <button type="submit" className={styles.saveBtn} title="Save">
                <SaveIcon />
                <span>Save</span>
              </button>
            </div>

            <div className={styles.contentRow}>
              <div className={styles.leftCol}>
                {/* tab_39 Add Quote */}
                <Card id="tab_39" title="Add Quote">
                  <div className={styles.grid}>
                    <TextField id="lead_owner" label="Lead Owner" required readOnly value={formatOwner(form.leadOwner)} onChange={() => {}} error={errors.leadOwner} />
                    <MultiSelect
                      id="lead_owner_assist"
                      label="Lead Owner Assist"
                      required
                      options={ownerAssistOptions}
                      values={form.ownerAssist}
                      onChange={(values) => updateMulti("ownerAssist", values.slice(-3))}
                      error={errors.leadOwnerAssist}
                    />
                    <SelectField
                      id="manufacture_id"
                      label="Manufacturer"
                      value={form.manufacturer}
                      onChange={(e) => update("manufacturer", e.target.value)}
                      options={[{ value: "", label: "None" }, ...manufacturerOptions.map((m) => ({ value: m, label: m }))]}
                    />
                    <TextField id="mobile_number" label="Mobile" required value={form.mobile} onChange={(e) => update("mobile", formatUSPhoneNumber(e.target.value))} maxLength={16} error={errors.mobileNumber} />
                    <TextField id="phone" label="Phone" value={form.phone} onChange={(e) => update("phone", formatUSPhoneNumber(e.target.value))} error={errors.phone} />
                    <TextField id="zipcode" label="Zipcode" required type="text" inputMode="numeric" value={form.zipcode} onChange={(e) => update("zipcode", sanitizeZipCode(e.target.value))} error={errors.zipCode} />
                  </div>
                </Card>

                {/* tab_32 Lead Details */}
                <Card id="tab_32" title="Lead Details">
                  <div className={styles.grid}>
                    <TextField id="first_name" label="First Name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
                    <TextField id="last_name" label="Last Name" required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} error={errors.lastName} />
                    <div>
                      <div className={styles.checkRow}>
                        <input type="radio" id="check_all_primary" name="check_all" value="1" checked={primaryEmail === "primary"} onChange={() => setPrimaryEmail("primary")} />
                        <label htmlFor="check_all_primary">Email Address</label>
                      </div>
                      <TextField id="email" label="Enter Email" type="email" value={form.emailPrimary} onChange={(e) => update("emailPrimary", e.target.value)} error={errors.email} />
                    </div>
                    <div>
                      <div className={styles.checkRow}>
                        <input type="radio" id="check_all_alternate" name="check_all" value="2" checked={primaryEmail === "alternate"} onChange={() => setPrimaryEmail("alternate")} />
                        <label htmlFor="check_all_alternate">Alternate Email</label>
                      </div>
                      <TextField id="alternate_email" label="Enter Email" type="email" value={form.emailAlternate} onChange={(e) => update("emailAlternate", e.target.value)} error={errors.alternateEmail} />
                    </div>
                    <TextField id="website_source_form" label="Web Form" value={form.webform} onChange={(e) => update("webform", e.target.value)} />
                    <SelectField
                      id="lead_status_id"
                      label="Lead Status"
                      value={form.leadStatus}
                      onChange={(e) => update("leadStatus", e.target.value)}
                      options={leadStatusOptions.map((s) => ({ value: s, label: s }))}
                    />
                    <SelectField
                      id="lead_source_id"
                      label="Lead Source"
                      value={form.leadSource}
                      onChange={() => {}}
                      disabled
                      options={leadSourceOptions.map((s) => ({ value: s, label: s }))}
                    />
                    <TextField id="contact_date" label="Contact Date" value={form.contactDate} disabled onChange={() => {}} />
                    <div className={styles.span2}>
                      <TextField id="message" label="Notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
                    </div>
                  </div>
                </Card>

                {/* Internal Notes */}
                <Card id="tab_notes" title="Internal Notes (Office use only)">
                  <div className={styles.noteSortRow}>
                    <select className={styles.noteSort} aria-label="Sort notes" defaultValue="recent_last">
                      <option value="recent_last">Recent Last</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  {notes.map((note, i) => (
                    <div className={styles.noteItem} key={i}>
                      <div className={styles.noteText}>{note.text}</div>
                      <div className={styles.noteMeta}>By {formatOwner(note.by)} · Edited on {note.editedOn}</div>
                    </div>
                  ))}
                  <form onSubmit={addNote}>
                    <div className={`${styles.field} ${styles.spacedField}`}>
                      <input
                        className={styles.input}
                        id="get_notes"
                        placeholder="Enter Message"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                      />
                      <label className={styles.floatingLabel} htmlFor="get_notes">Enter Message</label>
                    </div>
                  </form>
                </Card>

                {/* tab_40 Building Specialist Info */}
                <Card id="tab_40" title="Building Specialist Info">
                  <div className={styles.grid}>
                    <TextField id="quote_date" label="Quote Date" value={form.quoteDate} onChange={(e) => update("quoteDate", e.target.value)} />
                    <TextField id="quote_name" label="Quote Name" value={form.quoteName} onChange={(e) => update("quoteName", e.target.value)} />
                    <TextField id="direct_line" label="Direct Line" value={form.directLine} onChange={(e) => update("directLine", e.target.value)} />
                  </div>
                </Card>

                {/* tab_33 Address */}
                <Card id="tab_33" title="Address Details">
                  <div className={styles.grid}>
                    <TextField id="address_line_1" label="Address Line 1" value={form.address.line1} onChange={(e) => update("address", { ...form.address, line1: e.target.value })} />
                    <TextField id="address_line_2" label="Address Line 2" value={form.address.line2} onChange={(e) => update("address", { ...form.address, line2: e.target.value })} />
                    <TextField id="city_id" label="City" value={form.address.city} onChange={(e) => update("address", { ...form.address, city: e.target.value })} />
                    <TextField id="state_id" label="State" value={form.address.state} onChange={(e) => update("address", { ...form.address, state: e.target.value })} />
                    <TextField id="county_id" label="Country" value={form.address.country} onChange={(e) => update("address", { ...form.address, country: e.target.value })} />
                  </div>
                </Card>

                {/* tab_34 Product */}
                <Card id="tab_34" title="Product Details">
                  <div className={styles.grid}>
                    <TextField id="product_title" label="Product Title" value={form.product.title} onChange={(e) => update("product", { ...form.product, title: e.target.value })} />
                    <TextField id="product_url" label="Product URL" value={form.product.url} onChange={(e) => update("product", { ...form.product, url: e.target.value })} />
                    <div className={styles.span2}>
                      <TextField id="color_image_url" label="Color Image URL" value={form.product.colorUrl} onChange={(e) => update("product", { ...form.product, colorUrl: e.target.value })} />
                    </div>
                  </div>
                </Card>

                {/* tab_35 Building */}
                <Card id="tab_35" title="Building Specifications">
                  <div className={styles.grid}>
                    <TextField id="building_zipcode" label="Building Zipcode" type="number" value={form.building.zipcode} onChange={(e) => update("building", { ...form.building, zipcode: e.target.value })} />
                    <TextField id="installation_surface" label="Foundation Type" value={form.building.surface} onChange={(e) => update("building", { ...form.building, surface: e.target.value })} />
                    <SelectField
                      id="building_type"
                      label="Building Type"
                      value={form.building.type}
                      onChange={(e) => update("building", { ...form.building, type: e.target.value })}
                      options={buildingTypeOptions.map((b) => ({ value: b, label: b }))}
                    />
                  </div>
                  <div className={`${styles.cardHeader} ${styles.spacedHeader}`}>
                    <h4>Color Options</h4>
                  </div>
                  <div className={styles.grid}>
                    {form.colors.map((c, i) => (
                      <TextField
                        key={c.key}
                        id={c.key}
                        label={c.label}
                        value={c.value}
                        onChange={(e) => {
                          const colors = form.colors.map((item, j) => (j === i ? { ...item, value: e.target.value } : item));
                          update("colors", colors);
                        }}
                      />
                    ))}
                  </div>
                  <div className={`${styles.cardHeader} ${styles.spacedHeader}`}>
                    <h4>Other Options</h4>
                  </div>
                  <div className={styles.grid}>
                    {form.otherOptions.map((o, i) => (
                      <TextField
                        key={o.key}
                        id={o.key}
                        label={o.label}
                        value={o.value}
                        onChange={(e) => {
                          const otherOptions = form.otherOptions.map((item, j) => (j === i ? { ...item, value: e.target.value } : item));
                          update("otherOptions", otherOptions);
                        }}
                      />
                    ))}
                  </div>
                </Card>

                {/* tab_42 All Quotes */}
                <Card id="tab_42" title="All Quotes">
                  {form.quoteHistory.map((q, i) => (
                    <div className={styles.histItem} key={i}>
                      <div>
                        <Link href={`/quote/edit-quote/${quoteId}`} className={styles.histName}>{q.name}</Link>
                        <div className={styles.histDate}>{q.date}</div>
                      </div>
                      <span className={`${styles.badge} ${q.badge === "Sent" ? styles.lsSent : styles.lsOpened}`}>{q.badge}</span>
                    </div>
                  ))}
                </Card>

                {/* tab_43 All Contracts */}
                <Card id="tab_43" title="All Contracts">
                  {form.contractHistory.map((c, i) => (
                    <div className={styles.histItem} key={i}>
                      <div>
                        <span className={styles.histName}>{c.name}</span>
                        <div className={styles.histDate}>{c.date}</div>
                      </div>
                      <span className={`${styles.badge} ${styles.lsSent}`}>{c.badge}</span>
                    </div>
                  ))}
                </Card>

                {/* tab_36 Attachments */}
                <Card id="tab_36" title="Attachments">
                  {form.attachments.length === 0 && (
                    <div className={styles.emptyText}>No Attachments Yet</div>
                  )}
                  {form.attachments.map((a, i) => (
                    <div className={styles.attachRow} key={i}>
                      <span className={styles.attachName}>{a.name}</span>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => update("attachments", form.attachments.filter((_, j) => j !== i))}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </Card>
              </div>

              {/* Right rail — quote order (quote_order.php parity) */}
              <aside className={styles.rightRail} aria-label="Quote order summary">
                <div className={styles.railCard}>
                  <div className={styles.retailHead}>
                    <h3>Retail Price*</h3>
                    <input
                      id="building_price"
                      aria-label="Retail Price"
                      value={calc.building}
                      onChange={(e) => updateCalc("building", e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <table className={styles.quoteTable}>
                    <tbody>
                      <tr className={styles.secRow}>
                        <td colSpan={3}><span className={styles.secLabel}>Discounts</span></td>
                      </tr>
                      <tr>
                        <CalcRow id="manu_discount_prs" label="Manu. Discount" addon="%" value={calc.manuPct} onChange={(v) => updateCalc("manuPct", v)} amount={fmt(totals.manuVal)} />
                      </tr>
                      {showExtraDiscountRows && (
                        <tr>
                          <CalcRow id="discount_price_val" label="Discount Price" addon="$" value={calc.discountFlat} onChange={(v) => updateCalc("discountFlat", v)} amount={fmt(totals.discountVal)} />
                        </tr>
                      )}
                      {showExtraDiscountRows && (
                        <tr>
                          <CalcRow id="dealer_discount_p" label="VSS Discount" addon="%" value={calc.dealerPct} onChange={(v) => updateCalc("dealerPct", v)} amount={fmt(totals.dealerVal)} />
                        </tr>
                      )}
                      <tr className={styles.subRow}>
                        <td colSpan={2}><label>SUBTOTAL</label></td>
                        <td className={styles.bigAmt}>${fmt(num(calc.building))}</td>
                      </tr>
                      <tr className={styles.secRow}>
                        <td colSpan={3}><span className={styles.secLabel}>Payments &amp; Tax</span></td>
                      </tr>
                      <tr>
                        <CalcRow
                          id="deposit_val"
                          label="Down Payment"
                          addon={calc.depositType}
                          onToggleAddon={() => updateCalc("depositType", calc.depositType === "%" ? "$" : "%")}
                          value={calc.depositVal}
                          onChange={(v) => updateCalc("depositVal", v)}
                          amount={fmt(totals.depositAmt)}
                          red={false}
                        />
                      </tr>
                      <tr>
                        <CalcRow id="input_tax" label="Tax" addon="%" value={calc.taxPct} onChange={(v) => updateCalc("taxPct", v)} amount={fmt(totals.taxVal)} red={false} />
                      </tr>
                      <tr className={styles.subRow}>
                        <td colSpan={2}>
                          <label className={styles.totalLabel}>TOTAL<span>Before add-ons</span></label>
                        </td>
                        <td className={styles.bigAmt}>${fmt(totals.total)}</td>
                      </tr>
                      <tr className={styles.secRow}>
                        <td colSpan={3}><span className={styles.secLabel}>Additional Fees</span></td>
                      </tr>
                      <tr>
                        <CalcRow id="extra_labor" label="Extra Labor" addon="$" value={calc.extraLabor} onChange={(v) => updateCalc("extraLabor", v)} amount={fmt(num(calc.extraLabor))} red={false} />
                      </tr>
                      <tr>
                        <CalcRow id="permit_fees" label="Permit Fees" addon="$" value={calc.permitFees} onChange={(v) => updateCalc("permitFees", v)} amount={fmt(num(calc.permitFees))} red={false} />
                      </tr>
                      <tr>
                        <CalcRow id="calcs_plans" label="Calcs & Plans" addon="$" value={calc.calcsPlans} onChange={(v) => updateCalc("calcsPlans", v)} amount={fmt(num(calc.calcsPlans))} red={false} />
                      </tr>
                      <tr>
                        <CalcRow id="surcharge" label="Sur-Charge" addon="%" value={calc.surchargePct} onChange={(v) => updateCalc("surchargePct", v)} amount={fmt(totals.surchargeVal)} red={false} />
                      </tr>
                    </tbody>
                  </table>
                  <div className={styles.railFoot}>
                    <div className={`${styles.footBox} ${styles.footBalance}`}>
                      <label>Balance Due</label>
                      <div className={styles.footPrice}>${fmt(totals.balance)}</div>
                    </div>
                    <div className={styles.footBox}>
                      <label>Deposit</label>
                      <div className={styles.footPrice}>${fmt(totals.depositAmt)}</div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
