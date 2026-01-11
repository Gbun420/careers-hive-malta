import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Careers.mt",
  description: "Simple, transparent pricing for employers in Malta.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
