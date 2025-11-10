// app/api/admin/customers/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";

export async function GET() {
  await dbConnect();

  const users = await User.find({ accountType: "user" }).sort({ createdAt: -1 });

  return NextResponse.json({ success: true, users });
}
