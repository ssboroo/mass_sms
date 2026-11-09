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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Нэвтрэх боломжгүй.");
      router.replace(data.user.role === "ADMIN" ? "/admin" : "/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-showcase">
        <Link href="/login" className="auth-brand">
          <img src="/mass-sms-mark.svg" alt="MASS SMS лого" />
          <span>MASS <b>SMS</b></span>
        </Link>
        <div className="auth-showcase-copy">
          <span className="auth-kicker">BUSINESS MESSAGING PLATFORM</span>
          <h1>Бизнесийн мессежээ<br/>нэг дороос удирд.</h1>
          <p>Харилцагч, SMS кампанит ажил, кредитийн хэрэглээгээ нэг ажлын орчинд хянаарай.</p>
          <div className="auth-points"><span>✓ Харилцагчийн сан</span><span>✓ SMS кампанит ажлын удирдлага</span><span>✓ Кредит ба хэрэглээний хяналт</span></div>
        </div>
        <small className="auth-copyright">© 2026 MASS SMS · RAINY STUDIO</small>
      </section>
      <section className="auth-panel-wrap">
        <div className="auth-panel">
          <div className="auth-mobile-brand"><img src="/mass-sms-mark.svg" alt="MASS SMS" /><b>MASS SMS</b></div>
          <span className="auth-kicker">SECURE WORKSPACE</span>
          <h2>Тавтай морил</h2>
          <p className="auth-description">Бүртгэлтэй и-мэйл эсвэл утасны дугаараараа нэвтэрнэ үү.</p>
          <form onSubmit={submit} className="auth-form">
            <label>Утасны дугаар эсвэл и-мэйл
              <input autoComplete="username" value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="99112233 / name@example.com" required />
            </label>
            <label>Нууц үг
              <input autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </label>
            {error && <p className="account-error" role="alert">{error}</p>}
            <button disabled={busy}>{busy ? "Нэвтэрч байна..." : "Нэвтрэх"}</button>
          </form>
          <div className="auth-register-cta">
            <div><strong>Анх удаа ашиглаж байна уу?</strong><span>Үнэгүй хэрэглэгчийн бүртгэл үүсгээрэй.</span></div>
            <Link href="/register">Бүртгэл үүсгэх <span aria-hidden="true">→</span></Link>
          </div>
          <p className="auth-legal">Нэвтэрснээр үйлчилгээний нөхцөл болон нууцлалын бодлогыг зөвшөөрнө.</p>
        </div>
      </section>
    </main>
  );
}
