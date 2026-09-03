import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Booking, Customer, Provider } from "@/models";
import { coversWindow, expandProviderSchedule } from "@/lib/schedule";

/** Customer books a sitter. Unlike the original, this validates the window
 *  against the provider's expanded availability and existing bookings. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "customer" || !session.customerId) {
    return NextResponse.json({ error: "Only customers can request bookings." }, { status: 403 });
  }

  const { providerId, date, startTime, endTime, serviceCategory } = await req.json().catch(() => ({}));
  if (!providerId || !date || !startTime || !endTime || !serviceCategory) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (startTime >= endTime) {
    return NextResponse.json({ error: "Start time must be before end time." }, { status: 400 });
  }
  if (date < dayjs().format("YYYY-MM-DD")) {
    return NextResponse.json({ error: "Booking date must not be in the past." }, { status: 400 });
  }

  await dbConnect();
  const [customer, provider] = await Promise.all([
    Customer.findById(session.customerId),
    Provider.findById(providerId),
  ]);
  if (!customer || !provider) {
    return NextResponse.json({ error: "Provider not found." }, { status: 404 });
  }

  const slots = await expandProviderSchedule(String(provider._id), date, date);
  if (!coversWindow(slots, date, startTime, endTime)) {
    return NextResponse.json(
      { error: "The sitter is not available for that time block." },
      { status: 409 },
    );
  }
  const clash = await Booking.exists({
    provider: provider._id,
    date,
    status: { $in: ["pending", "accepted"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });
  if (clash) {
    return NextResponse.json({ error: "The sitter already has a booking in that window." }, { status: 409 });
  }

  const booking = await Booking.create({
    customer: customer._id,
    provider: provider._id,
    neighborhood: customer.neighborhood,
    date,
    startTime,
    endTime,
    serviceCategory,
    status: "pending",
  });
  return NextResponse.json({ id: String(booking._id) }, { status: 201 });
}
