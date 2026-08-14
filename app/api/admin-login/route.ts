import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual, createHmac } from "crypto";

export const runtime = "nodejs";

const COOKIE = "admin_session";
// Supports two independent PINs (e.g. one per person who needs access) —
// ADMIN_PIN_2 is optional, unset means only ADMIN_PIN is valid.
const VALID_PINS = [process.env.ADMIN_PIN, process.env.ADMIN_PIN_2].filter(
  (pin): pin is string => !!pin,
);
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "dev-secret-change-in-production";

function makeToken(): string {
  return createHmac("sha256", ADMIN_SECRET).update("admin-session-v1").digest("hex");
}

function pinValid(input: string): boolean {
  // Check every candidate rather than short-circuiting on the first
  // length mismatch, so which PIN (if either) matched isn't
  // distinguishable via response timing.
  let matched = false;
  for (const candidate of VALID_PINS) {
    if (input.length === candidate.length) {
      if (timingSafeEqual(Buffer.from(input), Buffer.from(candidate))) {
        matched = true;
      }
    }
  }
  return matched;
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
