"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Нэвтрэх боломжгүй.");
      router.replace(data.user.role === "ADMIN" ? "/admin" : "/"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Алдаа гарлаа."); }
    finally { setBusy(false); }
  }
  return <main className="account-page"><section className="account-card"><Link href="/" className="account-brand"><img src="/mass-sms-mark.svg" alt="" />MASS <b>SMS</b></Link><p className="account-eyebrow">SECURE WORKSPACE</p><h1>Тавтай морил</h1><p className="account-muted">Утасны дугаар эсвэл и-мэйлээрээ нэвтэрнэ үү.</p><form onSubmit={submit}><label>Утасны дугаар эсвэл и-мэйл<input autoComplete="username" value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="99112233 / name@example.com" required /></label><label>Нууц үг<input autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>{error&&<p className="account-error" role="alert">{error}</p>}<button disabled={busy}>{busy?"Нэвтэрч байна...":"Нэвтрэх"}</button></form><p className="account-switch">Шинэ хэрэглэгч үү? <Link href="/register">Бүртгэл үүсгэх</Link></p></section></main>;
}
