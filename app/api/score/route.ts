import { NextRequest, NextResponse } from "next/server";
import { scoreCase } from "@/lib/scoring";
import type { FormData } from "@/lib/types";

export async function POST(req: NextRequest) {
  const data: FormData = await req.json();
  const result = scoreCase(data);
  return NextResponse.json(result);
}
