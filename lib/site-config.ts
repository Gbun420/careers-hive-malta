import { SITE_URL } from "@/lib/site/url";

export const siteConfig = {
  name: "Careers.mt",
  description: "The premium hub for Malta careers. Find verified jobs in tech, finance, and more.",
  url: SITE_URL,
  ogImage: "/brand/og-image.png",
  links: {
    twitter: "https://twitter.com/careersmt",
    github: "https://github.com/careers-mt",
  },
};

export const jobBoardConfig = {
  industries: [
    "Technology",
    "Finance",
    "iGaming",
    "Hospitality",
    "Legal",
    "Marketing",
    "Healthcare",
    "Construction",
  ],
  locations: [
    "Sliema",
    "St. Julians",
    "Valletta",
    "Birkirkara",
    "Mosta",
    "Gozo",
    "Remote",
  ],
};
