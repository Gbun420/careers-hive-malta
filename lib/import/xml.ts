import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

export const NormalizedJobSchema = z.object({
  external_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  company_name: z.string().min(1),
  location: z.string().min(1),
  url: z.string().url().optional().nullable(),
  apply_url: z.string().url().optional().nullable(),
  posted_at: z.string().datetime().optional().nullable(),
  valid_through: z.string().datetime().optional().nullable(),
});

export type NormalizedJob = z.infer<typeof NormalizedJobSchema>;

function resolvePath(obj: any, path: string | undefined): any {
  if (!path || !obj) return undefined;
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, obj);
}

function maybeUrl(val: any): string | undefined | null {
  if (typeof val !== 'string') return null;
  try {
    const url = new URL(val);
    return url.toString();
  } catch {
    return null;
  }
}

function maybeDate(val: any): string | undefined | null {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function parseXmlFeed(xmlText: string, mapping: any): Promise<NormalizedJob[]> {
  const parser = new XMLParser({ ignoreAttributes: false });
  const data = parser.parse(xmlText);

  const itemsRoot = resolvePath(data, mapping.rootPath);
  const arr = Array.isArray(itemsRoot) ? itemsRoot : (itemsRoot ? [itemsRoot] : []);

  const jobs = arr.map((item: any) => {
    const f = mapping.fields || {};
    return {
      external_id: String(resolvePath(item, f.external_id) ?? ""),
      title: String(resolvePath(item, f.title) ?? ""),
      description: String(resolvePath(item, f.description) ?? ""),
      company_name: String(resolvePath(item, f.company_name) ?? ""),
      location: String(resolvePath(item, f.location) ?? ""),
      url: maybeUrl(resolvePath(item, f.url)),
      apply_url: maybeUrl(resolvePath(item, f.apply_url)),
      posted_at: maybeDate(resolvePath(item, f.posted_at)),
      valid_through: maybeDate(resolvePath(item, f.valid_through)),
    };
  });

  const validJobs: NormalizedJob[] = [];
  for (const j of jobs) {
    const parsed = NormalizedJobSchema.safeParse(j);
    if (parsed.success) {
        validJobs.push(parsed.data);
    } else {
        // console.warn("Skipping invalid job from XML:", parsed.error);
    }
  }
  
  return validJobs;
}
