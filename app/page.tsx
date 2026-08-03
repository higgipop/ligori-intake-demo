"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormData, PracticeArea, Recency, Fault, Treatment, Insurance, InjuryType } from "@/lib/types";

const TOTAL_STEPS = 9;

const empty: FormData = {
  firstName: "", lastName: "", phone: "", email: "",
  practiceArea: "", recency: "", represented: null,
  fault: "", treatment: "", injuries: [], insurance: "", description: "",
};

function Progress({ step }: { step: number }) {
  const pct = Math.round((step / (TOTAL_STEPS - 1)) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--charcoal)", opacity: 0.5 }}>
        <span>Step {step + 1} of {TOTAL_STEPS}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "#e2e2e8" }}>
        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "var(--crimson)" }} />
      </div>
    </div>
  );
}

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 text-sm leading-snug"
      style={{
        borderColor: selected ? "var(--crimson)" : "#d8d8e4",
        background: selected ? "#8B1A1A0D" : "white",
        color: selected ? "var(--crimson)" : "var(--charcoal)",
        fontWeight: selected ? 600 : 400,
      }}>
      {children}
    </button>
  );
}

function CheckButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 text-sm flex items-start gap-3"
      style={{
        borderColor: selected ? "var(--crimson)" : "#d8d8e4",
        background: selected ? "#8B1A1A0D" : "white",
        color: selected ? "var(--crimson)" : "var(--charcoal)",
      }}>
      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center"
        style={{ borderColor: selected ? "var(--crimson)" : "#c0c0cc", background: selected ? "var(--crimson)" : "white" }}>
        {selected && (
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
            <path d="M1.5 5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span style={{ fontWeight: selected ? 600 : 400 }}>{children}</span>
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--crimson)" }}>{children}</p>;
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none"
      style={{ borderColor: "#d8d8e4", background: "white", color: "var(--charcoal)" }}
      onFocus={e => (e.target.style.borderColor = "var(--crimson)")}
      onBlur={e => (e.target.style.borderColor = "#d8d8e4")} />
  );
}

function NavButtons({ onBack, onNext, nextLabel = "Continue", nextDisabled = false, step }: {
  onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; step: number;
}) {
  return (
    <div className="flex gap-3 mt-8">
      {step > 0 && (
        <button type="button" onClick={onBack}
          className="px-5 py-3 rounded-xl border-2 text-sm font-semibold"
          style={{ borderColor: "#d8d8e4", color: "var(--charcoal)", background: "white" }}>
          ← Back
        </button>
      )}
      <button type="button" onClick={onNext} disabled={nextDisabled}
        className="flex-1 py-3 rounded-xl text-white text-sm font-bold tracking-wide"
        style={{ background: nextDisabled ? "#c0c0cc" : "var(--crimson)", cursor: nextDisabled ? "not-allowed" : "pointer" }}>
        {nextLabel}
      </button>
    </div>
  );
}

function ExitCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl p-8 text-center" style={{ background: "var(--charcoal)" }}>
      <div className="w-12 h-12 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#ffffff18" }}>
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="var(--gold)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-white text-lg font-bold mb-3">Thank You for Reaching Out</p>
      <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm mx-auto">{message}</p>
      <a href="tel:8132056160" className="inline-block px-8 py-3 rounded-xl text-white font-bold text-sm"
        style={{ background: "var(--crimson)" }}>
        Call (813) 205-6160
      </a>
    </div>
  );
}

export default function IntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(empty);
  const [exitMessage, setExitMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setData(d => ({ ...d, [k]: v }));
  }

  function toggleInjury(inj: InjuryType) {
    setData(d => ({
      ...d,
      injuries: d.injuries.includes(inj) ? d.injuries.filter(i => i !== inj) : [...d.injuries, inj],
    }));
  }

  function checkExit(nextData: Partial<FormData>): string | null {
    const m = { ...data, ...nextData };
    if (m.practiceArea === "other")
      return "Chris Ligori & Associates specializes in personal injury law. Based on what you've described, we may not be the right fit — but we'd be happy to point you in the right direction.";
    if (m.recency === "over-2")
      return "Florida law requires personal injury claims to be filed within two years of the incident. Based on your timeline, the filing deadline may have passed. We strongly recommend calling our office immediately — there may still be options.";
    if (m.represented === true)
      return "It sounds like you're already working with an attorney. We'd recommend speaking with your current counsel directly. If you have concerns about your representation, please call our office.";
    if (m.fault === "me")
      return "Personal injury cases require that another party's negligence caused your injuries. Based on what you've described, this may be difficult to pursue — but call us and we'll evaluate your specific situation.";
    return null;
  }

  function advance(nextData?: Partial<FormData>) {
    const merged = nextData ? { ...data, ...nextData } : data;
    if (nextData) setData(merged);
    const exit = nextData ? checkExit(nextData) : null;
    if (exit) { setExitMessage(exit); return; }
    setStep(s => s + 1);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      sessionStorage.setItem("intake-result", JSON.stringify({ result, data }));
      router.push("/result");
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--charcoal)", fontFamily: "Georgia, serif" }}>Free Case Evaluation</h1>
        <p className="text-gray-500 mt-1 text-sm">Answer a few questions and we&apos;ll assess the strength of your case — no obligation.</p>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="rounded-2xl shadow-lg p-8" style={{ background: "white" }}>
          <Progress step={step} />

          {exitMessage ? (
            <ExitCard message={exitMessage} />

          ) : step === 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>Let&apos;s start with your information</h2>
              <p className="text-sm text-gray-500 mb-6">All consultations are free and confidential.</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div><FieldLabel>First Name</FieldLabel><TextInput value={data.firstName} onChange={v => set("firstName", v)} placeholder="First name" /></div>
                <div><FieldLabel>Last Name</FieldLabel><TextInput value={data.lastName} onChange={v => set("lastName", v)} placeholder="Last name" /></div>
              </div>
              <div className="mb-4"><FieldLabel>Phone Number</FieldLabel><TextInput value={data.phone} onChange={v => set("phone", v)} placeholder="(813) 555-0100" type="tel" /></div>
              <div><FieldLabel>Email Address</FieldLabel><TextInput value={data.email} onChange={v => set("email", v)} placeholder="you@email.com" type="email" /></div>
              <NavButtons step={step} onNext={() => advance()} nextDisabled={!data.firstName || !data.lastName || !data.phone || !data.email} />
            </>

          ) : step === 1 ? (
            <>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>What type of legal matter do you have?</h2>
              <p className="text-sm text-gray-500 mb-6">We focus exclusively on personal injury cases.</p>
              <div className="space-y-3">
                {([
                  ["auto", "Auto, truck, or motorcycle accident"],
                  ["slip-fall", "Slip and fall / premises liability"],
                  ["med-mal", "Medical malpractice"],
                  ["wrongful-death", "Wrongful death"],
                  ["property-insurance", "Property insurance claim"],
                  ["other", "Something else"],
                ] as [PracticeArea, string][]).map(([val, label]) => (
                  <OptionButton key={val} selected={data.practiceArea === val} onClick={() => set("practiceArea", val)}>{label}</OptionButton>
                ))}
              </div>
              <NavButtons step={step} onBack={() => setStep(s => s - 1)} onNext={() => advance({ practiceArea: data.practiceArea })} nextDisabled={!data.practiceArea} />
            </>

          ) : step === 2 ? (
            <>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>When did the incident occur?</h2>
              <p className="text-sm text-gray-500 mb-6">Florida has a two-year statute of limitations for most personal injury claims.</p>
              <div className="space-y-3">
                {([
                  ["under-6", "Within the last 6 months"],
                  ["6-to-12", "6 to 12 months ago"],
                  ["1-to-2", "1 to 2 years ago"],
                  ["over-2", "More than 2 years ago"],
                ] as [Recency, string][]).map(([val, label]) => (
                  <OptionButton key={val} selected={data.recency === val} onClick={() => set("recency", val)}>{label}</OptionButton>
                ))}
              </div>
              <NavButtons step={step} onBack={() => setStep(s => s - 1)} onNext={() => advance({ recency: data.recency })} nextDisabled={!data.recency} />
            </>

          ) : step === 3 ? (
            <>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>Are you currently working with an attorney?</h2>
              <p className="text-sm text-gray-500 mb-6">We want to make sure we&apos;re not duplicating your representation.</p>
              <div className="space-y-3">
                <OptionButton selected={data.represented === false} onClick={() => set("represented", false)}>No, I don&apos;t have an attorney</OptionButton>
                <OptionButton selected={data.represented === true} onClick={() => set("represented", true)}>Yes, I&apos;m currently represented</OptionButton>
              </div>
              <NavButtons step={step} onBack={() => setStep(s => s - 1)} onNext={() => advance({ represented: data.represented })} nextDisabled={data.represented === null} />
            </>

          ) : step === 4 ? (
            <>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>Who was primarily at fault?</h2>
              <p className="text-sm text-gray-500 mb-6">This helps us understand the strength of your liability claim.</p>
              <div className="space-y-3">
                {([
                  ["them", "The other party was clearly at fault"],
                  ["mostly-them", "Mostly their fault — I may have played a minor role"],
                  ["unclear", "It's unclear or disputed"],
                  ["me", "I was primarily at fault"],
                ] as [Fault, string][]).map(([val, label]) => (
                  <OptionButton key={val} selected={data.fault === val} onClick={() => set("fault", val)}>{label}</OptionButton>
                ))}
              </div>
              <NavButtons step={step} onBack={() => setStep(s => s - 1)} onNext={() => advance({ fault: data.fault })} nextDisabled={!data.fault} />
            </>

          ) : step === 5 ? (
            <>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>Did you seek medical treatment?</h2>
              <p className="text-sm text-gray-500 mb-6">Medical documentation is critical to the value of your case.</p>
              <div className="space-y-3">
                {([
                  ["same-day", "Yes — ER or urgent care the same day"],
                  ["within-3", "Yes — within 3 days"],
                  ["within-2-weeks", "Yes — within 2 weeks"],
                  ["over-2-weeks", "Yes — but it took more than 2 weeks"],
                  ["none", "No, I haven't sought treatment yet"],
                ] as [Treatment, string][]).map(([val, label]) => (
                  <OptionButton key={val} selected={data.treatment === val} onClick={() => set("treatment", val)}>{label}</OptionButton>
                ))}
              </div>
              <NavButtons step={step} onBack={() => setStep(s => s - 1)} onNext={() => advance()} nextDisabled={!data.treatment} />
            </>

          ) : step === 6 ? (
            <>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>How would you describe your injuries?</h2>
              <p className="text-sm text-gray-500 mb-6">Select all that apply.</p>
              <div className="space-y-3">
                {([
                  ["broken-bones", "Broken bones or fractures"],
                  ["surgery", "Surgery was required or recommended"],
                  ["hospitalization", "I was hospitalized"],
                  ["head-injury", "Head injury or concussion"],
                  ["neck-back", "Neck, back, or shoulder injuries"],
                  ["emotional", "Emotional distress or PTSD"],
                  ["minor", "Minor cuts, bruises, or soreness"],
                ] as [InjuryType, string][]).map(([val, label]) => (
                  <CheckButton key={val} selected={data.injuries.includes(val)} onClick={() => toggleInjury(val)}>{label}</CheckButton>
                ))}
              </div>
              <NavButtons step={step} onBack={() => setStep(s => s - 1)} onNext={() => advance()} nextDisabled={data.injuries.length === 0} />
            </>

          ) : step === 7 ? (
            <>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>Does the at-fault party have insurance?</h2>
              <p className="text-sm text-gray-500 mb-6">This affects your ability to recover compensation.</p>
              <div className="space-y-3">
                {([
                  ["confirmed", "Yes — I have their insurance information"],
                  ["likely", "I believe so, but I don't have the details"],
                  ["uninsured-with-um", "They were uninsured, but I have uninsured motorist coverage"],
                  ["uninsured-no-um", "They were uninsured and I don't have UM coverage"],
                  ["unknown", "I'm not sure"],
                ] as [Insurance, string][]).map(([val, label]) => (
                  <OptionButton key={val} selected={data.insurance === val} onClick={() => set("insurance", val)}>{label}</OptionButton>
                ))}
              </div>
              <NavButtons step={step} onBack={() => setStep(s => s - 1)} onNext={() => advance()} nextDisabled={!data.insurance} />
            </>

          ) : step === 8 ? (
            <>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>Tell us what happened</h2>
              <p className="text-sm text-gray-500 mb-6">A brief description helps us understand your situation.</p>
              <textarea rows={5} value={data.description} onChange={e => set("description", e.target.value)}
                placeholder="Example: I was stopped at a red light when another driver ran the light and hit me on the driver's side. I went to the ER the same evening..."
                className="w-full px-4 py-3 rounded-xl border-2 text-sm resize-none focus:outline-none"
                style={{ borderColor: "#d8d8e4", color: "var(--charcoal)" }}
                onFocus={e => (e.target.style.borderColor = "var(--crimson)")}
                onBlur={e => (e.target.style.borderColor = "#d8d8e4")} />
              <p className="text-xs text-gray-400 mt-2">All information is strictly confidential and protected by attorney-client privilege.</p>
              <NavButtons step={step} onBack={() => setStep(s => s - 1)} onNext={submit}
                nextLabel={submitting ? "Evaluating your case…" : "Submit & See My Results"}
                nextDisabled={submitting || data.description.length < 10} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
