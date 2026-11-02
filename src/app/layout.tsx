import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./club.css";
import { THEME_COLOR, THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Kawaii Club",
  description: "Anime ijodkorlari klublari: obunalar, yopiq kontent va jonli efirlar.",
  applicationName: "Kawaii Club",
  appleWebApp: { capable: true, title: "Kawaii Club", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* theme-color skriptdan oldin turishi kerak — skript uni darhol mavzuga moslaydi */}
        <meta name="theme-color" content={THEME_COLOR.dark} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex flex-col min-h-screen antialiased bg-page-bg text-text-main theme-transition relative">
        {children}
      </body>
    </html>
  );
}
