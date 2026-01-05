import "./globals.css";
import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import LocalBusinessSchema from "@/components/seo/local-business-schema";
import { siteConfig } from "@/lib/site-config";
import { Analytics } from "@vercel/analytics/next";
import SiteFooter from "@/components/nav/site-footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - Malta Job Board 2026`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Malta jobs",
    "careers Malta",
    "jobs in Malta",
    "Maltese employment",
  ],
  openGraph: {
    title: `${siteConfig.name} - Malta Job Board`,
    description: "Find verified jobs in Malta with instant alerts",
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og-image-2026.jpg`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    locale: "en_MT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - Malta Job Board`,
    description: "Find verified jobs in Malta with instant alerts",
    images: [`${siteConfig.url}/og-image-2026.jpg`],
    creator: siteConfig.social.twitter,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${workSans.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <LocalBusinessSchema />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
