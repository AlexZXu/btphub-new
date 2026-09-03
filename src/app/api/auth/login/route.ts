import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { Customer, Provider, User } from "@/models";
import { SessionUser, setAuthCookies } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  await dbConnect();
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const session: SessionUser = {
    userId: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
  if (user.role === "customer") {
    const customer = await Customer.findOne({ user: user._id });
    if (customer) {
      session.customerId = String(customer._id);
      session.neighborhoodId = String(customer.neighborhood);
    }
  } else if (user.role === "provider") {
    const provider = await Provider.findOne({ user: user._id });
    if (provider) {
      session.providerId = String(provider._id);
      session.neighborhoodId = String(provider.neighborhood);
    }
  }

  await setAuthCookies(session);
  return NextResponse.json({ role: user.role });
}
