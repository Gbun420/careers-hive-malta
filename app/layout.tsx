import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import LocalBusinessSchema from "@/components/seo/local-business-schema";
import { siteConfig } from "@/lib/site-config";
import { Analytics } from "@vercel/analytics/next";
import SiteFooter from "@/components/nav/site-footer";
import SiteHeader from "@/components/nav/site-header";
import PerformanceAnimator from "@/components/ui/performance-animator";

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
    default: `Careers.mt - Malta's Premier Career Connection Platform`,
    template: `%s | Careers.mt`,
  },
  description: "98% Verified Postings. Malta's fastest job alerts. Apply before the competition.",
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-slate-50 text-charcoal antialiased font-sans">
        <PerformanceAnimator />
        <LocalBusinessSchema />
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">
            {children}
          </div>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
