import { NextRequest, NextResponse } from "next/server";

// The original emailed an Identity reset link; without an SMTP setup this
// endpoint intentionally accepts the request and reveals nothing about
// whether the account exists.
export async function POST(req: NextRequest) {
  await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true });
}
