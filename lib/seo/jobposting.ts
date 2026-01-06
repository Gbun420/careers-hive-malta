export function generateJobPostingJsonLd(job: any, siteUrl: string) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company_name || "Careers.mt",
      "value": job.external_id || job.id
    },
    "datePosted": job.posted_at,
    "validThrough": job.valid_through,
    "employmentType": mapEmploymentType(job.employment_type),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company_name,
      "sameAs": job.company_url || undefined,
      "logo": job.company_logo || undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "MT"
      }
    }
  };

  if (job.salary_min || job.salary_max) {
      schema.baseSalary = {
      "@type": "MonetaryAmount",
      "currency": job.currency || "EUR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary_min,
        "maxValue": job.salary_max,
        "unitText": "YEAR"
      }
    };
  }
  
  return schema;
}

function mapEmploymentType(type: string | null) {
  if (!type) return "FULL_TIME";
  const t = type.toUpperCase();
  if (t.includes("FULL")) return "FULL_TIME";
  if (t.includes("PART")) return "PART_TIME";
  if (t.includes("CONTRACT")) return "CONTRACTOR";
  if (t.includes("TEMP")) return "TEMPORARY";
  if (t.includes("INTERN")) return "INTERN";
  return "FULL_TIME";
}
