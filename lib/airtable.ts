import "server-only";

const AIRTABLE_API = "https://api.airtable.com/v0";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function airtableConfig() {
  return {
    token: requireEnv("AIRTABLE_TOKEN"),
    baseId: requireEnv("AIRTABLE_BASE_ID"),
    applicantsTable: requireEnv("AIRTABLE_APPLICANTS_TABLE_ID"),
    interviewersTable: requireEnv("AIRTABLE_INTERVIEWERS_TABLE_ID"),
  };
}

type AirtableRecord<TFields> = { id: string; fields: TFields; createdTime?: string };
type AirtableListResp<TFields> = { records: AirtableRecord<TFields>[]; offset?: string };

export async function airtableFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { token } = airtableConfig();
  const res = await fetch(`${AIRTABLE_API}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Airtable ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export type Stage = "Submitted" | "Interviewing" | "Decision needed" | "Hire" | "No hire";

export type ApplicantFields = {
  "Name"?: string;
  "Stage"?: Stage;
  "Onsite interview"?: string; // ISO date string (Airtable returns as "YYYY-MM-DD")
  "Phone interviewer"?: string[]; // linked record IDs
  "Onsite interviewer"?: string[]; // linked record IDs
  "Onsite interview score"?: string;
  "Onsite interview notes"?: string;
};

export type InterviewerFields = { "Name"?: string };

export async function listAllRecords<TFields>(
  tableId: string,
  params: URLSearchParams
): Promise<AirtableRecord<TFields>[]> {
  const { baseId } = airtableConfig();
  let out: AirtableRecord<TFields>[] = [];
  let offset: string | undefined = undefined;

  do {
    const p = new URLSearchParams(params);
    if (offset) p.set("offset", offset);

    const data = await airtableFetch<AirtableListResp<TFields>>(
      `/${baseId}/${tableId}?${p.toString()}`
    );
    out = out.concat(data.records);
    offset = data.offset;
  } while (offset);

  return out;
}

export async function getInterviewersMap(): Promise<Record<string, string>> {
  const { interviewersTable } = airtableConfig();
  const params = new URLSearchParams();
  params.append("fields[]", "Name");
  params.set("pageSize", "100");

  const records = await listAllRecords<InterviewerFields>(interviewersTable, params);
  const map: Record<string, string> = {};
  for (const r of records) map[r.id] = r.fields["Name"] ?? r.id;
  return map;
}

export async function listApplicants(): Promise<AirtableRecord<ApplicantFields>[]> {
  const { applicantsTable } = airtableConfig();

  const params = new URLSearchParams();
  [
    "Name",
    "Stage",
    "Onsite interview",
    "Phone interviewer",
    "Onsite interviewer",
    "Onsite interview score",
    "Onsite interview notes",
  ].forEach((f) => params.append("fields[]", f));

  params.set("pageSize", "200");
  params.append("sort[0][field]", "Name");
  params.append("sort[0][direction]", "asc");

  return listAllRecords<ApplicantFields>(applicantsTable, params);
}

export async function listInterviewingApplicants(): Promise<AirtableRecord<ApplicantFields>[]> {
  const { applicantsTable } = airtableConfig();

  const params = new URLSearchParams();
  [
    "Name",
    "Stage",
    "Onsite interview",
    "Phone interviewer",
    "Onsite interviewer",
    "Onsite interview score",
    "Onsite interview notes",
  ].forEach((f) => params.append("fields[]", f));

  // Airtable filterByFormula uses field names.
  params.set("filterByFormula", `{Stage}="Interviewing"`);
  params.set("pageSize", "200");
  params.append("sort[0][field]", "Onsite interview");
  params.append("sort[0][direction]", "asc");
  params.append("sort[1][field]", "Name");
  params.append("sort[1][direction]", "asc");

  return listAllRecords<ApplicantFields>(applicantsTable, params);
}

export async function updateApplicant(recordId: string, fields: Partial<ApplicantFields>) {
  const { baseId, applicantsTable } = airtableConfig();
  return airtableFetch<{ records: { id: string }[] }>(
    `/${baseId}/${applicantsTable}`,
    {
      method: "PATCH",
      body: JSON.stringify({ records: [{ id: recordId, fields }] }),
    }
  );
}
