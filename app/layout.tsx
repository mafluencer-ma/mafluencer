import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import ThemeProvider from "@/components/theme-provider";

const inter = Inter({
  subsets:  ["latin"],
  variable: "--font-inter",
  display:  "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0F172A" },
    { media: "(prefers-color-scheme: light)", color: "#F1F5F9" },
  ],
};

export const metadata: Metadata = {
  title: {
    default:  "Mafluencer — La plateforme des créateurs au Maroc",
    template: "%s | Mafluencer",
  },
  description:
    "Relève des défis créatifs hebdomadaires, construis ton Mafluencer Score et décroche des missions payantes avec les meilleures marques marocaines.",
  keywords: ["influenceur", "maroc", "creator", "challenges", "TikTok", "Instagram", "brand"],
  icons: {
    icon:  "/fav.png",
    apple: "/fav.png",
  },
  openGraph: {
    title:       "Mafluencer",
    description: "La plateforme des créateurs de contenu au Maroc",
    url:         "https://mafluencer.ma",
    siteName:    "Mafluencer",
    locale:      "fr_MA",
    type:        "website",
  },
  robots: { index: true, follow: true },
};

/** Inline script runs synchronously before first paint — prevents flash of wrong theme */
const ANTI_FOUC = `(function(){try{var s=localStorage.getItem('mafluencer-theme');var h=new Date().getHours();var auto=(h>=20||h<7)?'dark':'light';var t=s||auto;var e=document.documentElement;e.classList.remove('dark','light');e.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased transition-colors duration-300">
        {/* Anti-FOUC: applies correct theme class before React hydration */}
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC }} />
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
