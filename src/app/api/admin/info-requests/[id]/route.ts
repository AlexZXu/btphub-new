import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { InfoRequest, Neighborhood } from "@/models";

/** Approve (creates the neighborhood) or deny a neighborhood request. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "admin") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id } = await ctx.params;
  const { action } = await req.json().catch(() => ({}));
  if (!["approve", "deny"].includes(action)) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  await dbConnect();
  const request = await InfoRequest.findById(id);
  if (!request) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  if (request.status === "processed") {
    return NextResponse.json({ error: "Request already processed." }, { status: 409 });
  }

  if (action === "approve" && !(await Neighborhood.exists({ name: request.neighborhoodName, zip: request.zip }))) {
    await Neighborhood.create({
      name: request.neighborhoodName,
      city: request.city,
      stateCode: request.stateCode,
      zip: request.zip,
    });
  }
  request.status = "processed";
  await request.save();
  return NextResponse.json({ ok: true });
}
