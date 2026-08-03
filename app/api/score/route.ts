import { NextRequest, NextResponse } from "next/server";
import { scoreCase } from "@/lib/scoring";
import { saveSubmission } from "@/lib/submissions";
import type { FormData } from "@/lib/types";

export async function POST(req: NextRequest) {
  const data: FormData = await req.json();
  const result = scoreCase(data);

  if (!result.disqualified) {
    saveSubmission({
      id: crypto.randomUUID(),
      ts: Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      practiceArea: data.practiceArea,
      recency: data.recency,
      score: result.total,
      tier: result.tier,
      tierLabel: result.tierLabel,
      callPriority: result.callPriority,
    }).catch(() => {}); // fire-and-forget; never block the response
  }

  return NextResponse.json(result);
}
