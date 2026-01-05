import "./globals.css";
import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import LocalBusinessSchema from "@/components/seo/local-business-schema";

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
    default: "Careers.mt - Malta Job Board 2026",
    template: "%s | Careers.mt",
  },
  description:
    "Malta's trusted job board. Get instant alerts for IT, marketing, finance jobs from verified Maltese employers.",
  keywords: [
    "Malta jobs",
    "careers Malta",
    "jobs in Malta",
    "Maltese employment",
  ],
  openGraph: {
    title: "Careers.mt - Malta Job Board",
    description: "Find verified jobs in Malta with instant alerts",
    url: "https://careers-hive-malta-prod.vercel.app/",
    siteName: "Careers.mt",
    images: [
      {
        url: "https://careers-hive-malta-prod.vercel.app/og-image-2026.jpg",
        width: 1200,
        height: 630,
        alt: "Careers.mt",
      },
    ],
    locale: "en_MT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers.mt - Malta Job Board",
    description: "Find verified jobs in Malta with instant alerts",
    images: ["https://careers-hive-malta-prod.vercel.app/og-image-2026.jpg"],
    creator: "@careersmt",
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
      </body>
    </html>
  );
}
