import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const APP_ICON_BG = "#0a0c08";
export const APP_ICON_COLOR = "#c6ff34";

let fontDataPromise: Promise<ArrayBuffer> | null = null;

async function loadOrbitronBlack(): Promise<ArrayBuffer> {
  if (!fontDataPromise) {
    const fontPath = path.join(process.cwd(), "public/fonts/orbitron-black.ttf");
    fontDataPromise = readFile(fontPath).then((buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  }
  return fontDataPromise;
}

export async function generateAppIcon(size: number) {
  const fontData = await loadOrbitronBlack();
  const pad = Math.round(size * 0.12);

  return new ImageResponse(
    (
      <div
        style={{
          background: APP_ICON_BG,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: pad,
          fontFamily: "Orbitron",
          fontWeight: 900,
          fontSize: Math.round(size * 0.24),
          letterSpacing: Math.round(size * 0.03),
          lineHeight: 1.15,
          color: APP_ICON_COLOR,
        }}
      >
        QSO
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "Orbitron", data: fontData, weight: 900, style: "normal" }],
    },
  );
}
