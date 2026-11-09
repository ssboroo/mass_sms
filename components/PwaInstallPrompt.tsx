"use client";

import { useEffect, useState } from "react";
import { getInstallPlatform, type InstallPlatform } from "@/lib/pwa-install";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export default function PwaInstallPrompt() {
  const [platform, setPlatform] = useState<InstallPlatform | null>(null);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const detected = getInstallPlatform(navigator.userAgent, standalone);
    if (!detected) return;

    const dismissedUntil = Number(localStorage.getItem("mass-sms-install-dismissed-until") || 0);
    if (dismissedUntil > Date.now()) return;

    setPlatform(detected);
    setShow(true);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = () => {
    localStorage.setItem("mass-sms-install-dismissed-until", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setShow(false);
  };

  const install = async () => {
    if (!installEvent) return;
    setBusy(true);
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
      setShow(false);
    } finally {
      setBusy(false);
    }
  };

  if (!show || !platform) return null;

  return (
    <div className="pwa-backdrop" role="presentation">
      <section className="pwa-dialog" role="dialog" aria-modal="true" aria-labelledby="pwa-title">
        <button className="pwa-close" type="button" onClick={dismiss} aria-label="Хаах">×</button>
        <div className="pwa-app-icon"><img src="/mass-sms-mark.svg" alt="" /></div>
        <span className="pwa-eyebrow">MASS SMS MOBILE</span>
        <h2 id="pwa-title">MASS SMS-ийг утсандаа суулгаарай</h2>
        <p className="pwa-description">Нүүр дэлгэцээсээ нэг товшилтоор нээж, апп шиг бүтэн дэлгэцээр ашиглаарай. Тусдаа апп татах шаардлагагүй.</p>

        {platform === "ios" ? (
          <ol className="pwa-steps">
            <li><span>1</span><div><b>Safari дээр нээнэ</b><small>Хэрэв өөр browser ашиглаж байвал Safari-аар энэ сайтыг нээнэ үү.</small></div></li>
            <li><span>2</span><div><b>Share товчийг дарна</b><small>Дэлгэцийн доод хэсгийн дээш сумтай Share дүрс.</small></div></li>
            <li><span>3</span><div><b>Add to Home Screen сонгоно</b><small>Нэмэх товчийг дарснаар MASS SMS нүүр дэлгэцэд байрлана.</small></div></li>
          </ol>
        ) : (
          <ol className="pwa-steps">
            <li><span>1</span><div><b>Browser-ийн цэсийг нээнэ</b><small>Chrome-ийн баруун дээд талын ⋮ товч.</small></div></li>
            <li><span>2</span><div><b>Install app эсвэл Add to Home screen</b><small>Гарч ирсэн сонголтыг дарна.</small></div></li>
            <li><span>3</span><div><b>Install / Add-ийг баталгаажуулна</b><small>Аппын дүрс нүүр дэлгэцэд нэмэгдэнэ.</small></div></li>
          </ol>
        )}
        {platform === "android" && installEvent && (
          <button className="pwa-install-button" type="button" onClick={install} disabled={busy}>
            {busy ? "Суулгаж байна…" : "Шууд суулгах"}
          </button>
        )}
        <button className="pwa-later" type="button" onClick={dismiss}>Дараа сануулах</button>
        <small className="pwa-footnote">Үнэгүй · Browser-оос шууд · Шинэчлэлт автоматаар</small>
      </section>
    </div>
  );
}
