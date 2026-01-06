import { BRAND_NAME, BRAND_TAGLINE_SHORT } from "./brand";

export const siteConfig = {
  name: BRAND_NAME,
  shortName: BRAND_NAME,
  description: BRAND_TAGLINE_SHORT,
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://careers-hive-malta-prod.vercel.app",
  logo: "/logo-careers-mt.svg",
  social: {
    twitter: "@careersmt",
    linkedin: "company/careers-mt"
  },
  locations: [
    "Valletta", "Sliema", "St. Julians", "Birkirkara", "Mosta", 
    "Qormi", "Zabbar", "Naxxar", "San Gwann", "Gzira", 
    "Msida", "Swieqi", "Mellieha", "St. Pauls Bay", "Gozo", "Remote"
  ],
  industries: [
    "IT & Tech", "iGaming", "Finance", "Marketing", "Hospitality", 
    "Healthcare", "Legal", "Construction", "Education", "Retail"
  ]
};
