export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    "name": "Careers.mt",
    "description": "Malta's fastest job alerts platform with verified employers",
    "url": "https://careers-hive-malta-prod.vercel.app/",
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
      "https://www.linkedin.com/company/careers-hive-malta",
      "https://www.facebook.com/careershivemalta"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
