import "server-only";
import { GenerationType } from "./types";

export function buildPrompt(
  type: GenerationType,
  job: any,
  profile: any,
  settings: any
): string {
  const context = `
JOB TITLE: ${job.title}
JOB DESCRIPTION: ${job.description}

USER HEADLINE: ${profile.headline}
USER SKILLS: ${profile.skills?.join(", ")}
USER BIO: ${profile.bio}

TONE: ${settings.tone || 'professional'}
LANGUAGE: ${settings.language || 'en'}
`;

  const instructions: Record<GenerationType, string> = {
    FIT_SUMMARY: "Compare the user profile with the job description. Output JSON with headline, match_points (array), risks (array), and suggested_next_steps (array).",
    BULLETS: "Write 3 tailored resume bullets for the user applying to this specific job. Focus on impact and metrics. Output JSON with bullets (array).",
    COVER_LETTER: "Write a short, high-impact cover letter (max 200 words). Output JSON with subject and body.",
    INTERVIEW_PREP: "Identify the top 3 likely interview questions for this role and this candidate. Output JSON with questions (array of {q, why, star_prompt}).",
  };

  return `${instructions[type]}\n\nCONTEXT:\n${context}\n\nOutput only the JSON object.`;
}
