import type { Metadata } from "next";
import { Inter, Cal_Sans } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Cal Sans n'existe qu'en une seule graisse — c'est normal. */
const calSans = Cal_Sans({
  variable: "--font-cal",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: site.brand.metaTitle,
    template: `%s — ${site.brand.name}`,
  },
  description: site.brand.metaDescription,
  openGraph: {
    title: site.brand.metaTitle,
    description: site.brand.metaDescription,
    siteName: site.brand.name,
    locale: "fr_FR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* Les variables de police doivent être posées sur <html> : les tokens
       --font-sans / --font-display sont définis sur :root et les référencent,
       or une custom property se résout sur l'élément qui la déclare. */
    <html lang="fr" className={`${inter.variable} ${calSans.variable}`}>
      <body className="antialiased">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-white"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
