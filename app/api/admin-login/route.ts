import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual, createHmac } from "crypto";

export const runtime = "nodejs";

const COOKIE = "admin_session";
const ADMIN_PIN = process.env.ADMIN_PIN ?? "";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "dev-secret-change-in-production";

function makeToken(): string {
  return createHmac("sha256", ADMIN_SECRET).update("admin-session-v1").digest("hex");
}

function pinValid(input: string): boolean {
  if (!ADMIN_PIN || input.length !== ADMIN_PIN.length) return false;
  return timingSafeEqual(Buffer.from(input), Buffer.from(ADMIN_PIN));
}

export async function POST(req: NextRequest) {
  const { pin } = await req.json().catch(() => ({ pin: "" }));
  if (!pinValid(pin ?? "")) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return res;
}
