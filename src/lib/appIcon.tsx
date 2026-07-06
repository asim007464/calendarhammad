import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const APP_ICON_BG = "#0a0c08";
export const APP_ICON_COLOR = "#c6ff34";

let fontDataPromise: Promise<ArrayBuffer> | null = null;

async function loadOrbitronBlack(): Promise<ArrayBuffer> {
  if (!fontDataPromise) {
    const fontPath = path.join(process.cwd(), "public/fonts/orbitron-black.ttf");
    fontDataPromise = readFile(fontPath).then((buf) =>
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    );
  }
  return fontDataPromise;
}

// PWA icons need text in the center safe zone.
export async function generateAppIcon(size: number) {
  return renderAppIcon(size, { insetRatio: 0.2, fontRatio: 0.17 });
}

/** Android maskable icons crop ~20% from edges; use a smaller label in the center. */
export async function generateMaskableAppIcon(size: number) {
  return renderAppIcon(size, { insetRatio: 0.28, fontRatio: 0.14 });
}

async function renderAppIcon(
  size: number,
  { insetRatio, fontRatio }: { insetRatio: number; fontRatio: number },
) {
  const fontData = await loadOrbitronBlack();
  const inset = Math.round(size * insetRatio);
  const fontSize = Math.round(size * fontRatio);

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
          paddingTop: inset,
          paddingBottom: inset,
          paddingLeft: Math.round(inset * 1.15),
          paddingRight: Math.round(inset * 0.95),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Orbitron",
            fontWeight: 900,
            fontSize,
            letterSpacing: 0,
            lineHeight: 1,
            color: APP_ICON_COLOR,
            whiteSpace: "nowrap",
          }}
        >
          QSO
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "Orbitron", data: fontData, weight: 900, style: "normal" }],
    },
  );
}
