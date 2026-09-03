import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { State } from "@/models";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const session = await getSession();
  if (session?.role !== "admin") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { code } = await ctx.params;
  const { minHourlyWage } = await req.json().catch(() => ({}));
  const wage = parseFloat(minHourlyWage);
  if (!Number.isFinite(wage) || wage < 0) {
    return NextResponse.json({ error: "Invalid minimum wage." }, { status: 400 });
  }
  await dbConnect();
  const doc = await State.findOneAndUpdate(
    { code: code.toUpperCase() },
    { $set: { minHourlyWage: wage } },
  );
  if (!doc) return NextResponse.json({ error: "State not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
