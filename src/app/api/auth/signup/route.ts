import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { dbConnect } from "@/lib/db";
import { Customer, Neighborhood, Provider, User } from "@/models";
import { EMAIL_RE, passwordErrors } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { role, email, firstName, lastName, password, birthday, streetAddress, city, zip, neighborhoodId } = body;

  if (!["customer", "provider"].includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  if (!email || !firstName || !lastName || !password || !neighborhoodId) {
    return NextResponse.json({ error: "Not all fields filled." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email provided is not valid. Must include an @." }, { status: 400 });
  }
  const pwErrors = passwordErrors(password);
  if (pwErrors.length > 0) {
    return NextResponse.json({ error: pwErrors.join(" ") }, { status: 400 });
  }
  if (role === "provider") {
    if (!birthday || dayjs().diff(birthday, "year") < 13) {
      return NextResponse.json({ error: "Sorry. You must be at least 13 to be a provider." }, { status: 400 });
    }
  }

  await dbConnect();
  const neighborhood = await Neighborhood.findById(neighborhoodId);
  if (!neighborhood) {
    return NextResponse.json({ error: "Neighborhood not found." }, { status: 404 });
  }
  if (await User.exists({ email: String(email).toLowerCase() })) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const user = await User.create({
    email: String(email).toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    firstName,
    lastName,
    role,
    emailConfirmed: false,
  });

  try {
    const base = {
      user: user._id,
      neighborhood: neighborhood._id,
      streetAddress: streetAddress || "",
      city: city || neighborhood.city,
      zip: zip || neighborhood.zip,
      status: "pending" as const,
    };
    if (role === "provider") {
      await Provider.create({
        ...base,
        birthday,
        startDate: dayjs().format("YYYY-MM-DD"),
        rates: [],
      });
    } else {
      await Customer.create(base);
    }
  } catch (err) {
    // Compensating rollback, mirroring the original's behavior.
    await User.deleteOne({ _id: user._id });
    throw err;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
