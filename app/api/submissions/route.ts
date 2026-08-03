import { NextResponse } from "next/server";
import { getSubmissions } from "@/lib/submissions";

export async function GET() {
  const subs = await getSubmissions();
  return NextResponse.json(subs);
}
