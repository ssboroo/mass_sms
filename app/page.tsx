"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowUpRight, BarChart3, Bell, ChevronDown, CircleHelp, FileText, LayoutDashboard, MessageSquareText, Plus, Send, Settings, ShieldCheck, Users, Wallet, Zap } from "lucide-react";

const nav = [
  { label: "Хянах самбар", icon: LayoutDashboard, active: true },
  { label: "SMS илгээх", icon: Send },
  { label: "Харилцагчид", icon: Users },
  { label: "Кампанит ажил", icon: MessageSquareText },
  { label: "Тайлан", icon: BarChart3 }
];

function cleanPhone(value: string) {
  return value.replace(/[^0-9]/g, "").replace(/^976/, "");
}

export default function Home() {
  const [numbers, setNumbers] = useState("99112233\n88112233\n95112233");
  const [message, setMessage] = useState("Сайн байна уу? Манай шинэ үйлчилгээний мэдээллийг хүргэж байна.");
  const [notice, setNotice] = useState("");
  const recipients = useMemo(() => [...new Set(numbers.split(/[\\s,;]+/).map(cleanPhone).filter(Boolean))], [numbers]);
  const valid = recipients.filter(n => /^\\d{8}$/.test(n));
  const invalid = recipients.length - valid.length;
  const isCyrillic = /[^\\x00-\\x7F]/.test(message);
  const charsPerPart = isCyrillic ? 65 : 155;
  const parts = Math.max(1, Math.ceil(message.length / charsPerPart));
  const estimated = valid.length * parts * 80;

  function importFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNumbers(String(reader.result ?? "").replace(/[^0-9+\\n,;\\s-]/g, ""));
    reader.readAsText(file);
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">M</span> mass<span style={{color:"#246bfe"}}>sms</span></div>
      <div><div className="nav-label">WORKSPACE</div><nav className="nav">{nav.map(({label,icon:Icon,active})=><a key={label} className={active?"active":""} href="#"><Icon size={16}/>{label}</a>)}</nav></div>
      <div><div className="nav-label">ТОХИРГОО</div><nav className="nav"><a href="#"><Wallet size={16}/>Төлбөр ба багц</a><a href="#"><Settings size={16}/>Тохиргоо</a><a href="#"><CircleHelp size={16}/>Тусламж</a></nav></div>
      <div className="sidebar-bottom"><div style={{fontSize:11,fontWeight:800,marginBottom:6}}>Тусламж хэрэгтэй юу?</div><div className="helper">Манай баг танд SMS үйлчилгээг эхлүүлэхэд тусална.</div><a href="mailto:support@masssms.mn" style={{fontSize:11,color:"#246bfe",fontWeight:800,textDecoration:"none"}}>Холбоо барих →</a></div>
    </aside>
    <main className="main">
      <div className="topbar"><div className="crumb">Workspace <span style={{padding:"0 7px"}}>/</span> <b>Хянах самбар</b></div><div className="row"><Bell size={17} color="#8492a7"/><div className="user"><span className="avatar">R</span> RAINY <ChevronDown size={13}/></div></div></div>
      <header><h1 className="page-title">Өдрийн мэнд 👋</h1><p className="sub">SMS кампанит ажлаа нэг дороос удирдаарай.</p></header>
      <section className="stats">
        <div className="card balance"><div className="stat-top"><span>Боломжит үлдэгдэл</span><Wallet size={17}/></div><div className="stat-value">₮0</div><div className="stat-note">SMS илгээх кредит</div></div>
        <div className="card"><div className="stat-top"><span>Илгээсэн SMS</span><Send size={16}/></div><div className="stat-value">—</div><div className="stat-note">Энэ сарын нийт</div></div>
        <div className="card"><div className="stat-top"><span>Харилцагч</span><Users size={16}/></div><div className="stat-value">—</div><div className="stat-note">Зөвшөөрөлтэй дугаар</div></div>
        <div className="card"><div className="stat-top"><span>Хүргэлтийн хувь</span><Activity size={16}/></div><div className="stat-value">—</div><div className="stat-note">Бодит илгээлтийн дараа</div></div>
      </section>
      <div className="grid-main">
        <section className="card">
          <div className="card-head"><div><h2 className="card-title">Шинэ SMS кампанит ажил</h2><p className="helper">Олон дугаарт нэг дор мессеж илгээх</p></div><span className="pill">ШИНЭ КАМПАНИТ АЖИЛ</span></div>
          <label className="field-label">Хүлээн авагчийн дугаар</label>
          <textarea className="field" value={numbers} onChange={e=>setNumbers(e.target.value)} placeholder="99112233, 88112233..." />
          <div className="row" style={{justifyContent:"space-between",marginTop:8}}><span className="helper">{valid.length} зөв дугаар · {invalid} шалгах шаардлагатай</span><label className="secondary" style={{cursor:"pointer"}}><input type="file" accept=".csv,.txt" hidden onChange={e=>importFile(e.target.files?.[0])}/><span><FileText size={13} style={{verticalAlign:"middle",marginRight:5}}/>CSV импортлох</span></label></div>
          <label className="field-label">Мессежийн агуулга</label>
          <textarea className="field" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Илгээх мессежээ бичнэ үү..."/>
          <div className="row" style={{justifyContent:"space-between",marginTop:8}}><span className="helper">{message.length} тэмдэгт · {parts} SMS хэсэг · {isCyrillic?"Кирилл":"Латин"}</span><span className="helper">Дээд тал нь 4 хэсэг</span></div>
          <div className="notice"><ShieldCheck size={14} style={{verticalAlign:"middle",marginRight:6}}/>Зөвхөн SMS хүлээн авах зөвшөөрөл өгсөн хэрэглэгчдэд илгээнэ. Татгалзсан (STOP) дугаарууд автоматаар хасагдана. Одоогоор энэ дэлгэц урьдчилсан тооцоолол хийж байна.</div>
          <div className="row" style={{justifyContent:"space-between",marginTop:17}}><div><div style={{fontSize:10,color:"#8a98ad"}}>Урьдчилсан өртөг</div><div style={{fontSize:21,fontWeight:800}}>₮{estimated.toLocaleString("en-US")}</div></div><button className="primary" disabled={!valid.length||!message.trim()||invalid>0||parts>4} onClick={()=>setNotice("Кампанит ажил илгээх backend болон төлбөрийн баталгаажуулалт холбогдсоны дараа идэвхжинэ.")}><Send size={14} style={{verticalAlign:"middle",marginRight:7}}/>Илгээлт бэлтгэх</button></div>
          {notice&&<div className="notice" role="status">{notice}</div>}
        </section>
        <div style={{display:"grid",gap:16,alignContent:"start"}}>
          <section className="card"><div className="card-head"><h2 className="card-title">Холболтын төлөв</h2><span className="pill">INTEGRATIONS</span></div><div className="activity">
            <div className="activity-item"><span><span className="dot" style={{background:"#e8a23a"}}/>WeSend SMS API</span><b className="muted">Түлхүүр хүлээж байна</b></div>
            <div className="activity-item"><span><span className="dot" style={{background:"#e8a23a"}}/>Wire төлбөр</span><b className="muted">Түлхүүр хүлээж байна</b></div>
            <div className="activity-item"><span><span className="dot" style={{background:"#e8a23a"}}/>Өгөгдлийн сан</span><b className="muted">Тохируулах</b></div>
          </div></section>
          <section className="card"><div className="card-head"><h2 className="card-title">SMS тооцоолуур</h2><Zap size={17} color="#246bfe"/></div><div style={{fontSize:12,color:"#61718a",lineHeight:1.8}}>Кирилл, эможи агуулсан мессеж 65 тэмдэгтээр, латин мессеж 155 тэмдэгтээр хэсэгт хуваагдана.</div><div style={{display:"flex",justifyContent:"space-between",paddingTop:14,marginTop:14,borderTop:"1px solid #edf0f5",fontSize:11}}><span className="muted">Одоогийн тооцоо</span><b>{valid.length} × {parts} × ₮80</b></div></section>
          <section className="card"><div className="card-head"><h2 className="card-title">Түргэн үйлдэл</h2><Plus size={16}/></div><div className="activity"><div className="activity-item"><span>Харилцагч импортлох</span><ArrowUpRight size={14}/></div><div className="activity-item"><span>SMS багц цэнэглэх</span><ArrowUpRight size={14}/></div><div className="activity-item"><span>Илгээлтийн тайлан</span><ArrowUpRight size={14}/></div></div></section>
        </div>
      </div>
      <div className="footer">© 2026 Mass SMS · Powered by WeSend & Wire · Монголд зориулсан SMS платформ</div>
    </main>
  </div>;
}
