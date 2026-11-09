import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 42, background: "linear-gradient(145deg,#27c2ff 0%,#0878f9 48%,#1538d5 100%)" }}>
      <svg width="142" height="142" viewBox="0 0 128 128">
        <path d="M35 12h42c25 0 40 14 40 35 0 15-8 26-22 31l23 38H85L66 83H49v33H12V36C12 21 21 12 35 12Zm14 27v18h27c8 0 13-3 13-9s-5-9-13-9H49Z" fill="#fff" opacity=".98"/>
        <path d="m40 68 69-29-27 63-13-22-29-12Z" fill="#0878f9"/>
        <path d="m69 80 13 22 27-63L69 80Z" fill="#b9deff"/>
        <path d="m13 77 27-10M18 91l30-12" fill="none" stroke="#c9edff" strokeWidth="5" strokeLinecap="round"/>
      </svg>
    </div>,
    { ...size }
  );
}
