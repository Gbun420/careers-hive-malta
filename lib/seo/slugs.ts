export const CATEGORY_MAP: Record<string, string> = {
  "software": "IT & Tech",
  "it-tech": "IT & Tech",
  "igaming": "iGaming",
  "finance": "Finance",
  "marketing": "Marketing",
  "hospitality": "Hospitality",
  "healthcare": "Healthcare",
  "legal": "Legal",
  "construction": "Construction",
  "education": "Education",
  "retail": "Retail",
};

export const LOCATION_MAP: Record<string, string> = {
  "malta": "Malta",
  "valletta": "Valletta",
  "sliema": "Sliema",
  "st-julians": "St. Julians",
  "birkirkara": "Birkirkara",
  "mosta": "Mosta",
  "qormi": "Qormi",
  "zabbar": "Zabbar",
  "naxxar": "Naxxar",
  "san-gwann": "San Gwann",
  "gzira": "Gzira",
  "msida": "Msida",
  "swieqi": "Swieqi",
  "mellieha": "Mellieha",
  "st-pauls-bay": "St. Pauls Bay",
  "gozo": "Gozo",
  "remote": "Remote",
};

export function getCategoryName(slug: string): string | null {
  return CATEGORY_MAP[slug.toLowerCase()] || null;
}

export function getLocationName(slug: string): string | null {
  return LOCATION_MAP[slug.toLowerCase()] || null;
}
