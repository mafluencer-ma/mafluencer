import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0F172A",
};

export const metadata: Metadata = {
  title: {
    default: "Mafluencer — Plateforme de challenges créatifs au Maroc",
    template: "%s | Mafluencer",
  },
  description:
    "Relève des défis créatifs hebdomadaires, construis ton Mafluencer Score et connecte-toi avec les meilleures marques marocaines.",
  keywords: ["influenceur", "maroc", "creator", "challenges", "TikTok", "Instagram", "brand"],
  openGraph: {
    title: "Mafluencer",
    description: "La plateforme des créateurs de contenu au Maroc",
    url: "https://mafluencer.ma",
    siteName: "Mafluencer",
    locale: "fr_MA",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#0F172A] text-slate-200 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
