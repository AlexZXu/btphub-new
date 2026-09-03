import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Booking } from "@/models";

const ACTIONS: Record<string, "accepted" | "denied" | "cancelled"> = {
  accept: "accepted",
  deny: "denied",
  cancel: "cancelled",
};

/** Provider accepts/denies; either side cancels — with ownership checks the
 *  original lacked. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const { action } = await req.json().catch(() => ({}));
  const status = ACTIONS[action];
  if (!status) return NextResponse.json({ error: "Unknown action." }, { status: 400 });

  await dbConnect();
  const booking = await Booking.findById(id);
  if (!booking) return NextResponse.json({ error: `Booking ${id} not found` }, { status: 404 });

  const isProviderOwner = session.providerId && String(booking.provider) === session.providerId;
  const isCustomerOwner = session.customerId && String(booking.customer) === session.customerId;

  if ((action === "accept" || action === "deny") && !isProviderOwner) {
    return NextResponse.json({ error: "Only the sitter can accept or deny." }, { status: 403 });
  }
  if (action === "cancel" && !isProviderOwner && !isCustomerOwner) {
    return NextResponse.json({ error: "Not your booking." }, { status: 403 });
  }
  if ((action === "accept" || action === "deny") && booking.status !== "pending") {
    return NextResponse.json({ error: "Booking is no longer pending." }, { status: 409 });
  }

  booking.status = status;
  await booking.save();
  return NextResponse.json({ ok: true, status });
}
