// app/api/admin/vendors/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";

export async function GET() {
  await dbConnect();

  // return vendors sorted by newest (createdAt desc)
  const vendors = await User.find({ accountType: "vendor" })
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, vendors });
}
