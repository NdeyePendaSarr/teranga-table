import type { Metadata } from "next";
import localFont from "next/font/local";
import { site } from "@/content/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import "./globals.css";

// Polices hébergées dans le dépôt (app/fonts, licence SIL OFL 1.1, voir
// app/fonts/LICENCES.md) : le build ne télécharge plus rien chez Google Fonts.
// Mêmes fichiers (sous-ensemble latin, polices variables) et mêmes plages de
// graisse qu'avant. Les polices de secours ajustées sont déclarées dans
// globals.css avec les valeurs exactes qu'utilisait Google Fonts : le calcul
// automatique de next/font/local donnait un Fraunces de secours 11 % plus
// grand, donc un risque de décalage de mise en page au remplacement.
const fraunces = localFont({
  variable: "--font-fraunces",
  src: [
    { path: "./fonts/fraunces-latin.woff2", weight: "500 700", style: "normal" },
    { path: "./fonts/fraunces-italic-latin.woff2", weight: "500 700", style: "italic" },
  ],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Fraunces Fallback", "Georgia", "serif"],
});
const dmSans = localFont({
  variable: "--font-dm-sans",
  src: [{ path: "./fonts/dm-sans-latin.woff2", weight: "400 700", style: "normal" }],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["DM Sans Fallback", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nom} — Restaurant sénégalais à Mbour`,
    template: `%s — ${site.nom}`,
  },
  description: site.description,
  icons: {
    icon: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3E%3Ctext%20y='.9em'%20font-size='90'%3E🍽️%3C/text%3E%3C/svg%3E",
  },
  openGraph: {
    title: `${site.nom} — Restaurant sénégalais à Mbour`,
    description: site.description,
    type: "website",
    locale: "fr_FR",
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body>
        <a className="skip-link" href="#contenu">Aller au contenu</a>
        <Header />
        <main id="contenu">{children}</main>
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
