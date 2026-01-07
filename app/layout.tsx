import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import LocalBusinessSchema from "@/components/seo/local-business-schema";
import { siteConfig } from "@/lib/site-config";
import { Analytics } from "@vercel/analytics/next";
import SiteFooter from "@/components/nav/site-footer";
import SiteHeader from "@/components/nav/site-header";
import PerformanceAnimator from "@/components/ui/performance-animator";

import { BRAND_NAME } from "@/lib/brand";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} - Malta's Premier Career Connection Platform`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: `${BRAND_NAME} - Malta's Premier Career Connection Platform. Get real-time job alerts from verified Maltese employers and apply before the competition.`,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: `${BRAND_NAME} - Malta Job Board`,
    description: "Find verified jobs in Malta with instant alerts",
    url: siteConfig.url,
    siteName: BRAND_NAME,
    locale: "en_MT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} - Malta Job Board`,
    description: "Find verified jobs in Malta with instant alerts",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <PerformanceAnimator />
        <LocalBusinessSchema />
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
