// app/api/admin/vendors/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // Single vendor lookup (used by vendor page polling)
  if (id) {
    const vendor = await User.findById(id).select(
      "isVendorApproved vendorServices fullName email contactNumber createdAt accountType"
    );
    return NextResponse.json({ success: !!vendor, vendor: vendor || null });
  }

  // Full list
  const vendors = await User.find({ accountType: "vendor" }).select(
    "fullName email contactNumber vendorServices isVendorApproved createdAt"
  );

  return NextResponse.json({ success: true, vendors });
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { vendorId, action } = body;

  const vendor = await User.findById(vendorId);
  if (!vendor) {
    return NextResponse.json(
      { success: false, message: "Vendor not found" },
      { status: 404 }
    );
  }

  if (action === "accept") vendor.isVendorApproved = true;
  if (action === "reject") vendor.isVendorApproved = false;

  await vendor.save();

  // return the updated vendor document
  const updatedVendor = await User.findById(vendorId).select(
    "_id fullName email contactNumber vendorServices isVendorApproved createdAt accountType"
  );

  return NextResponse.json({ success: true, vendor: updatedVendor });
}
