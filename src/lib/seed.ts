import bcrypt from "bcryptjs";
import {
  User,
  State,
  Neighborhood,
  Customer,
  Provider,
  Availability,
  Booking,
  InfoRequest,
} from "@/models";

const DEMO_PASSWORD = "Neighbor1!";

/** Seed demo data on first run against an empty database. */
export async function seedIfEmpty(): Promise<void> {
  if (await User.exists({})) return;

  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  await State.insertMany([
    { code: "GA", name: "Georgia", minHourlyWage: 7.25 },
    { code: "CA", name: "California", minHourlyWage: 16.5 },
    { code: "NY", name: "New York", minHourlyWage: 16.0 },
    { code: "TX", name: "Texas", minHourlyWage: 7.25 },
    { code: "WA", name: "Washington", minHourlyWage: 16.28 },
    { code: "MA", name: "Massachusetts", minHourlyWage: 15.0 },
    { code: "CO", name: "Colorado", minHourlyWage: 14.81 },
  ]);

  // Intown Atlanta neighborhoods from the City of Atlanta's official
  // neighborhood dataset (244 total; this is the well-known subset).
  const nbhs = await Neighborhood.insertMany([
    { name: "Virginia-Highland", city: "Atlanta", stateCode: "GA", zip: "30306" },
    { name: "Morningside/Lenox Park", city: "Atlanta", stateCode: "GA", zip: "30306" },
    { name: "Poncey-Highland", city: "Atlanta", stateCode: "GA", zip: "30306" },
    { name: "Inman Park", city: "Atlanta", stateCode: "GA", zip: "30307" },
    { name: "Candler Park", city: "Atlanta", stateCode: "GA", zip: "30307" },
    { name: "Lake Claire", city: "Atlanta", stateCode: "GA", zip: "30307" },
    { name: "Edgewood", city: "Atlanta", stateCode: "GA", zip: "30307" },
    { name: "Kirkwood", city: "Atlanta", stateCode: "GA", zip: "30317" },
    { name: "East Atlanta", city: "Atlanta", stateCode: "GA", zip: "30316" },
    { name: "Ormewood Park", city: "Atlanta", stateCode: "GA", zip: "30316" },
    { name: "Reynoldstown", city: "Atlanta", stateCode: "GA", zip: "30316" },
    { name: "Grant Park", city: "Atlanta", stateCode: "GA", zip: "30312" },
    { name: "Cabbagetown", city: "Atlanta", stateCode: "GA", zip: "30312" },
    { name: "Sweet Auburn", city: "Atlanta", stateCode: "GA", zip: "30312" },
    { name: "Old Fourth Ward", city: "Atlanta", stateCode: "GA", zip: "30308" },
    { name: "Midtown", city: "Atlanta", stateCode: "GA", zip: "30309" },
    { name: "Ansley Park", city: "Atlanta", stateCode: "GA", zip: "30309" },
    { name: "Piedmont Heights", city: "Atlanta", stateCode: "GA", zip: "30324" },
    { name: "Atlantic Station", city: "Atlanta", stateCode: "GA", zip: "30363" },
    { name: "Home Park", city: "Atlanta", stateCode: "GA", zip: "30318" },
    { name: "Berkeley Park", city: "Atlanta", stateCode: "GA", zip: "30318" },
    { name: "Underwood Hills", city: "Atlanta", stateCode: "GA", zip: "30318" },
    { name: "Castleberry Hill", city: "Atlanta", stateCode: "GA", zip: "30313" },
    { name: "West End", city: "Atlanta", stateCode: "GA", zip: "30310" },
    { name: "Adair Park", city: "Atlanta", stateCode: "GA", zip: "30310" },
    { name: "Westview", city: "Atlanta", stateCode: "GA", zip: "30310" },
    { name: "Sylvan Hills", city: "Atlanta", stateCode: "GA", zip: "30310" },
    { name: "Garden Hills", city: "Atlanta", stateCode: "GA", zip: "30305" },
    { name: "Peachtree Hills", city: "Atlanta", stateCode: "GA", zip: "30305" },
    { name: "North Buckhead", city: "Atlanta", stateCode: "GA", zip: "30342" },
    { name: "Chastain Park", city: "Atlanta", stateCode: "GA", zip: "30327" },
    { name: "Summerhill", city: "Atlanta", stateCode: "GA", zip: "30315" },
  ]);
  const homeNbh = nbhs[0]; // Virginia-Highland — the demo cast's neighborhood

  await User.create({
    email: "admin@btphub.com",
    passwordHash: hash,
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    emailConfirmed: true,
  });

  async function mkCustomer(first: string, last: string, street: string) {
    const user = await User.create({
      email: `${first}.${last}@email.com`.toLowerCase().replace(/ /g, ""),
      passwordHash: hash,
      firstName: first,
      lastName: last,
      role: "customer",
      emailConfirmed: true,
    });
    return Customer.create({
      user: user._id,
      neighborhood: homeNbh._id,
      streetAddress: street,
      city: "Atlanta",
      zip: "30306",
      status: "active",
    });
  }

  async function mkProvider(
    first: string,
    last: string,
    street: string,
    birthday: string,
    bio: string,
    rates: { serviceType: string; rate: number }[],
    email?: string,
  ) {
    const user = await User.create({
      email: email ?? `${first}.${last}@email.com`.toLowerCase().replace(/ /g, ""),
      passwordHash: hash,
      firstName: first,
      lastName: last,
      role: "provider",
      emailConfirmed: true,
    });
    return Provider.create({
      user: user._id,
      neighborhood: homeNbh._id,
      streetAddress: street,
      city: "Atlanta",
      zip: "30306",
      birthday,
      bio,
      phone: "(404) 555-0142",
      startDate: "2024-03-02",
      status: "active",
      rates,
    });
  }

  // Customers
  const alex = await mkCustomer("Alex", "Xu", "742 Virginia Ave NE");
  const maya = await mkCustomer("Maya", "Rodriguez", "120 St. Charles Ave NE");
  const lucy = await mkCustomer("Lucy", "Park", "455 Amsterdam Ave NE");
  const nick = await mkCustomer("Nick", "Smith", "89 Greenwood Ave NE");
  const ethan = await mkCustomer("Ethan", "King", "310 Barnett St NE");
  const avaM = await mkCustomer("Ava", "Miller", "17 Rosedale Rd NE");
  const leo = await mkCustomer("Leo", "Tran", "260 Ponce de Leon Pl NE");

  // Providers (ages match the find-a-babysitter list as of Sep 2026)
  const jake = await mkProvider(
    "Jake",
    "Thompson",
    "335 Drewry St NE",
    "2010-06-14",
    "Hi neighbors! I'm a junior at Midtown High School and I've been babysitting for families on our street for two years. CPR certified, happy to help with homework, and great with pets too.",
    [
      { serviceType: "1 Kid", rate: 15 },
      { serviceType: "2 Kids", rate: 18 },
      { serviceType: "1 Pet", rate: 8 },
    ],
  );
  const sofia = await mkProvider(
    "Sofia",
    "Martinez",
    "128 Los Angeles Ave NE",
    "2010-02-20",
    "Sophomore at Midtown High, weekend and evening sitter. I love arts and crafts and can help with Spanish homework.",
    [
      { serviceType: "1 Kid", rate: 15 },
      { serviceType: "2 Kids", rate: 18 },
    ],
  );
  const avaC = await mkProvider(
    "Ava",
    "Chen",
    "214 N Highland Ave NE",
    "2011-04-02",
    "Freshman who loves board games and baking with kids. Weekend afternoons are my specialty.",
    [
      { serviceType: "1 Kid", rate: 14 },
      { serviceType: "2 Kids", rate: 17 },
    ],
  );
  const liam = await mkProvider(
    "Liam",
    "Walker",
    "88 Lanier Blvd NE",
    "2010-09-30",
    "Soccer coach's assistant and experienced with energetic kids. Happy to walk to any home in the neighborhood.",
    [
      { serviceType: "1 Kid", rate: 16 },
      { serviceType: "2 Kids", rate: 19 },
    ],
  );
  const mia = await mkProvider(
    "Mia",
    "Patel",
    "512 Brookridge Dr NE",
    "2011-01-12",
    "Piano player and patient homework helper. Fridays after school work great for me.",
    [
      { serviceType: "1 Kid", rate: 14 },
      { serviceType: "2 Kids", rate: 16 },
    ],
  );
  const noah = await mkProvider(
    "Noah",
    "Kim",
    "77 Arcadia Ave NE",
    "2009-08-25",
    "Senior with three younger siblings — I've been on kid duty my whole life. First aid certified.",
    [
      { serviceType: "1 Kid", rate: 17 },
      { serviceType: "2 Kids", rate: 20 },
    ],
  );
  const emma = await mkProvider(
    "Emma",
    "Davis",
    "402 Hudson Dr NE",
    "2010-11-08",
    "Reliable Thursday-evening sitter. I bring my own craft kit and always leave the kitchen cleaner than I found it.",
    [
      { serviceType: "1 Kid", rate: 15 },
      { serviceType: "2 Kids", rate: 18 },
    ],
  );

  // Availability rules
  const avail = (
    provider: typeof jake,
    kind: "recurring" | "oneTime" | "exclusion",
    rest: Record<string, unknown>,
  ) => ({ provider: provider._id, kind, ...rest });

  await Availability.insertMany([
    // Jake — matches the reference designs
    avail(jake, "recurring", { weekday: 2, repeats: "weekly", startDate: "2026-09-01", endDate: "2026-12-15", startTime: "15:30", endTime: "18:00" }),
    avail(jake, "recurring", { weekday: 6, repeats: "weekly", startDate: "2026-09-05", endDate: "2026-12-19", startTime: "10:00", endTime: "13:00" }),
    avail(jake, "recurring", { weekday: 4, repeats: "weekly", startDate: "2026-10-01", endDate: "2026-11-26", startTime: "16:00", endTime: "19:00" }),
    avail(jake, "oneTime", { date: "2026-09-18", startTime: "17:00", endTime: "20:00" }),
    avail(jake, "exclusion", { date: "2026-11-24", startTime: "15:30", endTime: "18:00" }),
    // The rest of the roster, so Find a Babysitter has real matches
    avail(sofia, "recurring", { weekday: 1, repeats: "weekly", startDate: "2026-09-01", endDate: "2026-12-21", startTime: "16:00", endTime: "19:00" }),
    avail(sofia, "recurring", { weekday: 3, repeats: "weekly", startDate: "2026-09-02", endDate: "2026-12-16", startTime: "16:00", endTime: "19:00" }),
    avail(avaC, "recurring", { weekday: 6, repeats: "weekly", startDate: "2026-09-05", endDate: "2026-12-19", startTime: "09:00", endTime: "14:00" }),
    avail(avaC, "recurring", { weekday: 0, repeats: "weekly", startDate: "2026-09-06", endDate: "2026-12-20", startTime: "13:00", endTime: "17:00" }),
    avail(liam, "recurring", { weekday: 3, repeats: "weekly", startDate: "2026-09-02", endDate: "2026-12-16", startTime: "17:00", endTime: "20:00" }),
    avail(mia, "recurring", { weekday: 5, repeats: "weekly", startDate: "2026-09-04", endDate: "2026-12-18", startTime: "15:00", endTime: "19:00" }),
    avail(mia, "recurring", { weekday: 6, repeats: "weekly", startDate: "2026-09-05", endDate: "2026-12-19", startTime: "10:00", endTime: "14:00" }),
    avail(noah, "recurring", { weekday: 0, repeats: "weekly", startDate: "2026-09-06", endDate: "2026-12-20", startTime: "12:00", endTime: "18:00" }),
    avail(noah, "recurring", { weekday: 1, repeats: "weekly", startDate: "2026-09-07", endDate: "2026-12-14", startTime: "16:00", endTime: "18:30" }),
    avail(emma, "recurring", { weekday: 4, repeats: "weekly", startDate: "2026-09-03", endDate: "2026-12-17", startTime: "16:00", endTime: "20:00" }),
  ]);

  // Bookings
  type CustomerDoc = typeof alex;
  type ProviderDoc = typeof jake;
  const booking = (
    customer: CustomerDoc,
    provider: ProviderDoc,
    date: string,
    startTime: string,
    endTime: string,
    status: "pending" | "accepted" | "cancelled",
    serviceCategory = "1 Kid",
  ) => ({
    customer: customer._id,
    provider: provider._id,
    neighborhood: homeNbh._id,
    date,
    startTime,
    endTime,
    status,
    serviceCategory,
  });

  await Booking.insertMany([
    // Alex's month (customer view)
    booking(alex, sofia, "2026-09-09", "16:00", "18:00", "accepted"),
    booking(alex, mia, "2026-09-12", "11:00", "14:00", "accepted", "2 Kids"),
    booking(alex, jake, "2026-09-18", "17:00", "20:00", "accepted"),
    booking(alex, noah, "2026-09-21", "16:00", "18:30", "accepted"),
    booking(alex, liam, "2026-09-23", "17:00", "19:30", "accepted"),
    booking(alex, avaC, "2026-09-27", "14:00", "17:00", "accepted", "2 Kids"),
    booking(alex, liam, "2026-09-30", "18:00", "21:00", "pending"),
    booking(alex, avaC, "2026-08-22", "13:00", "16:00", "accepted"),
    booking(alex, sofia, "2026-08-11", "15:30", "18:00", "accepted"),
    booking(alex, mia, "2026-08-06", "17:00", "19:00", "accepted"),
    booking(alex, noah, "2026-08-30", "12:00", "15:00", "cancelled"),
    // Jake's month (provider view)
    booking(maya, jake, "2026-09-09", "16:00", "18:00", "accepted"),
    booking(nick, jake, "2026-09-22", "16:00", "18:00", "accepted"),
    booking(avaM, jake, "2026-09-26", "10:00", "13:00", "accepted", "2 Kids"),
    booking(leo, jake, "2026-09-29", "15:30", "18:00", "accepted"),
    booking(ethan, jake, "2026-09-27", "14:00", "17:00", "pending"),
    booking(maya, jake, "2026-09-30", "18:00", "21:00", "pending"),
    booking(nick, jake, "2026-10-03", "09:00", "12:00", "pending"),
    booking(lucy, jake, "2026-10-04", "13:00", "16:00", "pending", "2 Kids"),
    booking(nick, jake, "2026-08-22", "13:00", "16:00", "accepted"),
    booking(maya, jake, "2026-08-11", "15:30", "18:00", "accepted"),
    booking(lucy, jake, "2026-08-28", "17:00", "20:00", "cancelled"),
  ]);

  await InfoRequest.insertMany([
    { email: "sarah.lin@email.com", neighborhoodName: "Oakhurst", city: "Decatur", stateCode: "GA", zip: "30030", comments: "Lots of young families here, would love to join!" },
    { email: "d.okafor@email.com", neighborhoodName: "Winnona Park", city: "Decatur", stateCode: "GA", zip: "30030", comments: "Requested by our HOA board." },
    { email: "m.gupta@email.com", neighborhoodName: "Druid Hills", city: "Atlanta", stateCode: "GA", zip: "30307", comments: "Several families near the high school are interested." },
    { email: "j.nguyen@email.com", neighborhoodName: "Oak Grove", city: "East Point", stateCode: "GA", zip: "30344", comments: "Referred by a Virginia-Highland member." },
  ]);

  console.log(
    `[seed] demo data created — log in as alex.xu@email.com / jake.thompson@email.com / admin@btphub.com (password: ${DEMO_PASSWORD})`,
  );
}
