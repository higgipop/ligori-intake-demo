import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const submission = await req.json();

  // Production: replace below with real Lead Docket API call
  // const res = await fetch("https://app.leaddocket.com/api/v1/leads", {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${process.env.LEAD_DOCKET_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     first_name: submission.firstName,
  //     last_name: submission.lastName,
  //     phone: submission.phone,
  //     email: submission.email,
  //     case_type: submission.practiceArea,
  //     source: "AI Intake Form",
  //     notes: `Score: ${submission.score}/100 · ${submission.callPriority}. Submitted via tampawrongfuldeathattorney.com intake.`,
  //   }),
  // });
  // if (!res.ok) return NextResponse.json({ success: false }, { status: 502 });
  // const { id } = await res.json();
  // return NextResponse.json({ success: true, leadId: id });

  // Demo: simulated response
  await new Promise(r => setTimeout(r, 900));
  return NextResponse.json({ success: true, leadId: `LD-DEMO-${Date.now()}` });
}
