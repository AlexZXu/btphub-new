import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Provider } from "@/models";
import { SERVICE_TYPES } from "@/lib/constants";

/** Provider updates their own rate card (the original wrote provider id 1). */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.providerId) {
    return NextResponse.json({ error: "Only sitters manage rates." }, { status: 403 });
  }
  const { rates } = await req.json().catch(() => ({}));
  if (!Array.isArray(rates)) {
    return NextResponse.json({ error: "Rates are required." }, { status: 400 });
  }
  const clean = rates
    .filter(
      (r) =>
        r &&
        SERVICE_TYPES.includes(r.serviceType) &&
        typeof r.rate === "number" &&
        r.rate >= 0 &&
        r.rate < 1000,
    )
    .map((r) => ({ serviceType: r.serviceType as string, rate: r.rate as number }));

  await dbConnect();
  await Provider.updateOne({ _id: session.providerId }, { $set: { rates: clean } });
  return NextResponse.json({ ok: true });
}
