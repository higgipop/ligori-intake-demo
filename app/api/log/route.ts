import { NextRequest, NextResponse } from "next/server";
import { addLogEntry, getLog } from "@/lib/submissions";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const entries = await getLog(id);
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const { submissionId, agent, status, note } = await req.json();
  if (!submissionId || !agent || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  await addLogEntry(submissionId, { ts: Date.now(), agent, status, note: note ?? "" });
  return NextResponse.json({ ok: true });
}
