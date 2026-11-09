import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 42, background: "linear-gradient(145deg,#22b8ff 0%,#0878f9 48%,#1239d8 100%)", position: "relative" }}>
      <svg width="142" height="142" viewBox="0 0 128 128">
        <path d="M64 9C33.1 9 9 30.8 9 58.2c0 15.2 7.5 28.3 19.7 37.1L24 116l25.2-12.8c4.8 1.3 9.7 2 14.8 2 30.9 0 55-21.8 55-49.2S94.9 9 64 9Z" fill="#fff" opacity=".18"/>
        <circle cx="43" cy="39" r="5.2" fill="#fff"/><circle cx="61" cy="39" r="5.2" fill="#fff"/><circle cx="79" cy="39" r="5.2" fill="#fff"/>
        <path d="m34 69 72-27-25.4 62-13.1-23.2L34 69Z" fill="#fff"/>
        <path d="m67.5 80.8 38.5-38.8-25.4 62-13.1-23.2Z" fill="#cce8ff"/>
        <path d="m16 77 15-6M20 89l19-8" stroke="#d9f1ff" strokeWidth="5" strokeLinecap="round"/>
      </svg>
    </div>,
    { ...size }
  );
}
