import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Customer, Neighborhood, Provider } from "@/models";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "admin") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  await dbConnect();
  const update: Record<string, unknown> = {};
  for (const key of ["name", "city", "stateCode", "zip", "fee"]) {
    if (body[key] !== undefined) update[key] = body[key];
  }
  const doc = await Neighborhood.findByIdAndUpdate(id, { $set: update });
  if (!doc) return NextResponse.json({ error: "Neighborhood not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "admin") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id } = await ctx.params;
  await dbConnect();
  const members = await Promise.all([
    Customer.exists({ neighborhood: id }),
    Provider.exists({ neighborhood: id }),
  ]);
  if (members.some(Boolean)) {
    return NextResponse.json(
      { error: "Neighborhood still has members and cannot be deleted." },
      { status: 409 },
    );
  }
  const doc = await Neighborhood.findByIdAndDelete(id);
  if (!doc) return NextResponse.json({ error: "Neighborhood not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
