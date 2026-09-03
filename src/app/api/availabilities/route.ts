import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Availability } from "@/models";

function validate(body: Record<string, unknown>): string | null {
  const { kind, weekday, startDate, endDate, date, startTime, endTime } = body;
  if (!["recurring", "oneTime", "exclusion"].includes(String(kind))) return "Unknown availability type.";
  if (!startTime || !endTime || String(startTime) >= String(endTime))
    return "Start time must be before end time.";
  if (kind === "recurring") {
    if (weekday === undefined || weekday === null) return "Weekday is required.";
    if (!startDate || !endDate || String(startDate) > String(endDate))
      return "Period of year is invalid.";
  } else if (!date) {
    return "Date is required.";
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.providerId) {
    return NextResponse.json({ error: "Only sitters manage availabilities." }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const error = validate(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  await dbConnect();
  const doc = await Availability.create({
    provider: session.providerId,
    kind: body.kind,
    weekday: body.kind === "recurring" ? Number(body.weekday) : undefined,
    repeats: body.kind === "recurring" ? (body.repeats === "biweekly" ? "biweekly" : "weekly") : undefined,
    startDate: body.kind === "recurring" ? body.startDate : undefined,
    endDate: body.kind === "recurring" ? body.endDate : undefined,
    date: body.kind === "recurring" ? undefined : body.date,
    startTime: body.startTime,
    endTime: body.endTime,
  });
  return NextResponse.json({ id: String(doc._id) }, { status: 201 });
}
