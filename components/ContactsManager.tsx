"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Download, Plus, RefreshCw, Search, Upload, Users } from "lucide-react";

type Contact = {
  id: string; phone: string; name: string | null; tags: string[];
  createdAt: string; consent: { granted: boolean; source: string; capturedAt: string; revokedAt: string | null } | null;
};

export default function ContactsManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [bulk, setBulk] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [consent, setConsent] = useState(false);
  const [evidence, setEvidence] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [total, setTotal] = useState(0);

  const load = useCallback(async (q = query) => {
    const response = await fetch("/api/contacts?q=" + encodeURIComponent(q), { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Харилцагч ачаалж чадсангүй.");
    setContacts(data.contacts);
    setTotal(data.total);
  }, [query]);

  useEffect(() => { load().catch(e => setNotice(e instanceof Error ? e.message : "Алдаа гарлаа.")); }, [load]);

  async function save(items: { phone: string; name?: string; tags?: string[] }[], source: "WEB_FORM" | "IMPORT") {
    if (!consent) { setNotice("Эдгээр дугаарын эзэмшигчид SMS хүлээн авах зөвшөөрөл өгсөн гэдгийг баталгаажуулна уу."); return; }
    if (!items.length) { setNotice("Хадгалах утасны дугаар оруулна уу."); return; }
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/contacts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: items, consentGranted: true, consentSource: source, evidence: evidence || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Харилцагч хадгалж чадсангүй.");
      setNotice(`Амжилттай: ${data.created} шинэ, ${data.updated} шинэчилсэн харилцагч.`);
      setPhone(""); setName(""); setBulk(""); setConsent(false); setEvidence("");
      await load();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Алдаа гарлаа.");
    } finally {
      setBusy(false);
    }
  }

  function addOne(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save([{ phone, name, tags: tags.split(",").map(v => v.trim()).filter(Boolean) }], "WEB_FORM");
  }

  function importBulk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rows = bulk.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
    const items = rows.map(row => {
      const [phone, name = ""] = row.split(/[;,\t]/).map(v => v.trim());
      return { phone, name, tags: tags.split(",").map(v => v.trim()).filter(Boolean) };
    });
    void save(items, "IMPORT");
  }

  function exportCsv() {
    const rows = [["Нэр", "Утас", "Шошго", "Зөвшөөрөл"], ...contacts.map(c => [c.name || "", c.phone, c.tags.join("|"), c.consent?.granted && !c.consent.revokedAt ? "Тийм" : "Үгүй"])];
    const csv = rows.map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "mass-sms-contacts.csv"; a.click(); URL.revokeObjectURL(url);
  }

  async function searchContacts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setQuery(search);
    try { await load(search); } catch (e) { setNotice(e instanceof Error ? e.message : "Хайлт амжилтгүй."); }
  }

  return <section className="contacts-manager">
    <div className="contacts-toolbar">
      <div><span className="contacts-count"><Users size={15}/>{total.toLocaleString("mn-MN")} харилцагч</span><p>Таны байгууллагын харилцагчийн сан · зөвшөөрлийн бүртгэлтэй</p></div>
      <div className="contacts-toolbar-actions"><button type="button" onClick={() => load().catch(e => setNotice(e.message))}><RefreshCw size={14}/> Шинэчлэх</button><button type="button" onClick={exportCsv} disabled={!contacts.length}><Download size={14}/> CSV татах</button></div>
    </div>
    {notice && <p className="contacts-notice" role="status">{notice}</p>}
    <div className="contacts-entry-grid">
      <form className="contacts-entry-card" onSubmit={addOne}>
        <h3><Plus size={16}/> Нэг харилцагч нэмэх</h3>
        <label>Утасны дугаар<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="99112233" required/></label>
        <label>Нэр (сонголтоор)<input value={name} onChange={e=>setName(e.target.value)} placeholder="Бат"/></label>
        <label>Шошго (таслалаар тусгаарлана)<input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Үйлчлүүлэгч, VIP"/></label>
        <label>Зөвшөөрлийн нотолгоо (сонголтоор)<input value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Гэрээ / маягтын дугаар"/></label>
        <button className="pro-btn primary" disabled={busy}><Plus size={14}/> Хадгалах</button>
      </form>
      <form className="contacts-entry-card" onSubmit={importBulk}>
        <h3><Upload size={16}/> Олон дугаар импортлох</h3>
        <p>Мөр бүрт нэг дугаар оруулна. Нэр нэмэх бол <code>99112233, Бат</code> хэлбэрээр бичнэ.</p>
        <textarea value={bulk} onChange={e=>setBulk(e.target.value)} rows={7} placeholder={"99112233, Бат\n88112233, Болд\n95112233"} />
        <button className="pro-btn secondary" disabled={busy}><Upload size={14}/> Жагсаалт импортлох</button>
      </form>
    </div>
    <label className="contacts-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Би эдгээр дугаарын эзэмшигчдээс SMS хүлээн авах урьдчилсан зөвшөөрөл авсан бөгөөд шаардлагатай нотолгоог хадгална.</label>
    <div className="contacts-list-head"><h3>Харилцагчид</h3><form onSubmit={searchContacts}><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Нэр, дугаар, шошго хайх"/><button>Хайх</button></form></div>
    <div className="contacts-table-wrap"><table className="contacts-table"><thead><tr><th>НЭР</th><th>УТАС</th><th>ШОШГО</th><th>ЗӨВШӨӨРӨЛ</th><th>НЭМЭГДСЭН</th></tr></thead><tbody>
      {contacts.map(c=><tr key={c.id}><td>{c.name || "—"}</td><td><strong>{c.phone}</strong></td><td>{c.tags.length ? c.tags.join(", ") : "—"}</td><td><span className={c.consent?.granted && !c.consent.revokedAt ? "contacts-consent-ok" : "contacts-consent-missing"}>{c.consent?.granted && !c.consent.revokedAt ? "Зөвшөөрөлтэй" : "Шалга шаардлагатай"}</span></td><td>{new Date(c.createdAt).toLocaleDateString("mn-MN")}</td></tr>)}
    </tbody></table>{!contacts.length && <div className="contacts-empty">Одоогоор харилцагч алга. Дээрээс нэгээр нэмэх эсвэл жагсаалт импортлоорой.</div>}</div>
    <p className="contacts-footnote">Анхааруулга: зөвшөөрөлгүй дугаар руу маркетингийн SMS илгээж болохгүй. STOP хүсэлтийг тусад нь бүртгэж, цаашдын илгээлтээс хасах шаардлагатай.</p>
  </section>;
}
