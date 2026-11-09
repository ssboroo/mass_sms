"use client";
import { ChangeEvent, useMemo, useState } from "react";
import { estimateSms } from "@/lib/sms";
import { SMS_PACKAGES, SMS_PRICE_PER_PART_MNT, type SmsPackageId } from "@/lib/pricing";
import { translate, type Locale } from "@/lib/i18n";
import { ArrowDownToLine, Check, Send, ShieldCheck, Wallet, Zap } from "lucide-react";

const money = (n: number) => new Intl.NumberFormat("mn-MN").format(n);

export default function Home() {
  const [locale, setLocale] = useState<Locale>("mn");
  const t = (key: string) => translate(locale, key);
  const [numbers, setNumbers] = useState("99112233\n88112233\n95112233");
  const [message, setMessage] = useState("Сайн байна уу? Манай шинэ үйлчилгээний мэдээллийг хүргэж байна.");
  const [notice, setNotice] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<SmsPackageId>("standard");
  const [fileName, setFileName] = useState("");
  const estimate = useMemo(() => estimateSms(numbers, message), [numbers, message]);
  const totalParts = estimate.validNumbers.length * estimate.parts;
  const canPrepare = totalParts > 0 && message.trim().length > 0 && estimate.invalidNumbers.length === 0 && estimate.parts <= 4;

  function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) { setNotice(t("validation.fileType")); return; }
    const reader = new FileReader();
    reader.onload = () => { setNumbers(String(reader.result ?? "")); setFileName(file.name); setNotice(""); };
    reader.onerror = () => setNotice(t("validation.fileRead"));
    reader.readAsText(file);
    event.target.value = "";
  }

  return <div className="app-shell" id="dashboard">
    <aside className="sidebar">
      <a className="brand" href="#dashboard"><span className="brand-symbol">m</span><span className="brand-word">mass<span>sms</span></span></a>
      <div className="workspace-switcher"><span className="workspace-avatar">R</span><span className="workspace-copy"><strong>RAINY Workspace</strong><small>{t("dashboard.defaultWorkspace")}</small></span></div>
      <div className="nav-section"><span className="nav-caption">{t("nav.workspace")}</span><nav className="side-nav">
        <a className="nav-link active" href="#dashboard">{t("nav.dashboard")}</a><a className="nav-link" href="#campaign">{t("nav.send")}</a><a className="nav-link" href="#packages">{t("nav.billing")}</a>
      </nav></div>
      <div className="sidebar-spacer"/>
      <div className="support-card"><strong>{t("common.help")}</strong><p>{t("common.supportText")}</p><a href="mailto:support@masssms.mn">{t("common.contact")}</a></div>
      <div className="sidebar-footer">{t("status.setup")}</div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><strong>{t("dashboard.title")}</strong></div><div className="topbar-actions"><div className="locale-switch" role="group" aria-label="Language">
        <button type="button" aria-pressed={locale === "mn"} onClick={() => setLocale("mn")}>MN</button><button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
      </div><span className="profile-name">RAINY</span></div></header>
      <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow">{t("common.welcome")}</div><h1>{t("dashboard.greeting")}</h1><p>{t("dashboard.subtitle")}</p></div></section>
        <section className="metrics-grid">
          <article className="metric-card metric-balance"><div className="metric-heading">{t("dashboard.balance")} <Wallet size={17}/></div><div className="metric-value">₮0</div><div className="metric-foot">{t("dashboard.topUp")}</div></article>
          <article className="metric-card"><div className="metric-heading">{t("dashboard.sent")}</div><div className="metric-value">—</div><div className="metric-foot">{t("dashboard.monthlySent")}</div></article>
          <article className="metric-card"><div className="metric-heading">{t("dashboard.contacts")}</div><div className="metric-value">—</div><div className="metric-foot">{t("dashboard.consentedContacts")}</div></article>
          <article className="metric-card"><div className="metric-heading">{t("dashboard.delivery")}</div><div className="metric-value">—</div><div className="metric-foot">{t("dashboard.afterSending")}</div></article>
        </section>
        <div className="content-grid">
          <section className="panel composer-panel" id="campaign">
            <div className="panel-header"><div><div className="section-kicker">{t("nav.send")}</div><h2>{t("campaign.title")}</h2><p>{t("campaign.subtitle")}</p></div></div>
            <div className="form-section"><div className="field-heading"><label htmlFor="recipients">{t("campaign.recipients")}</label><span className="field-hint">{t("campaign.recipientsHint")}</span></div>
              <textarea id="recipients" className="input-area recipient-input" value={numbers} onChange={e => setNumbers(e.target.value)} spellCheck={false}/>
              <div className="recipient-toolbar"><div className="recipient-counts"><span className="count-valid"><Check size={13}/>{estimate.validNumbers.length} {t("common.valid")}</span>{estimate.invalidNumbers.length > 0 && <span className="count-invalid">{estimate.invalidNumbers.length} {t("common.invalid")}</span>}</div>
                <label className="import-button"><ArrowDownToLine size={14}/>{t("campaign.import")}<input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={importFile} hidden/></label></div>
              {fileName && <div className="file-chip">{fileName} · {t("common.imported")}</div>}
            </div>
            <div className="form-section message-section"><div className="field-heading"><label htmlFor="message">{t("campaign.message")}</label><span className="field-hint">{estimate.isUnicode ? "Unicode" : "GSM"}</span></div>
              <textarea id="message" className="input-area message-input" value={message} onChange={e => setMessage(e.target.value)}/>
              <div className="message-meta"><span>{message.length} {t("common.characters")}</span><span>{estimate.parts} {t("common.parts")}</span><span>{t("common.perPart")} {estimate.charactersPerPart}</span></div>
            </div>
            <div className="compliance-note"><ShieldCheck size={17}/><p><strong>{t("campaign.compliance")}</strong><span>{t("campaign.complianceText")}</span></p></div>
            {notice && <div className="validation-note" role="status">{notice}</div>}
            {estimate.invalidNumbers.length > 0 && <div className="validation-note">{t("validation.invalidNumbers")}</div>}
            {estimate.parts > 4 && <div className="validation-note">{t("validation.tooManyParts")}</div>}
            <div className="estimate-footer"><div className="estimate-copy"><span>{t("campaign.estimate")}</span><strong>₮{money(totalParts * SMS_PRICE_PER_PART_MNT)}</strong><small>{totalParts} × ₮{SMS_PRICE_PER_PART_MNT}</small></div><button className="primary-button" disabled={!canPrepare} onClick={() => setNotice(t("campaign.pending"))}><Send size={15}/>{t("campaign.prepare")}</button></div>
            <div className="composer-disclaimer">{t("campaign.disclaimer")}</div>
          </section>
          <aside className="right-rail">
            <section className="panel price-panel"><div className="rail-heading"><div><div className="section-kicker">{t("pricing.section")}</div><h2>{t("pricing.title")}</h2></div><Zap size={17}/></div>
              <div className="price-highlight"><span>{t("pricing.unit")}</span><strong>₮{money(SMS_PRICE_PER_PART_MNT)}</strong><small>{t("pricing.estimateOnly")}</small></div>
              <div className="price-breakdown"><div><span>{t("pricing.recipients")}</span><strong>{estimate.validNumbers.length}</strong></div><div><span>{t("pricing.totalSegments")}</span><strong>{totalParts}</strong></div></div>
              <div className="price-total"><span>{t("pricing.total")}</span><strong>₮{money(totalParts * SMS_PRICE_PER_PART_MNT)}</strong></div>
            </section>
          </aside>
        </div>
        <section className="packages-section" id="packages">
          <div className="packages-heading"><div><div className="section-kicker">{t("pricing.section")}</div><h2>{t("packages.title")}</h2><p>{t("packages.subtitle")}</p></div><span className="package-unit">{t("packages.perCredit")}: ₮160</span></div>
          <div className="packages-grid">{SMS_PACKAGES.map(item => <article key={item.id} className={`package-card ${item.featured ? "package-featured" : ""} ${selectedPackage === item.id ? "package-selected" : ""}`}>
            {item.featured && <span className="package-badge">{t("packages.popular")}</span>}
            <h3>{t(`packages.${item.id}`)}</h3><div className="package-credits">{money(item.credits)} <small>{t("packages.credits")}</small></div>
            <div className="package-price">₮{money(item.priceMnt)}</div><div className="package-rate">₮{money(item.priceMnt / item.credits)} / {t("packages.credits")}</div>
            <button type="button" className={selectedPackage === item.id ? "package-button selected" : "package-button"} onClick={() => setSelectedPackage(item.id)}>{selectedPackage === item.id ? t("packages.selected") : t("packages.buy")}</button>
          </article>)}</div>
          <p className="packages-note">{t("packages.note")} {t("packages.checkoutUnavailable")}</p>
        </section>
        <footer className="main-footer"><span>© 2026 MASS SMS</span><span>{t("common.footer")}</span><a href="mailto:support@masssms.mn">{t("common.getHelp")}</a></footer>
      </div>
    </main>
  </div>;
}
