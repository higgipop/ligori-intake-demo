"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit() {
    if (!pin) return;
    setLoading(true);
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError(true);
      setPin("");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--charcoal)" }}>
      <div className="w-full max-w-xs rounded-2xl p-8" style={{ background: "white" }}>
        <Image src="/pen-shield-logo.svg" alt="" width={40} height={40} className="mb-3" />
        <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "var(--crimson)" }}>
          Case Evaluation
        </p>
        <p className="font-bold text-lg mb-6" style={{ color: "var(--charcoal)" }}>Intake Dashboard</p>
        <input
          type="password"
          value={pin}
          onChange={e => { setPin(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Access code"
          autoFocus
          className="w-full px-4 py-3 rounded-xl border-2 text-base focus:outline-none mb-3"
          style={{ borderColor: error ? "#DC2626" : "#d8d8e4" }}
        />
        {error && <p className="text-xs text-red-600 mb-3">Incorrect code</p>}
        <button
          onClick={submit}
          disabled={loading || !pin}
          className="w-full py-3 rounded-xl text-white text-sm font-bold"
          style={{ background: "var(--crimson)", opacity: loading || !pin ? 0.6 : 1, cursor: loading || !pin ? "not-allowed" : "pointer" }}>
          {loading ? "Verifying…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
