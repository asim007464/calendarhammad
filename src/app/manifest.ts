import type { MetadataRoute } from "next";

export const PWA_BACKGROUND_COLOR = "#0a0c08";
export const PWA_THEME_COLOR = "#c6ff34";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QSO Dates",
    short_name: "QSO Dates",
    description:
      "Ham radio activity calendar — amateur radio contests, POTA, SOTA, DXpeditions, field days, and special event stations worldwide.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    categories: ["utilities", "productivity"],
    icons: [
      { src: "/27278978-1eed-4655-8c89-ecc9590e1f1f.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/27278978-1eed-4655-8c89-ecc9590e1f1f.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
