export interface StoredSubmission {
  id: string;
  ts: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  practiceArea: string;
  recency: string;
  recencySpecific?: string;
  represented?: boolean | null;
  fault?: string;
  treatment?: string;
  injuries?: string[];
  insurance?: string;
  description?: string;
  score: number;
  tier: string;
  tierLabel: string;
  callPriority: string;
}

export interface LogEntry {
  ts: number;
  agent: string;
  status: string;
  note: string;
}

const KV_KEY = "intake:submissions";
const MAX_STORED = 500;

function kvAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function saveSubmission(sub: StoredSubmission): Promise<void> {
  if (!kvAvailable()) return;
  const { kv } = await import("@vercel/kv");
  await kv.lpush(KV_KEY, JSON.stringify(sub));
  await kv.ltrim(KV_KEY, 0, MAX_STORED - 1);
}

export async function addLogEntry(submissionId: string, entry: LogEntry): Promise<void> {
  if (!kvAvailable()) return;
  const { kv } = await import("@vercel/kv");
  await kv.rpush(`intake:log:${submissionId}`, JSON.stringify(entry));
}

export async function getLog(submissionId: string): Promise<LogEntry[]> {
  if (!kvAvailable()) return [];
  try {
    const { kv } = await import("@vercel/kv");
    const items = await kv.lrange<string>(`intake:log:${submissionId}`, 0, -1);
    return items.map(i => (typeof i === "string" ? JSON.parse(i) : i));
  } catch {
    return [];
  }
}

export async function getSubmissions(): Promise<StoredSubmission[]> {
  if (!kvAvailable()) return [];
  try {
    const { kv } = await import("@vercel/kv");
    const items = await kv.lrange<string>(KV_KEY, 0, -1);
    return items.map(i => (typeof i === "string" ? JSON.parse(i) : i));
  } catch {
    return [];
  }
}
