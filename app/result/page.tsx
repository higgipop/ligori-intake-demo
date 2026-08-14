"use client";

import { useEffect, useState } from "react";
import type { Result, ScoreResult, FormData } from "@/lib/types";

function GaugeNeedle({ angle }: { angle: number }) {
  const rad = (angle * Math.PI) / 180;
  const cx = 150, cy = 150, len = 90;
  const x2 = cx + len * Math.cos(rad);
  const y2 = cy - len * Math.sin(rad);
  return (
    <>
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="var(--charcoal)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="8" fill="var(--charcoal)" />
      <circle cx={cx} cy={cy} r="4" fill="white" />
    </>
  );
}

function Gauge({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const duration = 1400;
    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  // Gauge goes from 180° (left, 0) to 0° (right, 100)
  // needle angle: 180 at 0, 0 at 100
  const angle = 180 - (displayed / 100) * 180;

  const segments = [
    { color: "#DC2626", from: 180, to: 144 },  // 0–20: red
    { color: "#EA580C", from: 144, to: 108 },  // 20–40: orange
    { color: "#EAB308", from: 108, to: 72 },   // 40–60: yellow
    { color: "#65A30D", from: 72, to: 36 },    // 60–80: lime
    { color: "#16A34A", from: 36, to: 0 },     // 80–100: green
  ];

  function arcPath(startDeg: number, endDeg: number, r: number) {
    const cx = 150, cy = 150;
    const s = (startDeg * Math.PI) / 180;
    const e = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy - r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy - r * Math.sin(e);
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    const sweep = endDeg < startDeg ? 0 : 1;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`;
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="10 10 280 142" className="w-full max-w-xs">
        {/* Track */}
        <path d={arcPath(180, 0, 110)} stroke="#e2e2e8" strokeWidth="18" fill="none" strokeLinecap="butt" />
        {/* Colored segments */}
        {segments.map((seg, i) => (
          <path key={i} d={arcPath(seg.from, seg.to, 110)} stroke={seg.color} strokeWidth="18" fill="none" strokeLinecap="butt" opacity="0.85" />
        ))}
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map(v => {
          const deg = 180 - (v / 100) * 180;
          const rad = (deg * Math.PI) / 180;
          const r1 = 97, r2 = 125;
          return (
            <line key={v}
              x1={150 + r1 * Math.cos(rad)} y1={150 - r1 * Math.sin(rad)}
              x2={150 + r2 * Math.cos(rad)} y2={150 - r2 * Math.sin(rad)}
              stroke="white" strokeWidth="2" />
          );
        })}
        {/* Labels */}
        {[0, 25, 50, 75, 100].map(v => {
          const deg = 180 - (v / 100) * 180;
          const rad = (deg * Math.PI) / 180;
          const r = 135;
          return (
            <text key={v} x={150 + r * Math.cos(rad)} y={150 - r * Math.sin(rad)}
              textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#6b7280">
              {v}
            </text>
          );
        })}
        <GaugeNeedle angle={angle} />
      </svg>
      <div className="text-center" style={{ marginTop: "-4px" }}>
        <span style={{ fontSize: "3.5rem", fontWeight: 700, color: "var(--charcoal)", lineHeight: 1, fontFamily: "Georgia, serif" }}>
          {Math.round(displayed / 10)}
        </span>
        <span className="block text-xs tracking-widest mt-1" style={{ color: "#9ca3af", letterSpacing: "0.15em" }}>OUT OF 10</span>
      </div>
    </div>
  );
}

function TierBadge({ tier, label }: { tier: ScoreResult["tier"]; label: string }) {
  const colors: Record<ScoreResult["tier"], { bg: string; text: string; border: string }> = {
    strong:     { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
    promising:  { bg: "#d1fae5", text: "#047857", border: "#6ee7b7" },
    possible:   { bg: "#fef9c3", text: "#a16207", border: "#fde047" },
    challenging:{ bg: "#ffedd5", text: "#c2410c", border: "#fdba74" },
    unlikely:   { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
  };
  const c = colors[tier];
  return (
    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {label}
    </span>
  );
}

function BreakdownRow({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = (score / max) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: "var(--charcoal)" }}>
        <span>{label}</span>
        <span className="font-semibold">{score}/{max}</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "#e2e2e8" }}>
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "var(--crimson)" }} />
      </div>
    </div>
  );
}

export default function ResultPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [contactData, setContactData] = useState<FormData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("intake-result");
    if (stored) {
      const parsed = JSON.parse(stored);
      setResult(parsed.result);
      setContactData(parsed.data);
    }
  }, []);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 text-sm">Loading your results…</p>
      </div>
    );
  }

  if (result.disqualified) {
    return (
      <div className="py-10 max-w-xl mx-auto px-4">
        <div className="rounded-2xl p-8 text-center" style={{ background: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
          <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#fef2f2" }}>
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#b91c1c" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-xl font-bold mb-3" style={{ color: "var(--charcoal)" }}>Thank You for Reaching Out</p>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">{result.message}</p>
          <a href="tel:8132232929" className="inline-block px-8 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: "var(--crimson)" }}>
            Call (813) 223-2929
          </a>
        </div>
      </div>
    );
  }

  const r = result as ScoreResult;

  return (
    <div className="py-10">
      <div className="max-w-xl mx-auto px-4 space-y-5">

        {/* Gauge card */}
        <div className="rounded-2xl p-8" style={{ background: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
          {contactData && (
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--charcoal)" }}>
              {contactData.firstName}, here&apos;s your case evaluation:
            </p>
          )}
          <Gauge score={r.total} />
          <div className="text-center mt-2">
            <TierBadge tier={r.tier} label={r.tierLabel} />
            <p className="text-sm text-gray-500 mt-4 leading-relaxed max-w-sm mx-auto">{r.prospectMessage}</p>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="rounded-2xl p-7" style={{ background: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "var(--crimson)" }}>Score Breakdown</p>
          <div className="space-y-4">
            <BreakdownRow label="Fault / Liability" score={r.breakdown.fault} max={25} />
            <BreakdownRow label="Medical Treatment" score={r.breakdown.treatment} max={20} />
            <BreakdownRow label="Injury Severity" score={r.breakdown.severity} max={20} />
            <BreakdownRow label="Insurance Coverage" score={r.breakdown.insurance} max={15} />
            <BreakdownRow label="Case Type" score={r.breakdown.caseType} max={10} />
            <BreakdownRow label="Recency" score={r.breakdown.recency} max={10} />
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-7 text-center" style={{ background: "var(--charcoal)" }}>
          <p className="text-white font-bold text-lg mb-2">Speak with an Attorney</p>
          <p className="text-white/60 text-sm mb-5">Our team reviews every submission. We&apos;ll be in touch — but you can also call us directly now.</p>
          <a href="tel:8132232929"
            className="inline-block px-8 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: "var(--crimson)" }}>
            Call (813) 223-2929
          </a>
          <p className="text-white/30 text-xs mt-4">Available 24/7 · Free consultation · No fee unless we win</p>
        </div>

      </div>
    </div>
  );
}
