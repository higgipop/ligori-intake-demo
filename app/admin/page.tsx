"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Tier = "strong" | "promising" | "possible" | "challenging" | "unlikely";

interface Submission {
  id: string;
  ts: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  practiceArea: string;
  recency?: string;
  recencySpecific?: string;
  represented?: boolean | null;
  fault?: string;
  treatment?: string;
  injuries?: string[];
  insurance?: string;
  description?: string;
  score: number;
  tier: Tier;
  tierLabel: string;
  callPriority: string;
}

const DEMO_SUBMISSIONS: Submission[] = [
  {
    id: "1", ts: Date.now() - 1000 * 60 * 8,
    firstName: "Maria", lastName: "Rodriguez",
    phone: "(813) 555-0142", email: "m.rodriguez@gmail.com",
    practiceArea: "auto", recency: "under-1-month",
    description: "I was stopped at a red light on Dale Mabry when another driver ran it and hit me on the driver's side. Went to the ER same night. Neck and back still hurting.",
    fault: "them", treatment: "same-day", injuries: ["neck-back", "broken-bones"], insurance: "confirmed",
    score: 91, tier: "strong", tierLabel: "Strong Case", callPriority: "Same-day call",
  },
  {
    id: "2", ts: Date.now() - 1000 * 60 * 47,
    firstName: "James", lastName: "Patterson",
    phone: "(813) 555-0318", email: "james.p@outlook.com",
    practiceArea: "wrongful-death", recency: "1-to-3-months",
    description: "My father was struck by a commercial truck while crossing the street. He was hospitalized for three weeks before passing. The driver was cited at the scene.",
    fault: "them", treatment: "same-day", injuries: ["hospitalization", "head-injury"], insurance: "confirmed",
    score: 84, tier: "strong", tierLabel: "Strong Case", callPriority: "Same-day call",
  },
  {
    id: "3", ts: Date.now() - 1000 * 60 * 112,
    firstName: "Samantha", lastName: "Walsh",
    phone: "(727) 555-0229", email: "swalsh@gmail.com",
    practiceArea: "med-mal", recency: "3-to-6-months",
    description: "I had a routine knee replacement and woke up with nerve damage in my left leg. My surgeon hasn't returned calls. I've had two additional surgeries to try to correct it.",
    fault: "them", treatment: "within-2-weeks", injuries: ["surgery", "hospitalization"], insurance: "likely",
    score: 72, tier: "promising", tierLabel: "Promising", callPriority: "24-hour callback",
  },
  {
    id: "4", ts: Date.now() - 1000 * 60 * 195,
    firstName: "Robert", lastName: "Nguyen",
    phone: "(813) 555-0477", email: "rnguyen@gmail.com",
    practiceArea: "auto", recency: "under-1-month",
    description: "Rear-ended on I-275 during rush hour. Other driver's insurance accepted liability but their offer seems very low. I missed two weeks of work and still have headaches.",
    fault: "mostly-them", treatment: "within-3", injuries: ["neck-back", "head-injury"], insurance: "confirmed",
    score: 64, tier: "promising", tierLabel: "Promising", callPriority: "24-hour callback",
  },
  {
    id: "5", ts: Date.now() - 1000 * 60 * 260,
    firstName: "Lisa", lastName: "Monroe",
    phone: "(813) 555-0093", email: "lmonroe@icloud.com",
    practiceArea: "slip-fall", recency: "1-to-3-months",
    description: "Slipped on a wet floor at a Publix near my home. No wet floor sign was posted. Sprained my ankle and bruised my hip. Went to urgent care the next day.",
    fault: "them", treatment: "within-3", injuries: ["minor", "neck-back"], insurance: "likely",
    score: 48, tier: "possible", tierLabel: "Possible", callPriority: "48-hour callback",
  },
  {
    id: "6", ts: Date.now() - 1000 * 60 * 60 * 6,
    firstName: "Kevin", lastName: "Torres",
    phone: "(727) 555-0351", email: "k.torres@gmail.com",
    practiceArea: "auto", recency: "6-to-12",
    description: "Got hit pulling out of a parking lot. Not sure who was at fault. Saw a chiropractor a few times but stopped going. Minor soreness that mostly went away.",
    fault: "unclear", treatment: "over-2-weeks", injuries: ["minor"], insurance: "unknown",
    score: 29, tier: "challenging", tierLabel: "Challenging", callPriority: "Lower priority",
  },
  {
    id: "7", ts: Date.now() - 1000 * 60 * 60 * 14,
    firstName: "Ashley", lastName: "Brown",
    phone: "(813) 555-0688", email: "abrown@yahoo.com",
    practiceArea: "slip-fall", recency: "1-to-2",
    description: "Tripped on a crack in a sidewalk outside a restaurant about 18 months ago. Just some bruises. I didn't go to the doctor at the time.",
    fault: "unclear", treatment: "none", injuries: ["minor"], insurance: "unknown",
    score: 12, tier: "unlikely", tierLabel: "Unlikely", callPriority: "Auto-response only",
  },
];

function scoreColor(score: number): string {
  if (score >= 80) return "#16A34A";
  if (score >= 60) return "#65A30D";
  if (score >= 40) return "#CA8A04";
  if (score >= 20) return "#EA580C";
  return "#DC2626";
}

function caseTypeLabel(pa: string): string {
  const map: Record<string, string> = {
    "auto": "Auto Accident",
    "slip-fall": "Slip & Fall",
    "med-mal": "Medical Malpractice",
    "wrongful-death": "Wrongful Death",
    "property-insurance": "Property Insurance",
  };
  return map[pa] ?? pa;
}

function recencyLabel(r: string): string {
  const map: Record<string, string> = {
    "under-1-month": "< 1 mo ago",
    "1-to-3-months": "1–3 mo ago",
    "3-to-6-months": "3–6 mo ago",
    "under-6": "< 6 mo ago",
    "6-to-12": "6–12 mo ago",
    "1-to-2": "1–2 yrs ago",
  };
  return map[r] ?? r;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const FAULT_LABELS: Record<string, string> = {
  "them": "Other party clearly at fault",
  "mostly-them": "Mostly other party — minor shared fault",
  "unclear": "Unclear or disputed",
  "me": "Self at fault",
};
const TREATMENT_LABELS: Record<string, string> = {
  "same-day": "ER / urgent care same day",
  "within-3": "Within 3 days",
  "within-2-weeks": "Within 2 weeks",
  "over-2-weeks": "More than 2 weeks later",
  "none": "No treatment yet",
};
const INSURANCE_LABELS: Record<string, string> = {
  "confirmed": "Yes — confirmed",
  "likely": "Believe so, unconfirmed",
  "uninsured-with-um": "Uninsured — has UM coverage",
  "uninsured-no-um": "Uninsured — no UM coverage",
  "unknown": "Unknown",
};
const INJURY_LABELS: Record<string, string> = {
  "broken-bones": "Broken bones / fractures",
  "surgery": "Surgery required",
  "hospitalization": "Hospitalized",
  "head-injury": "Head injury / concussion",
  "neck-back": "Neck, back, or shoulder",
  "emotional": "Emotional distress / PTSD",
  "minor": "Minor cuts, bruises, soreness",
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-xs">
      <span className="w-28 flex-shrink-0 font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <span style={{ color: "var(--charcoal)" }}>{value}</span>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "called-no-answer", label: "Called — no answer" },
  { value: "left-voicemail", label: "Left voicemail" },
  { value: "connected", label: "Connected" },
  { value: "scheduled", label: "Scheduled consultation" },
  { value: "closed-lead-docket", label: "Closed → Lead Docket" },
  { value: "closed-not-qualified", label: "Closed → Not Qualified" },
  { value: "closed-referral", label: "Closed → Referral" },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "called-no-answer":  { bg: "#f3f4f6", color: "#6b7280" },
  "left-voicemail":    { bg: "#FEF9C3", color: "#92400E" },
  "connected":         { bg: "#DCFCE7", color: "#166534" },
  "scheduled":         { bg: "#DBEAFE", color: "#1e40af" },
  "closed-lead-docket":{ bg: "#8B1A1A", color: "white" },
  "closed-not-qualified": { bg: "#374151", color: "white" },
  "closed-referral":   { bg: "#4338CA", color: "white" },
};

interface LogEntry { ts: number; agent: string; status: string; note: string; }

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: "#f3f4f6", color: "#6b7280" };
  const label = STATUS_OPTIONS.find(o => o.value === status)?.label ?? status;
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>{label}</span>
  );
}

function LogSection({ submissionId }: { submissionId: string }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState("");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAgent(localStorage.getItem("intake-agent") ?? "");
    }
    fetch(`/api/log?id=${submissionId}`)
      .then(r => r.json())
      .then((data: LogEntry[]) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [submissionId]);

  function saveAgent(name: string) {
    setAgent(name);
    localStorage.setItem("intake-agent", name);
  }

  async function addEntry() {
    if (!agent.trim() || !status) return;
    setSaving(true);
    const entry: LogEntry = { ts: Date.now(), agent: agent.trim(), status, note };
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, ...entry }),
    });
    setEntries(prev => [...prev, entry]);
    setNote("");
    setStatus("");
    setSaving(false);
  }

  const closedEntry = entries.findLast(e => e.status.startsWith("closed"));
  const isClosed = !!closedEntry;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--crimson)" }}>Activity Log</p>

      {loading && <p className="text-xs text-gray-400 mb-3">Loading…</p>}

      {entries.length === 0 && !loading && (
        <p className="text-xs text-gray-400 mb-3">No activity yet.</p>
      )}

      {entries.length > 0 && (
        <div className="space-y-2 mb-4">
          {entries.map((e, i) => (
            <div key={i} className="flex gap-3 text-xs items-start">
              <span className="text-gray-400 flex-shrink-0 pt-0.5 w-32">
                {new Date(e.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" "}
                {new Date(e.ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="font-semibold" style={{ color: "var(--charcoal)" }}>{e.agent}</span>
                  <StatusBadge status={e.status} />
                </div>
                {e.note && <p className="text-gray-500 leading-relaxed">{e.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isClosed && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <input
            type="text"
            placeholder="Your name"
            value={agent}
            onChange={e => saveAgent(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-xs focus:outline-none"
            style={{ borderColor: "#e5e7eb" }}
          />
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map(o => (
              <button key={o.value} type="button"
                onClick={() => setStatus(o.value)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: status === o.value ? (STATUS_COLORS[o.value]?.bg ?? "#e5e7eb") : "#f3f4f6",
                  color: status === o.value ? (STATUS_COLORS[o.value]?.color ?? "#374151") : "#6b7280",
                  border: `1.5px solid ${status === o.value ? (STATUS_COLORS[o.value]?.bg ?? "#e5e7eb") : "transparent"}`,
                }}>
                {o.label}
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            placeholder="Optional note…"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-xs resize-none focus:outline-none"
            style={{ borderColor: "#e5e7eb" }}
          />
          <button
            onClick={addEntry}
            disabled={!agent.trim() || !status || saving}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
            style={{ background: (!agent.trim() || !status || saving) ? "#c0c0cc" : "var(--crimson)", cursor: (!agent.trim() || !status || saving) ? "not-allowed" : "pointer" }}>
            {saving ? "Saving…" : "Log Entry"}
          </button>
        </div>
      )}

      {isClosed && closedEntry && (
        <p className="text-xs font-semibold text-center py-2" style={{ color: "#16A34A" }}>
          ✓ {STATUS_OPTIONS.find(o => o.value === closedEntry.status)?.label ?? "Closed"}
        </p>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    "Same-day call":      { bg: "#8B1A1A", color: "white" },
    "24-hour callback":   { bg: "#EA580C", color: "white" },
    "48-hour callback":   { bg: "#FEF9C3", color: "#92400E" },
    "Lower priority":     { bg: "#e5e7eb", color: "#6b7280" },
    "Auto-response only": { bg: "#f3f4f6", color: "#9ca3af" },
  };
  const s = styles[priority] ?? styles["Lower priority"];
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      {priority}
    </span>
  );
}

function PushButton({ submission }: { submission: Submission }) {
  const [status, setStatus] = useState<"idle" | "pushing" | "done" | "error">("idle");

  async function handlePush() {
    setStatus("pushing");
    try {
      const res = await fetch("/api/push-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "#16A34A" }}>
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 8l4 4 8-8" />
        </svg>
        Sent to Lead Docket
      </span>
    );
  }

  return (
    <button
      onClick={handlePush}
      disabled={status === "pushing"}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition-all"
      style={{
        borderColor: status === "error" ? "#DC2626" : "var(--crimson)",
        color: status === "error" ? "#DC2626" : "var(--crimson)",
        background: "white",
        opacity: status === "pushing" ? 0.6 : 1,
        cursor: status === "pushing" ? "not-allowed" : "pointer",
      }}>
      {status === "pushing" ? "Pushing…" : status === "error" ? "Failed — retry" : "Push to Lead Docket →"}
    </button>
  );
}

type TimeFilter = "all" | "today" | "week" | "month";
type TierFilter = "all" | Tier;

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={{
        background: active ? "var(--crimson)" : "white",
        color: active ? "white" : "#6b7280",
        border: `1.5px solid ${active ? "var(--crimson)" : "#e5e7eb"}`,
      }}>
      {children}
    </button>
  );
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>(DEMO_SUBMISSIONS);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/submissions")
      .then(r => r.json())
      .then((data: Submission[]) => {
        if (data.length > 0) {
          setSubmissions(data);
          setIsDemo(false);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const now = Date.now();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(todayStart); monthStart.setDate(1);

  const sorted = [...submissions].sort((a, b) => b.score - a.score);
  const todayCount = sorted.filter(s => s.ts >= todayStart.getTime()).length;
  const strongCount = sorted.filter(s => s.score >= 80).length;
  const avgScore = sorted.length
    ? Math.round(sorted.reduce((sum, s) => sum + s.score, 0) / sorted.length)
    : 0;

  const filtered = sorted.filter(s => {
    if (timeFilter === "today" && s.ts < todayStart.getTime()) return false;
    if (timeFilter === "week" && s.ts < weekStart.getTime()) return false;
    if (timeFilter === "month" && s.ts < monthStart.getTime()) return false;
    if (tierFilter !== "all" && s.tier !== tierFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--mist)" }}>
      <header className="py-5 px-6" style={{ background: "var(--charcoal)", borderBottom: "3px solid var(--crimson)" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/pen-shield-logo.svg" alt="" width={36} height={36} />
            <div>
              <p className="text-white font-bold text-base tracking-wide">Case Evaluation</p>
              <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Intake Dashboard</p>
            </div>
          </div>
          <p className="text-white/40 text-xs">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {([
            { label: "Today", value: todayCount, accent: false },
            { label: "Priority (Strong)", value: strongCount, accent: true },
            { label: "Avg Score", value: avgScore, accent: false },
          ] as { label: string; value: number; accent: boolean }[]).map(stat => (
            <div key={stat.label} className="rounded-2xl p-5 text-center"
              style={{
                background: "white",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                borderTop: `3px solid ${stat.accent ? "var(--crimson)" : "transparent"}`,
              }}>
              <p className="text-3xl font-bold" style={{ color: stat.accent ? "var(--crimson)" : "var(--charcoal)", fontFamily: "Georgia, serif" }}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 w-12">Period</span>
            {(["all", "today", "week", "month"] as TimeFilter[]).map(f => (
              <FilterPill key={f} active={timeFilter === f} onClick={() => setTimeFilter(f)}>
                {f === "all" ? "All time" : f === "today" ? "Today" : f === "week" ? "This week" : "This month"}
              </FilterPill>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 w-12">Tier</span>
            {(["all", "strong", "promising", "possible", "challenging", "unlikely"] as TierFilter[]).map(f => (
              <FilterPill key={f} active={tierFilter === f} onClick={() => setTierFilter(f)}>
                {f === "all" ? "All tiers" : f.charAt(0).toUpperCase() + f.slice(1)}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Submissions */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">No submissions match these filters.</p>
          )}
          {filtered.map(s => (
            <div key={s.id} className="rounded-2xl overflow-hidden"
              style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: `4px solid ${scoreColor(s.score)}` }}>
              <div className="p-5 cursor-pointer select-none" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
              <div className="flex gap-5 items-start">

                {/* Score */}
                <div className="flex-shrink-0 w-14 text-center">
                  <div className="text-3xl font-bold leading-none" style={{ color: scoreColor(s.score), fontFamily: "Georgia, serif" }}>
                    {s.score}
                  </div>
                  <div className="text-xs text-gray-400 mb-2.5">/ 100</div>
                  <div className="h-1.5 rounded-full" style={{ background: "#e5e7eb" }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${s.score}%`, background: scoreColor(s.score) }} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                    <div>
                      <p className="font-bold text-sm" style={{ color: "var(--charcoal)" }}>
                        {s.firstName} {s.lastName}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        <a href={`tel:${s.phone.replace(/\D/g, "")}`}
                          className="text-sm font-semibold"
                          style={{ color: "var(--crimson)" }}>
                          {s.phone}
                        </a>
                        <a href={`mailto:${s.email}`}
                          className="text-sm text-gray-400 hover:text-gray-600">
                          {s.email}
                        </a>
                      </div>
                    </div>
                    <PriorityBadge priority={s.callPriority} />
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {caseTypeLabel(s.practiceArea)} · {s.tierLabel} · {s.recency ? recencyLabel(s.recency) + " · " : ""}{timeAgo(s.ts)}
                  </p>
                  {s.description && (
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
                      {s.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <PushButton submission={s} />
                    <span className="text-xs text-gray-400">{expandedId === s.id ? "▲ Hide details" : "▼ View details"}</span>
                  </div>
                </div>

              </div>
              </div>

              {/* Expanded detail panel */}
              {expandedId === s.id && (
                <div className="px-5 pb-5 pt-1 border-t border-gray-100 space-y-2.5" style={{ background: "#fafafa" }}>
                  {s.fault && <DetailRow label="Fault" value={FAULT_LABELS[s.fault] ?? s.fault} />}
                  {s.treatment && <DetailRow label="Treatment" value={TREATMENT_LABELS[s.treatment] ?? s.treatment} />}
                  {s.injuries && s.injuries.length > 0 && (
                    <DetailRow label="Injuries" value={s.injuries.map(i => INJURY_LABELS[i] ?? i).join(", ")} />
                  )}
                  {s.insurance && <DetailRow label="Insurance" value={INSURANCE_LABELS[s.insurance] ?? s.insurance} />}
                  {s.represented != null && <DetailRow label="Prior attorney" value={s.represented ? "Yes" : "No"} />}
                  {s.recency && <DetailRow label="Incident" value={recencyLabel(s.recency)} />}
                  {s.description && (
                    <div className="flex gap-3 text-xs pt-1">
                      <span className="w-28 flex-shrink-0 font-semibold text-gray-400 uppercase tracking-wide">Description</span>
                      <span className="leading-relaxed" style={{ color: "var(--charcoal)" }}>{s.description}</span>
                    </div>
                  )}
                  <LogSection submissionId={s.id} />
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          {loading ? "Loading…" : isDemo ? "Showing demo data · Live submissions appear here after form is submitted" : `${filtered.length} of ${sorted.length} submission${sorted.length !== 1 ? "s" : ""}`}
        </p>
      </div>
    </div>
  );
}
