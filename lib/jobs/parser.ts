/**
 * Basic Resume Parser Utility for Careers.mt
 * In a real production environment, this would use an LLM (OpenAI/Claude)
 * or a dedicated service like Sovren/Lever.
 */

const COMMON_SKILLS = [
  "React", "Node.js", "TypeScript", "JavaScript", "Python", "Java", "C#", "Go",
  "SQL", "PostgreSQL", "MongoDB", "AWS", "Azure", "Docker", "Kubernetes",
  "Project Management", "Agile", "Scrum", "Product Management", "Sales",
  "Marketing", "SEO", "Design", "Figma", "UI/UX", "Maltese", "English", "Italian"
];

export interface ParsedResume {
  skills: string[];
  experienceYears?: number;
  contactInfo: {
    email?: string;
    phone?: string;
  };
  suggestedHeadline?: string;
}

export function parseResumeText(text: string): ParsedResume {
  const lowercaseText = text.toLowerCase();
  
  // 1. Extract Skills
  const extractedSkills = COMMON_SKILLS.filter(skill => 
    lowercaseText.includes(skill.toLowerCase())
  );

  // 2. Estimate Experience (Very basic regex)
  const experienceMatch = text.match(/(\d+)\+?\s*years?\s*of?\s*experience/i);
  const experienceYears = experienceMatch ? parseInt(experienceMatch[1]) : undefined;

  // 3. Extract Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : undefined;

  // 4. Suggested Headline
  let suggestedHeadline = "";
  if (extractedSkills.length > 0) {
    suggestedHeadline = `${extractedSkills.slice(0, 3).join(", ")} Professional`;
  }

  return {
    skills: extractedSkills,
    experienceYears,
    contactInfo: {
      email,
    },
    suggestedHeadline
  };
}
