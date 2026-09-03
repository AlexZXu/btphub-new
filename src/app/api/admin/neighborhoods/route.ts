import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Neighborhood } from "@/models";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "admin") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { name, city, stateCode, zip } = await req.json().catch(() => ({}));
  if (!name || !city || !stateCode || !zip) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  await dbConnect();
  if (await Neighborhood.exists({ name, zip })) {
    return NextResponse.json({ error: "Already exists!" }, { status: 409 });
  }
  const doc = await Neighborhood.create({ name, city, stateCode: String(stateCode).toUpperCase(), zip });
  return NextResponse.json({ id: String(doc._id) }, { status: 201 });
}
