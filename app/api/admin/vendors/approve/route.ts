// app/api/admin/vendor/approve/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { vendorId, status } = await req.json();
    await dbConnect();

    const updated = await User.findByIdAndUpdate(
      vendorId,
      { isVendorApproved: status },
      { new: true }
    );

    return NextResponse.json({ success: true, vendor: updated });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
