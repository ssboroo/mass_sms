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

export default function Home() {
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
      setNotice("Зөвхөн CSV эсвэл TXT файл импортлох боломжтой.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setNumbers(String(reader.result ?? ""));
      setFileName(file.name);
      setNotice("");
    };
    reader.onerror = () => setNotice("Файлыг уншихад алдаа гарлаа. Дахин оролдоно уу.");
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
          <span className="workspace-copy"><strong>RAINY Workspace</strong><small>Үндсэн орчин</small></span>
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
          <strong>Тусламж хэрэгтэй юу?</strong>
          <p>SMS үйлчилгээгээ эхлүүлэхэд манай баг тусална.</p>
          <a href="mailto:support@masssms.mn">Бидэнтэй холбогдох <ArrowRight size={13}/></a>
        </div>
        <div className="sidebar-footer"><span className="online-indicator pending-indicator"/> Тохиргоо хийгдэж байна</div>
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
              <div className="eyebrow"><span className="eyebrow-dot"/> ТАВТАЙ МОРИЛ</div>
              <h1>{t("dashboard.greeting")} 👋</h1>
              <p>{t("dashboard.subtitle")}</p>
            </div>
            <div className="date-chip"><Clock3 size={15}/> Таны ажлын орчин</div>
          </section>

          <section className="metrics-grid" aria-label="Үндсэн үзүүлэлтүүд">
            <article className="metric-card metric-balance" id="balance">
              <div className="metric-heading"><span>{t("dashboard.balance")}</span><span className="metric-icon"><Wallet size={17}/></span></div>
              <div className="metric-value">₮0</div>
              <div className="metric-foot"><span className="metric-foot-icon"><Plus size={12}/></span> SMS кредитээ цэнэглэх</div>
            </article>
            <article className="metric-card">
              <div className="metric-heading"><span>{t("dashboard.sent")}</span><span className="metric-icon"><Send size={17}/></span></div>
              <div className="metric-value">—</div>
              <div className="metric-foot">Энэ сарын нийт илгээлт</div>
            </article>
            <article className="metric-card">
              <div className="metric-heading"><span>{t("dashboard.contacts")}</span><span className="metric-icon"><Users size={17}/></span></div>
              <div className="metric-value">—</div>
              <div className="metric-foot">Зөвшөөрөлтэй дугаар</div>
            </article>
            <article className="metric-card">
              <div className="metric-heading"><span>{t("dashboard.delivery")}</span><span className="metric-icon"><Activity size={17}/></span></div>
              <div className="metric-value">—</div>
              <div className="metric-foot">Илгээлтийн дараа тооцно</div>
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
                    <span className="count-valid"><Check size={13}/>{estimate.validNumbers.length} зөв</span>
                    {estimate.invalidNumbers.length > 0 && <span className="count-invalid">{estimate.invalidNumbers.length} буруу</span>}
                    {estimate.duplicateCount > 0 && <span className="count-muted">{estimate.duplicateCount} давхардсан</span>}
                  </div>
                  <label className="import-button"><ArrowDownToLine size={14}/><span>{t("campaign.import")}</span><input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={importFile} hidden/></label>
                </div>
                {fileName && <div className="file-chip"><FileText size={13}/>{fileName}<span>Импортолсон</span></div>}
              </div>

              <div className="form-section message-section">
                <div className="field-heading"><label htmlFor="message">{t("campaign.message")}</label><span className="field-hint">{estimate.isUnicode ? "Кирилл / Unicode" : "Латин"}</span></div>
                <textarea id="message" className="input-area message-input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Илгээх мессежээ энд бичнэ үү..."/>
                <div className="message-meta"><span>{message.length} тэмдэгт</span><span>{estimate.parts} SMS хэсэг</span><span>Хэсэг тутам {estimate.charactersPerPart} тэмдэгт</span></div>
              </div>

              <div className="compliance-note"><ShieldCheck size={17}/><p><strong>{t("campaign.compliance")}</strong><span>{t("campaign.complianceText")}</span></p></div>

              {estimate.invalidNumbers.length > 0 && <div className="validation-note" role="status">Буруу форматтай {estimate.invalidNumbers.length} дугаарыг зассаны дараа үргэлжлүүлнэ үү.</div>}
              {estimate.parts > 4 && <div className="validation-note" role="status">Нэг мессеж 4-өөс олон хэсэгтэй байна. Агуулгаа богиносгоно уу.</div>}
              {notice && <div className="validation-note" role="status">{notice}</div>}

              <div className="estimate-footer">
                <div className="estimate-copy"><span>{t("campaign.estimate")}</span><strong>₮{formatMnt(estimated)}</strong><small>{estimate.validNumbers.length} дугаар × {estimate.parts} хэсэг × ₮{SMS_PRICE_PER_PART_MNT}</small></div>
                <button className="primary-button" disabled={!canPrepare} onClick={() => setNotice("Кампанит ажил үүсгэх backend холболт бэлэн болмогц энэ үйлдэл идэвхжинэ.")}><Send size={15}/> {t("campaign.prepare")}</button>
              </div>
              <div className="composer-disclaimer">Одоогоор урьдчилсан тооцоолуур ажиллаж байна. Бодит илгээлт болон кредитийн баталгаажуулалт холбогдоогүй.</div>
            </section>

            <aside className="right-rail">
              <section className="panel price-panel">
                <div className="rail-heading"><div><div className="section-kicker">ҮНИЙН МЭДЭЭЛЭЛ</div><h2>{t("pricing.title")}</h2></div><span className="rail-icon"><Zap size={17}/></span></div>
                <div className="price-highlight"><span>{t("pricing.unit")}</span><strong>₮{formatMnt(SMS_PRICE_PER_PART_MNT)}</strong><small>{t("pricing.estimateOnly")}</small></div>
                <div className="price-breakdown"><div><span>Хүлээн авагч</span><strong>{estimate.validNumbers.length}</strong></div><div><span>Нэг дугаарт ногдох хэсэг</span><strong>{estimate.parts}</strong></div><div><span>Нийт SMS хэсэг</span><strong>{totalParts}</strong></div></div>
                <div className="price-total"><span>Урьдчилсан дүн</span><strong>₮{formatMnt(estimated)}</strong></div>
              </section>

              <section className="panel connection-panel">
                <div className="rail-heading"><div><div className="section-kicker">ҮЙЛЧИЛГЭЭНИЙ ТӨЛӨВ</div><h2>Системийн холболт</h2></div><span className="rail-icon"><Smartphone size={17}/></span></div>
                <div className="connection-row"><span className="connection-name"><i className="status-dot status-waiting"/>SMS үйлчилгээ</span><span className="status-label">Тохируулах</span></div>
                <div className="connection-row"><span className="connection-name"><i className="status-dot status-waiting"/>Төлбөрийн үйлчилгээ</span><span className="status-label">Тохируулах</span></div>
                <div className="connection-row"><span className="connection-name"><i className="status-dot status-waiting"/>Өгөгдлийн сан</span><span className="status-label">Шалгаж байна</span></div>
              </section>

              <section className="quickstart-card">
                <div className="quickstart-icon"><Zap size={17}/></div><div><strong>Эхлэхэд бэлэн үү?</strong><p>Харилцагчдаа импортлоод анхны SMS кампанит ажлаа бэлдээрэй.</p><a href="#campaign">Кампанит ажил эхлүүлэх <ArrowRight size={13}/></a></div>
              </section>
            </aside>
          </div>

          <footer className="main-footer"><span>© 2026 MASS SMS</span><span>Монголын бизнесүүдэд зориулсан мессежийн платформ</span><a href="mailto:support@masssms.mn">Тусламж авах</a></footer>
        </div>
      </main>
    </div>
  );
}
