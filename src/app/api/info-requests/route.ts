import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { InfoRequest } from "@/models";

export async function POST(req: NextRequest) {
  const { email, neighborhoodName, city, zip, state, comments } = await req.json().catch(() => ({}));
  if (!email || !neighborhoodName || !city || !zip || !state) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  await dbConnect();
  const doc = await InfoRequest.create({
    email,
    neighborhoodName,
    city,
    zip,
    stateCode: String(state).toUpperCase().slice(0, 2),
    comments: comments ?? "",
  });
  return NextResponse.json({ id: String(doc._id) }, { status: 201 });
}
