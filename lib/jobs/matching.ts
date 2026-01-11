import { Job, JobseekerProfile } from "./schema";

export interface MatchResult {
  jobId: string;
  score: number; // 0 to 100
  matchedSkills: string[];
  reasons: string[];
}

/**
 * Professional 4-factor matching algorithm for Careers.mt
 */
export function calculateMatchScore(
  profile: JobseekerProfile,
  job: Job
): MatchResult {
  const profileSkills = profile.skills || [];
  const jobTitle = (job.title || "").toLowerCase();
  const jobDesc = (job.description || "").toLowerCase();
  const reasons: string[] = [];

  // 1. Skill Match (35% weight)
  const matchedSkills = profileSkills.filter(skill => {
    const s = skill.toLowerCase();
    return jobTitle.includes(s) || jobDesc.includes(s);
  });
  let skillScore = 0;
  if (profileSkills.length > 0) {
    skillScore = (matchedSkills.length / profileSkills.length) * 100;
    if (matchedSkills.length > 0) reasons.push(`Matches ${matchedSkills.length} of your skills`);
  }

  // 2. Experience Level (25% weight)
  // Logic: Profile headline/bio keyword check vs Job title
  let expScore = 0;
  const seniorKeywords = ['senior', 'lead', 'manager', 'head', 'principal'];
  const juniorKeywords = ['junior', 'entry', 'trainee', 'intern'];
  
  const isProfileSenior = seniorKeywords.some(k => profile.headline?.toLowerCase().includes(k) || profile.bio?.toLowerCase().includes(k));
  const isJobSenior = seniorKeywords.some(k => jobTitle.includes(k));
  const isProfileJunior = juniorKeywords.some(k => profile.headline?.toLowerCase().includes(k) || profile.bio?.toLowerCase().includes(k));
  const isJobJunior = juniorKeywords.some(k => jobTitle.includes(k));

  if (isProfileSenior === isJobSenior || isProfileJunior === isJobJunior) {
    expScore = 100;
    reasons.push("Matches your seniority level");
  } else {
    expScore = 50;
  }

  // 3. Location & Region Match (Maltese Factor - 20% weight)
  let locScore = 0;
  const isRemote = !job.location || job.location === "Remote" || job.location.toLowerCase().includes("remote") || job.office_region === "Remote";
  
  if (isRemote) {
    locScore = 100;
    reasons.push("Remote friendly");
  } else if (profile.preferred_region && job.office_region) {
    if (profile.preferred_region === "Any" || profile.preferred_region === job.office_region) {
      locScore = 100;
      reasons.push(`Located in your preferred region: ${job.office_region}`);
    } else {
      locScore = 50;
    }
  } else {
    locScore = 100; // Defaulting to 100 for now
  }

  // 4. Commute Time (Maltese Factor - 10% weight)
  let commuteScore = 100;
  if (profile.max_commute_time && job.commute_time_mins) {
    if (job.commute_time_mins <= profile.max_commute_time) {
      commuteScore = 100;
      reasons.push(`Commute time (${job.commute_time_mins}m) fits your preference`);
    } else {
      commuteScore = Math.max(0, 100 - (job.commute_time_mins - profile.max_commute_time) * 2);
    }
  }

  // 5. Salary Fit (10% weight)
  // Simplified since we don't have seeker salary expectations yet
  let salaryScore = 100; 

  // Final weighted score
  const score = Math.round(
    (skillScore * 0.35) + 
    (expScore * 0.25) + 
    (locScore * 0.20) + 
    (commuteScore * 0.10) +
    (salaryScore * 0.10)
  );

  return {
    jobId: job.id,
    score: Math.min(score, 100),
    matchedSkills,
    reasons
  };
}

export function getRankedJobs(
  profile: JobseekerProfile,
  jobs: Job[]
): (Job & { matchResult: MatchResult })[] {
  return jobs
    .map(job => ({
      ...job,
      matchResult: calculateMatchScore(profile, job)
    }))
    .sort((a, b) => b.matchResult.score - a.matchResult.score);
}