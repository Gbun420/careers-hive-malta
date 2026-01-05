import "./globals.css";
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import LocalBusinessSchema from "@/components/seo/local-business-schema";
import { siteConfig } from "@/lib/site-config";
import { Analytics } from "@vercel/analytics/next";
import SiteFooter from "@/components/nav/site-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `Careers.mt - Malta's High-Performance Job Feed`,
    template: `%s | Careers.mt`,
  },
  description: "Find verified jobs in Malta with zero-latency alerts and premium employer matching.",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: `Careers.mt - Malta Job Board`,
    description: "Find verified jobs in Malta with instant alerts",
    url: siteConfig.url,
    siteName: "Careers.mt",
    locale: "en_MT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Careers.mt - Malta Job Board`,
    description: "Find verified jobs in Malta with instant alerts",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white text-navy-950 antialiased font-sans">
        <LocalBusinessSchema />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}