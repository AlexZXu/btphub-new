import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Availability } from "@/models";

async function ownedRule(id: string, providerId: string | undefined) {
  if (!providerId) return null;
  await dbConnect();
  const rule = await Availability.findById(id);
  if (!rule || String(rule.provider) !== providerId) return null;
  return rule;
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await ctx.params;
  const rule = await ownedRule(id, session?.providerId);
  if (!rule) return NextResponse.json({ error: "Availability not found." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (body.startTime && body.endTime && body.startTime >= body.endTime) {
    return NextResponse.json({ error: "Start time must be before end time." }, { status: 400 });
  }
  for (const key of ["weekday", "repeats", "startDate", "endDate", "date", "startTime", "endTime"] as const) {
    if (body[key] !== undefined) {
      // @ts-expect-error dynamic assignment over a narrow union of fields
      rule[key] = body[key];
    }
  }
  await rule.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await ctx.params;
  const rule = await ownedRule(id, session?.providerId);
  if (!rule) return NextResponse.json({ error: "Availability not found." }, { status: 404 });
  await rule.deleteOne();
  return NextResponse.json({ ok: true });
}
