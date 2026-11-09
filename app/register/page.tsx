"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName,setFullName]=useState(""); const [email,setEmail]=useState(""); const [phone,setPhone]=useState("");
  const [organizationName,setOrganizationName]=useState(""); const [password,setPassword]=useState("");
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fullName,email,phone,organizationName,password})});
      const data=await response.json(); if(!response.ok) throw new Error(data.error||"Бүртгэл үүсгэх боломжгүй.");
      router.replace(data.user.role==="ADMIN"?"/admin":"/"); router.refresh();
    } catch(e) { setError(e instanceof Error?e.message:"Алдаа гарлаа."); } finally { setBusy(false); }
  }
  return <main className="account-page"><section className="account-card"><Link href="/" className="account-brand"><img src="/mass-sms-mark.svg" alt="" />MASS <b>SMS</b></Link><p className="account-eyebrow">CREATE YOUR WORKSPACE</p><h1>Бүртгэл үүсгэх</h1><p className="account-muted">Утасны дугаар болон и-мэйл хаягаа оруулна уу. Аль нэгийг нь заавал бөглөнө.</p><form onSubmit={submit}><label>Овог нэр<input autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} required minLength={2} /></label><label>И-мэйл хаяг <small>(заавал биш)</small><input autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" /></label><label>Утасны дугаар <small>(заавал биш)</small><input autoComplete="tel" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="99112233" /></label><label>Байгууллагын нэр <small>(заавал биш)</small><input autoComplete="organization" value={organizationName} onChange={e=>setOrganizationName(e.target.value)} /></label><label>Нууц үг<input autoComplete="new-password" type="password" minLength={10} value={password} onChange={e=>setPassword(e.target.value)} required /><small>Хамгийн багадаа 10 тэмдэгт.</small></label>{error&&<p className="account-error" role="alert">{error}</p>}<button disabled={busy}>{busy?"Бүртгэж байна...":"Бүртгэл үүсгэх"}</button></form><p className="account-switch">Бүртгэлтэй юу? <Link href="/login">Нэвтрэх</Link></p></section></main>;
}
