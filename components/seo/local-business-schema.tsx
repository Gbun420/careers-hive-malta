import { siteConfig } from "@/lib/site-config";
import { BRAND_NAME } from "@/lib/brand";

export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    "name": BRAND_NAME,
    "description": `${BRAND_NAME} - Malta's Premier Career Connection Platform. Get real-time job alerts from verified Maltese employers.`,
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/logo-careers-mt.svg`,
    "telephone": "+356-2700-0000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Digital Hub",
      "addressLocality": "Valletta",
      "addressRegion": "Malta",
      "postalCode": "VLT 1000",
      "addressCountry": "MT"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Malta"
    },
    "sameAs": [
      "https://www.linkedin.com/company/careers-mt",
      siteConfig.links.twitter
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}