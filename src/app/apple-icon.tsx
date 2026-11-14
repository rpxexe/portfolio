import { ImageResponse } from "next/og";

// Home-screen icon (iOS): same "R" mark as app/icon.svg, rendered to PNG at build time
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0f14",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 64 64">
          <path d="M10 46 A 26 26 0 0 1 22 9" fill="none" stroke="#3ce8b2" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M23 47V17h11.5a8.5 8.5 0 0 1 0 17H23M33 34l10 13"
            fill="none"
            stroke="#3ce8b2"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="47" cy="17" r="4" fill="#5cc6e8" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
