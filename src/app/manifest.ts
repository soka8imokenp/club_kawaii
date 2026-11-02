import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Kawaii Club",
    short_name: "Kawaii Club",
    description: "Anime ijodkorlari klublari: obunalar, yopiq kontent va jonli efirlar.",
    lang: "uz",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // Ishga tushish ekrani (Android) — qora fon ustida binafsha quyon
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["entertainment", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
