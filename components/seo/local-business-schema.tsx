import { siteConfig } from "@/lib/site-config";

export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    "name": siteConfig.name,
    "description": siteConfig.description,
    "url": siteConfig.url,
    "telephone": "+356-XXXX-XXXX",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Malta",
      "addressLocality": "Malta",
      "postalCode": "MT1000",
      "addressCountry": "MT"
    },
    "areaServed": "MT",
    "sameAs": [
      `https://www.linkedin.com/${siteConfig.social.linkedin}`,
      "https://www.facebook.com/careersmt"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
