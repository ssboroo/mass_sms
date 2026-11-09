"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName,setFullName]=useState("");
  const [email,setEmail]=useState("");
  const [phone,setPhone]=useState("");
  const [organizationName,setOrganizationName]=useState("");
  const [password,setPassword]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (!email.trim() && !phone.trim()) { setError("И-мэйл эсвэл утасны дугаарын аль нэгийг оруулна уу."); return; }
    if (password !== confirmPassword) { setError("Нууц үг хоорондоо таарахгүй байна."); return; }
    setBusy(true);
    try {
      const response=await fetch("/api/auth/register",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({fullName,email,phone,organizationName,password})
      });
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Бүртгэл үүсгэх боломжгүй.");
      router.replace(data.user.role==="ADMIN"?"/admin":"/");
      router.refresh();
    } catch(e) {
      setError(e instanceof Error?e.message:"Алдаа гарлаа.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout auth-register-layout">
      <section className="auth-showcase">
        <Link href="/login" className="auth-brand"><img src="/mass-sms-mark.svg" alt="MASS SMS лого"/><span>MASS <b>SMS</b></span></Link>
        <div className="auth-showcase-copy">
          <span className="auth-kicker">START YOUR WORKSPACE</span>
          <h1>Мессежийн ажлаа<br/>өнөөдрөөс эхлүүл.</h1>
          <p>Байгууллагынхаа ажлын орчныг үүсгэж, харилцагч болон мессежийн үйл ажиллагаагаа цэгцлээрэй.</p>
          <div className="auth-points"><span>✓ Бүртгэлээ хэдхэн алхмаар үүсгэнэ</span><span>✓ Утас эсвэл и-мэйлээр нэвтэрнэ</span><span>✓ Багц, хэрэглээгээ өөрөө хянана</span></div>
        </div>
        <small className="auth-copyright">© 2026 MASS SMS · RAINY STUDIO</small>
      </section>
      <section className="auth-panel-wrap">
        <div className="auth-panel auth-panel-register">
          <div className="auth-mobile-brand"><img src="/mass-sms-mark.svg" alt="MASS SMS"/><b>MASS SMS</b></div>
          <span className="auth-kicker">CREATE YOUR WORKSPACE</span>
          <h2>Бүртгэл үүсгэх</h2>
          <p className="auth-description">Мэдээллээ оруулж шинэ ажлын орчноо нээнэ үү.</p>
          <form onSubmit={submit} className="auth-form">
            <label>Овог нэр<input autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Таны нэр" required minLength={2} maxLength={100}/></label>
            <label>И-мэйл хаяг <small>Сонголтоор</small><input autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" maxLength={254}/></label>
            <label>Утасны дугаар <small>Сонголтоор · +976</small><input autoComplete="tel" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="99112233" maxLength={32}/></label>
            <label>Байгууллагын нэр <small>Сонголтоор</small><input autoComplete="organization" value={organizationName} onChange={e=>setOrganizationName(e.target.value)} placeholder="Байгууллагын нэр" maxLength={120}/></label>
            <label>Нууц үг<input autoComplete="new-password" type="password" minLength={10} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} placeholder="10-аас дээш тэмдэгт" required/><small>Хамгийн багадаа 10 тэмдэгт.</small></label>
            <label>Нууц үг давтах<input autoComplete="new-password" type="password" minLength={10} maxLength={128} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Нууц үгээ дахин оруулна уу" required/></label>
            {error&&<p className="account-error" role="alert">{error}</p>}
            <button disabled={busy}>{busy?"Бүртгэж байна...":"Бүртгэл үүсгэх"}</button>
          </form>
          <p className="auth-existing">Бүртгэлтэй юу? <Link href="/login">Нэвтрэх</Link></p>
        </div>
      </section>
    </main>
  );
}
