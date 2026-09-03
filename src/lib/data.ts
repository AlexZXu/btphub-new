import { cache } from "react";
import dayjs from "dayjs";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  Booking,
  Customer,
  IBooking,
  ICustomer,
  INeighborhood,
  IProvider,
  IState,
  IUser,
  Neighborhood,
  Provider,
  State,
  Availability,
  IAvailability,
  InfoRequest,
  IInfoRequest,
} from "@/models";
import { shortenName } from "@/lib/format";
import { expandProviderSchedule } from "@/lib/schedule";
import type { CalEvent } from "@/components/CalendarMonth";

export type BookingScope = "upcoming" | "past" | "pending" | "cancelled";

export interface BookingRow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: IBooking["status"];
  serviceCategory: string;
  customerName: string;
  providerName: string;
  providerId: string;
}

export interface NeighborhoodRow {
  id: string;
  name: string;
  city: string;
  stateCode: string;
  zip: string;
  fee: number;
  memberCount: number;
  providerCount: number;
}

export interface ProviderCard {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  bio: string;
  startDate: string;
  rates: { serviceType: string; rate: number }[];
  askRate: number;
}

/** Session plus the caller's customer/provider documents, deduped per request. */
export const getViewer = cache(async () => {
  // Read cookies first: it opts the route into dynamic rendering before any
  // database work happens (which would fail during `next build`).
  const session = await getSession();
  if (!session) return null;
  await dbConnect();
  const [customer, provider] = await Promise.all([
    session.role === "customer"
      ? Customer.findOne({ user: session.userId }).populate<{ neighborhood: INeighborhood }>("neighborhood").lean()
      : null,
    session.role === "provider"
      ? Provider.findOne({ user: session.userId }).populate<{ neighborhood: INeighborhood }>("neighborhood").lean()
      : null,
  ]);
  return { session, customer, provider };
});

function scopeFilter(scope: BookingScope): Record<string, unknown> {
  const today = dayjs().format("YYYY-MM-DD");
  switch (scope) {
    case "upcoming":
      return { status: "accepted", date: { $gte: today } };
    case "past":
      return { status: "accepted", date: { $lt: today } };
    case "pending":
      return { status: "pending" };
    case "cancelled":
      return { status: "cancelled" };
  }
}

type PopulatedBooking = Omit<IBooking, "customer" | "provider"> & {
  customer: ICustomer & { user: IUser };
  provider: IProvider & { user: IUser };
};

function toRow(b: PopulatedBooking): BookingRow {
  return {
    id: String(b._id),
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime,
    status: b.status,
    serviceCategory: b.serviceCategory,
    customerName: shortenName(b.customer.user.firstName, b.customer.user.lastName),
    providerName: shortenName(b.provider.user.firstName, b.provider.user.lastName),
    providerId: String(b.provider._id),
  };
}

async function queryBookings(filter: Record<string, unknown>): Promise<BookingRow[]> {
  await dbConnect();
  const rows = (await Booking.find(filter)
    .sort({ date: 1, startTime: 1 })
    .populate({ path: "customer", populate: { path: "user" } })
    .populate({ path: "provider", populate: { path: "user" } })
    .lean()) as unknown as PopulatedBooking[];
  return rows.map(toRow);
}

export async function getCustomerBookings(customerId: string, scope: BookingScope) {
  return queryBookings({ customer: customerId, ...scopeFilter(scope) });
}

export async function getProviderBookings(providerId: string, scope: BookingScope) {
  return queryBookings({ provider: providerId, ...scopeFilter(scope) });
}

export const listNeighborhoods = cache(async (): Promise<NeighborhoodRow[]> => {
  await dbConnect();
  const [nbhs, customerCounts, providerCounts] = await Promise.all([
    Neighborhood.find().sort({ name: 1 }).lean<INeighborhood[]>(),
    Customer.aggregate<{ _id: unknown; n: number }>([{ $group: { _id: "$neighborhood", n: { $sum: 1 } } }]),
    Provider.aggregate<{ _id: unknown; n: number }>([{ $group: { _id: "$neighborhood", n: { $sum: 1 } } }]),
  ]);
  const cc = new Map(customerCounts.map((c) => [String(c._id), c.n]));
  const pc = new Map(providerCounts.map((c) => [String(c._id), c.n]));
  return nbhs.map((n) => ({
    id: String(n._id),
    name: n.name,
    city: n.city,
    stateCode: n.stateCode,
    zip: n.zip,
    fee: n.fee,
    memberCount: (cc.get(String(n._id)) ?? 0) + (pc.get(String(n._id)) ?? 0),
    providerCount: pc.get(String(n._id)) ?? 0,
  }));
});

export const listStates = cache(async (): Promise<IState[]> => {
  await dbConnect();
  return State.find().sort({ code: 1 }).lean<IState[]>();
});

/** Active sitters in a neighborhood, for the find-a-babysitter roster. */
export async function getProviderRoster(neighborhoodId: string): Promise<ProviderCard[]> {
  await dbConnect();
  const rows = (await Provider.find({ neighborhood: neighborhoodId, status: "active" })
    .populate("user")
    .lean()) as unknown as (IProvider & { user: IUser })[];
  return rows
    .map((p) => ({
      id: String(p._id),
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      age: dayjs().diff(p.birthday, "year"),
      bio: p.bio,
      startDate: p.startDate,
      rates: (p.rates ?? []).map((r) => ({ serviceType: r.serviceType, rate: r.rate })),
      askRate: p.rates?.find((r) => r.serviceType === "1 Kid")?.rate ?? p.rates?.[0]?.rate ?? 0,
    }))
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
}

export interface AvailabilityRow {
  id: string;
  kind: IAvailability["kind"];
  weekday?: number;
  repeats?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  startTime: string;
  endTime: string;
}

export async function getAvailabilityRules(providerId: string): Promise<AvailabilityRow[]> {
  await dbConnect();
  const rules = await Availability.find({ provider: providerId }).lean<IAvailability[]>();
  return rules.map((r) => ({
    id: String(r._id),
    kind: r.kind,
    weekday: r.weekday,
    repeats: r.repeats,
    startDate: r.startDate,
    endDate: r.endDate,
    date: r.date,
    startTime: r.startTime,
    endTime: r.endTime,
  }));
}

export interface AdminProviderRow {
  id: string;
  name: string;
  email: string;
  streetAddress: string;
  neighborhoodName: string;
  neighborhoodZip: string;
  neighborhoodState: string;
  status: string;
}

export async function listProvidersAdmin(): Promise<AdminProviderRow[]> {
  await dbConnect();
  const rows = (await Provider.find()
    .populate("user")
    .populate("neighborhood")
    .lean()) as unknown as (IProvider & { user: IUser; neighborhood: INeighborhood })[];
  return rows.map((p) => ({
    id: String(p._id),
    name: `${p.user.firstName} ${p.user.lastName}`,
    email: p.user.email,
    streetAddress: p.streetAddress,
    neighborhoodName: p.neighborhood?.name ?? "—",
    neighborhoodZip: p.neighborhood?.zip ?? "",
    neighborhoodState: p.neighborhood?.stateCode ?? "",
    status: p.status,
  }));
}

/**
 * Calendar events for a dashboard/schedule view, covering a wide month range
 * so client-side month navigation needs no refetch. Providers see their
 * availabilities (green) plus confirmed bookings (pink); customers see their
 * confirmed bookings.
 */
export async function getCalendarEvents(
  viewer: "customer" | "provider",
  id: string,
): Promise<CalEvent[]> {
  await dbConnect();
  const from = dayjs().subtract(3, "month").startOf("month").format("YYYY-MM-DD");
  const to = dayjs().add(4, "month").endOf("month").format("YYYY-MM-DD");
  const events: CalEvent[] = [];

  const bookings = await queryBookings({
    [viewer]: id,
    status: "accepted",
    date: { $gte: from, $lte: to },
  });
  for (const b of bookings) {
    events.push({
      id: `b-${b.id}`,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      type: "booking",
      label: viewer === "provider" ? b.customerName : b.providerName,
    });
  }

  if (viewer === "provider") {
    const slots = await expandProviderSchedule(id, from, to);
    for (const s of slots) {
      events.push({
        id: `a-${s.availabilityId}-${s.date}`,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        type: "availability",
        kind: s.kind,
        ruleId: s.availabilityId,
      });
    }
  }
  return events;
}

export async function listInfoRequests(status?: "pending" | "processed"): Promise<
  (Omit<IInfoRequest, "_id"> & { id: string })[]
> {
  await dbConnect();
  const rows = await InfoRequest.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .lean<IInfoRequest[]>();
  return rows.map((r) => ({ ...r, id: String(r._id) }));
}
