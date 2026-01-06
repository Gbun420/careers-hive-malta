import "server-only";
import { createHash } from "crypto";

export function generateInputHash(data: {
  userId: string;
  jobId: string;
  type: string;
  userProfile: any;
  jobData: any;
  settings: any;
}): string {
  // Select only fields that affect content to ensure stable hash
  const payload = {
    u: {
      s: data.userProfile.skills,
      h: data.userProfile.headline,
      e: data.userProfile.experience,
    },
    j: {
      t: data.jobData.title,
      d: data.jobData.description,
    },
    t: data.type,
    s: {
      tone: data.settings.tone,
      lang: data.settings.language,
    }
  };

  return createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}
