import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { ContactMessage } from "@/models";

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json().catch(() => ({}));
  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  await dbConnect();
  await ContactMessage.create({ name, email, subject, message });
  return NextResponse.json({ ok: true }, { status: 201 });
}
