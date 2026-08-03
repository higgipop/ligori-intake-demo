"use client";

import { useState } from "react";

type Tier = "strong" | "promising" | "possible" | "challenging" | "unlikely";

interface Submission {
  id: string;
  ts: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  practiceArea: string;
  score: number;
  tier: Tier;
  tierLabel: string;
  callPriority: string;
}

const SUBMISSIONS: Submission[] = [
  {
    id: "1", ts: Date.now() - 1000 * 60 * 8,
    firstName: "Maria", lastName: "Rodriguez",
    phone: "(813) 555-0142", email: "m.rodriguez@gmail.com",
    practiceArea: "auto", score: 91, tier: "strong", tierLabel: "Strong Case",
    callPriority: "Same-day call",
  },
  {
    id: "2", ts: Date.now() - 1000 * 60 * 47,
    firstName: "James", lastName: "Patterson",
    phone: "(813) 555-0318", email: "james.p@outlook.com",
    practiceArea: "wrongful-death", score: 84, tier: "strong", tierLabel: "Strong Case",
    callPriority: "Same-day call",
  },
  {
    id: "3", ts: Date.now() - 1000 * 60 * 112,
    firstName: "Samantha", lastName: "Walsh",
    phone: "(727) 555-0229", email: "swalsh@gmail.com",
    practiceArea: "med-mal", score: 72, tier: "promising", tierLabel: "Promising",
    callPriority: "24-hour callback",
  },
  {
    id: "4", ts: Date.now() - 1000 * 60 * 195,
    firstName: "Robert", lastName: "Nguyen",
    phone: "(813) 555-0477", email: "rnguyen@gmail.com",
    practiceArea: "auto", score: 64, tier: "promising", tierLabel: "Promising",
    callPriority: "24-hour callback",
  },
  {
    id: "5", ts: Date.now() - 1000 * 60 * 260,
    firstName: "Lisa", lastName: "Monroe",
    phone: "(813) 555-0093", email: "lmonroe@icloud.com",
    practiceArea: "slip-fall", score: 48, tier: "possible", tierLabel: "Possible",
    callPriority: "48-hour callback",
  },
  {
    id: "6", ts: Date.now() - 1000 * 60 * 60 * 6,
    firstName: "Kevin", lastName: "Torres",
    phone: "(727) 555-0351", email: "k.torres@gmail.com",
    practiceArea: "auto", score: 29, tier: "challenging", tierLabel: "Challenging",
    callPriority: "Lower priority",
  },
  {
    id: "7", ts: Date.now() - 1000 * 60 * 60 * 14,
    firstName: "Ashley", lastName: "Brown",
    phone: "(813) 555-0688", email: "abrown@yahoo.com",
    practiceArea: "slip-fall", score: 12, tier: "unlikely", tierLabel: "Unlikely",
    callPriority: "Auto-response only",
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

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
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

const ADMIN_PIN = "ligori2026";

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function check() {
    if (pin === ADMIN_PIN) { onUnlock(); }
    else { setError(true); setPin(""); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--charcoal)" }}>
      <div className="w-full max-w-xs rounded-2xl p-8" style={{ background: "white" }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "var(--crimson)" }}>Chris Ligori &amp; Associates</p>
        <p className="font-bold text-lg mb-6" style={{ color: "var(--charcoal)" }}>Intake Dashboard</p>
        <input
          type="password" value={pin} onChange={e => { setPin(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="Access code"
          autoFocus
          className="w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none mb-3"
          style={{ borderColor: error ? "#DC2626" : "#d8d8e4" }} />
        {error && <p className="text-xs text-red-600 mb-3">Incorrect code</p>}
        <button onClick={check}
          className="w-full py-3 rounded-xl text-white text-sm font-bold"
          style={{ background: "var(--crimson)" }}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  const sorted = [...SUBMISSIONS].sort((a, b) => b.score - a.score);
  const strongCount = sorted.filter(s => s.score >= 80).length;
  const avgScore = Math.round(sorted.reduce((sum, s) => sum + s.score, 0) / sorted.length);

  return (
    <div className="min-h-screen" style={{ background: "var(--mist)" }}>
      <header className="py-5 px-6" style={{ background: "var(--charcoal)", borderBottom: "3px solid var(--crimson)" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base tracking-wide">Chris Ligori &amp; Associates</p>
            <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Intake Dashboard</p>
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
            { label: "Total Today", value: sorted.length, accent: false },
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

        {/* Legend */}
        <div className="flex items-center gap-5 mb-5 flex-wrap">
          {([
            ["#16A34A", "Strong (80+)"],
            ["#65A30D", "Promising (60+)"],
            ["#CA8A04", "Possible (40+)"],
            ["#EA580C", "Challenging (20+)"],
            ["#DC2626", "Unlikely"],
          ] as [string, string][]).map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Submissions */}
        <div className="space-y-3">
          {sorted.map(s => (
            <div key={s.id} className="rounded-2xl p-5"
              style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: `4px solid ${scoreColor(s.score)}` }}>
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
                      <a href={`tel:${s.phone.replace(/\D/g, "")}`}
                        className="text-sm font-semibold"
                        style={{ color: "var(--crimson)" }}>
                        {s.phone}
                      </a>
                    </div>
                    <PriorityBadge priority={s.callPriority} />
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    {caseTypeLabel(s.practiceArea)} · {s.tierLabel} · {timeAgo(s.ts)}
                  </p>
                  <PushButton submission={s} />
                </div>

              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          Demo data · Live submissions connect at buildout
        </p>
      </div>
    </div>
  );
}
