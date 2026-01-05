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
  title: "Malta Job Board 2026 - Fastest Job Alerts from Verified Employers | Careers Hive Malta",
  description: "Find the latest 2026 jobs in Malta with Careers Hive. Get instant job alerts for IT, marketing, finance positions from verified Maltese employers. Malta's most trusted job board.",
  keywords: ["Malta jobs", "jobs in Malta", "Malta job board", "careers Malta", "IT jobs Malta", "marketing jobs Malta"],
  openGraph: {
    title: "Malta Job Board 2026 - Careers Hive Malta",
    description: "Find verified jobs in Malta with instant alerts",
    url: "https://careers-hive-malta-prod.vercel.app/",
    siteName: "Careers Hive Malta",
    images: [
      {
        url: "https://careers-hive-malta-prod.vercel.app/og-image-2026.jpg",
        width: 1200,
        height: 630,
        alt: "Careers Hive Malta",
      },
    ],
    locale: "en_MT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Malta Job Board 2026 - Careers Hive Malta",
    description: "Find verified jobs in Malta with instant alerts",
    images: ["https://careers-hive-malta-prod.vercel.app/og-image-2026.jpg"],
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
