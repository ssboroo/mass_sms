"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { estimateSms } from "@/lib/sms";
import { SMS_PRICE_PER_PART_MNT } from "@/lib/pricing";
import { translate, type Locale } from "@/lib/i18n";
import {
  Activity, ArrowDownToLine, ArrowRight, Bell, BookOpen, ChartNoAxesCombined,
  Check, ChevronDown, CircleHelp, Clock3, FileText, LayoutDashboard,
  MessageSquareText, Plus, Send, Settings2, ShieldCheck, Smartphone,
  Users, Wallet, Zap
} from "lucide-react";

const navigation = [
  { key: "nav.dashboard", icon: LayoutDashboard, href: "#dashboard", active: true },
  { key: "nav.send", icon: Send, href: "#campaign" },
  { key: "nav.contacts", icon: Users, href: "#contacts", disabled: true },
  { key: "nav.campaigns", icon: MessageSquareText, href: "#campaigns", disabled: true },
  { key: "nav.reports", icon: ChartNoAxesCombined, href: "#reports", disabled: true }
];

const formatMnt = (amount: number) =>
  new Intl.NumberFormat("mn-MN", { maximumFractionDigits: 0 }).format(amount);

export default function Home() {\n  const [locale, setLocale] = useState<Locale>("mn");\n  const t = (key: string) => translate(locale, key);
  const [numbers, setNumbers] = useState("99112233\n88112233\n95112233");
  const [message, setMessage] = useState("Сайн байна уу? Манай шинэ үйлчилгээний мэдээллийг хүргэж байна.");
  const [notice, setNotice] = useState("");
  const [fileName, setFileName] = useState("");

  const estimate = useMemo(() => estimateSms(numbers, message), [numbers, message]);
  const totalParts = estimate.validNumbers.length * estimate.parts;
  const estimated = totalParts * SMS_PRICE_PER_PART_MNT;
  const canPrepare = estimate.validNumbers.length > 0 && message.trim().length > 0 &&
    estimate.invalidNumbers.length === 0 && estimate.parts <= 4;

  function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) {
      setNotice("t("validation.fileType")");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setNumbers(String(reader.result ?? ""));
      setFileName(file.name);
      setNotice("");
    };
    reader.onerror = () => setNotice("t("validation.fileRead")");
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <div className="app-shell" id="dashboard">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" aria-label="Mass SMS нүүр">
          <span className="brand-symbol">m</span>
          <span className="brand-word">mass<span>sms</span></span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-avatar">R</span>
          <span className="workspace-copy"><strong>RAINY Workspace</strong><small>{t("dashboard.defaultWorkspace")}</small></span>
          <ChevronDown size={15} />
        </div>

        <div className="nav-section">
          <span className="nav-caption">{t("nav.workspace")}</span>
          <nav className="side-nav" aria-label="Үндсэн цэс">
            {navigation.map(({ key, icon: Icon, href, active, disabled }) => (
              disabled ? (
                <span key={key} className="nav-link nav-link-disabled" aria-disabled="true" title={t("status.comingSoon")}>
                  <Icon size={17} strokeWidth={1.8} /><span>{t(key)}</span><span className="nav-coming">{t("status.comingSoon")}</span>
                </span>
              ) : (
                <a key={key} href={href} className={active ? "nav-link active" : "nav-link"}>
                  <Icon size={17} strokeWidth={1.8} /><span>{t(key)}</span>
                  {key === "nav.send" && <span className="nav-shortcut">NEW</span>}
                </a>
              )
            ))}
          </nav>
        </div>

        <div className="nav-section">
          <span className="nav-caption">{t("nav.account")}</span>
          <nav className="side-nav" aria-label="Бүртгэлийн цэс">
            <a className="nav-link" href="#balance"><Wallet size={17} strokeWidth={1.8}/><span>{t("nav.billing")}</span></a>
            <span className="nav-link nav-link-disabled" aria-disabled="true"><Settings2 size={17} strokeWidth={1.8}/><span>{t("nav.settings")}</span><span className="nav-coming">{t("status.comingSoon")}</span></span>
            <a className="nav-link" href="mailto:support@masssms.mn"><CircleHelp size={17} strokeWidth={1.8}/><span>{t("nav.help")}</span></a>
          </nav>
        </div>

        <div className="sidebar-spacer" />
        <div className="support-card" id="help">
          <span className="support-icon"><BookOpen size={17}/></span>
          <strong>{t("common.help")}</strong>
          <p>{t("common.supportText")}</p>
          <a href="mailto:support@masssms.mn">{t("common.contact")} <ArrowRight size={13}/></a>
        </div>
        <div className="sidebar-footer"><span className="online-indicator pending-indicator"/> {t("status.setup")}</div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-symbol">m</span><span className="brand-word">mass<span>sms</span></span></div>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-separator">/</span><strong>{t("dashboard.title")}</strong></div>
          <div className="topbar-actions">
            <div className="locale-switch" role="group" aria-label="Language"><button type="button" aria-pressed={locale === "mn"} onClick={() => setLocale("mn")}>MN</button><button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div><button className="icon-button" aria-label="Notifications"><Bell size={18}/><i/></button>
            <span className="topbar-divider"/>
            <button className="profile-button"><span className="profile-avatar">R</span><span className="profile-name">RAINY</span><ChevronDown size={14}/></button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot"/> {t("common.welcome")}</div>
              <h1>{t("dashboard.greeting")} 👋</h1>
              <p>{t("dashboard.subtitle")}</p>
            </div>
            <div className="date-chip"><Clock3 size={15}/> {t("dashboard.workspace")}</div>
          </section>

          <section className="metrics-grid" aria-label="Үндсэн үзүүлэлтүүд">
            <article className="metric-card metric-balance" id="balance">
              <div className="metric-heading"><span>{t("dashboard.balance")}</span><span className="metric-icon"><Wallet size={17}/></span></div>
              <div className="metric-value">₮0</div>
              <div className="metric-foot"><span className="metric-foot-icon"><Plus size={12}/></span> {t("dashboard.topUp")}</div>
            </article>
            <article className="metric-card">
              <div className="metric-heading"><span>{t("dashboard.sent")}</span><span className="metric-icon"><Send size={17}/></span></div>
              <div className="metric-value">—</div>
              <div className="metric-foot">{t("dashboard.monthlySent")}</div>
            </article>
            <article className="metric-card">
              <div className="metric-heading"><span>{t("dashboard.contacts")}</span><span className="metric-icon"><Users size={17}/></span></div>
              <div className="metric-value">—</div>
              <div className="metric-foot">{t("dashboard.consentedContacts")}</div>
            </article>
            <article className="metric-card">
              <div className="metric-heading"><span>{t("dashboard.delivery")}</span><span className="metric-icon"><Activity size={17}/></span></div>
              <div className="metric-value">—</div>
              <div className="metric-foot">{t("dashboard.afterSending")}</div>
            </article>
          </section>

          <div className="content-grid">
            <section className="panel composer-panel" id="campaign">
              <div className="panel-header">
                <div><div className="section-kicker">ШИНЭ ИЛГЭЭЛТ</div><h2>{t("campaign.title")}</h2><p>{t("campaign.subtitle")}</p></div>
                <span className="panel-header-icon"><MessageSquareText size={19}/></span>
              </div>

              <div className="form-section">
                <div className="field-heading">
                  <label htmlFor="recipients">{t("campaign.recipients")}</label>
                  <span className="field-hint">{t("campaign.recipientsHint")}</span>
                </div>
                <textarea id="recipients" className="input-area recipient-input" value={numbers} onChange={e => setNumbers(e.target.value)} placeholder="99112233&#10;88112233&#10;95112233" spellCheck={false}/>
                <div className="recipient-toolbar">
                  <div className="recipient-counts">
                    <span className="count-valid"><Check size={13}/>{estimate.validNumbers.length} {t("common.valid")}</span>
                    {estimate.invalidNumbers.length > 0 && <span className="count-invalid">{estimate.invalidNumbers.length} {t("common.invalid")}</span>}
                    {estimate.duplicateCount > 0 && <span className="count-muted">{estimate.duplicateCount} {t("common.duplicates")}</span>}
                  </div>
                  <label className="import-button"><ArrowDownToLine size={14}/><span>{t("campaign.import")}</span><input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={importFile} hidden/></label>
                </div>
                {fileName && <div className="file-chip"><FileText size={13}/>{fileName}<span>{t("common.imported")}</span></div>}
              </div>

              <div className="form-section message-section">
                <div className="field-heading"><label htmlFor="message">{t("campaign.message")}</label><span className="field-hint">{estimate.isUnicode ? "Кирилл / Unicode" : "Латин"}</span></div>
                <textarea id="message" className="input-area message-input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Илгээх мессежээ энд бичнэ үү..."/>
                <div className="message-meta"><span>{message.length} {t("common.characters")}</span><span>{estimate.parts} {t("common.parts")}</span><span>{t("common.perPart")} {estimate.charactersPerPart}</span></div>
              </div>

              <div className="compliance-note"><ShieldCheck size={17}/><p><strong>{t("campaign.compliance")}</strong><span>{t("campaign.complianceText")}</span></p></div>

              {estimate.invalidNumbers.length > 0 && <div className="validation-note" role="status">{t("validation.invalidNumbers")} ({estimate.invalidNumbers.length})</div>}
              {estimate.parts > 4 && <div className="validation-note" role="status">{t("validation.tooManyParts")}</div>}
              {notice && <div className="validation-note" role="status">{notice}</div>}

              <div className="estimate-footer">
                <div className="estimate-copy"><span>{t("campaign.estimate")}</span><strong>₮{formatMnt(estimated)}</strong><small>{estimate.validNumbers.length} дугаар × {estimate.parts} хэсэг × ₮{SMS_PRICE_PER_PART_MNT}</small></div>
                <button className="primary-button" disabled={!canPrepare} onClick={() => setNotice("t("campaign.pending")")}><Send size={15}/> {t("campaign.prepare")}</button>
              </div>
              <div className="composer-disclaimer">{t("campaign.disclaimer")}</div>
            </section>

            <aside className="right-rail">
              <section className="panel price-panel">
                <div className="rail-heading"><div><div className="section-kicker">{t("pricing.section")}</div><h2>{t("pricing.title")}</h2></div><span className="rail-icon"><Zap size={17}/></span></div>
                <div className="price-highlight"><span>{t("pricing.unit")}</span><strong>₮{formatMnt(SMS_PRICE_PER_PART_MNT)}</strong><small>{t("pricing.estimateOnly")}</small></div>
                <div className="price-breakdown"><div><span>{t("pricing.recipients")}</span><strong>{estimate.validNumbers.length}</strong></div><div><span>{t("pricing.segmentsPerRecipient")}</span><strong>{estimate.parts}</strong></div><div><span>{t("pricing.totalSegments")}</span><strong>{totalParts}</strong></div></div>
                <div className="price-total"><span>{t("pricing.total")}</span><strong>₮{formatMnt(estimated)}</strong></div>
              </section>

              <section className="panel connection-panel">
                <div className="rail-heading"><div><div className="section-kicker">{t("system.section")}</div><h2>{t("system.title")}</h2></div><span className="rail-icon"><Smartphone size={17}/></span></div>
                <div className="connection-row"><span className="connection-name"><i className="status-dot status-waiting"/>{t("system.sms")}</span><span className="status-label">{t("system.configure")}</span></div>
                <div className="connection-row"><span className="connection-name"><i className="status-dot status-waiting"/>{t("system.payments")}</span><span className="status-label">{t("system.configure")}</span></div>
                <div className="connection-row"><span className="connection-name"><i className="status-dot status-waiting"/>{t("system.database")}</span><span className="status-label">{t("system.checking")}</span></div>
              </section>

              <section className="quickstart-card">
                <div className="quickstart-icon"><Zap size={17}/></div><div><strong>{t("common.ready")}</strong><p>{t("common.quickstartText")}</p><a href="#campaign">{t("common.startCampaign")} <ArrowRight size={13}/></a></div>
              </section>
            </aside>
          </div>

          <footer className="main-footer"><span>© 2026 MASS SMS</span><span>{t("common.footer")}</span><a href="mailto:support@masssms.mn">{t("common.getHelp")}</a></footer>
        </div>
      </main>
    </div>
  );
}
