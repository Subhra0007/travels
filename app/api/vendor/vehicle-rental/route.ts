// app/api/vendor/vehicle-rentals/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import VehicleRental from "@/models/VehicleRental";
import { auth } from "@/lib/middlewares/auth";
import mongoose from "mongoose";
import User from "@/models/User";
import jwt from "jsonwebtoken";

// GET - Fetch vehicle rentals (vendor-specific or all for admin)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const category = searchParams.get("category");
    const all = searchParams.get("all") === "true"; // For admin/public

    // Determine role
    let accountType: string | null = null;
    try {
      const token = req.cookies.get("token")?.value;
      if (token && process.env.JWT_SECRET) {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
        accountType = decoded?.accountType || null;
      }
    } catch {}

    // Enforce lock for vendor self-requests
    if (vendorId && !all) {
      try {
        const token = req.cookies.get("token")?.value;
        if (token && process.env.JWT_SECRET) {
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded?.accountType === "vendor" && (decoded?.id === vendorId || decoded?._id === vendorId)) {
            const vendorUser = await User.findById(vendorId).select("isVendorLocked");
            if (vendorUser?.isVendorLocked) {
              return NextResponse.json(
                { success: false, message: "Vendor account is locked" },
                { status: 403 }
              );
            }
          }
        }
      } catch {}
    }

    let query: any = {};

    // Filter by vendor if provided (always honor vendorId when present)
    if (vendorId) {
      if (mongoose.Types.ObjectId.isValid(vendorId)) {
        query.vendorId = new mongoose.Types.ObjectId(vendorId);
      } else {
        query.vendorId = vendorId;
      }
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Only show active rentals unless admin
    if (!all) {
      query.isActive = true;
    }

    // Public all=true without a specific vendor: exclude locked or unapproved vendors unless admin
    if (all && accountType !== "admin" && !vendorId) {
      const allowedVendors = await User.find({ accountType: "vendor", isVendorApproved: true, isVendorLocked: false }).select("_id");
      const allowedIds = allowedVendors.map((v) => v._id);
      query.vendorId = { $in: allowedIds };
    }

    const rentals = await VehicleRental.find(query)
      .populate("vendorId", "fullName email contactNumber")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, rentals });
  } catch (error: any) {
    console.error("Error fetching vehicle rentals:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch vehicle rentals" },
      { status: 500 }
    );
  }
}

// POST - Create a new vehicle rental
export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;

    // Only vendors can create
    if (user.accountType !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Only vendors can create vehicle rentals" },
        { status: 403 }
      );
    }

    const vendorId = user.id;

    const {
      name,
      category,
      location,
      heroHighlights = [],
      curatedHighlights = [],
      images,
      gallery = [],
      videos = {},
      popularFacilities = [],
      amenities = {},
      tags = [],
      options,
      about,
      checkInOutRules,
      vendorMessage = "",
      defaultCancellationPolicy = "",
      defaultHouseRules = [],
    } = body;

    // Required fields
    if (!name || !category || !location || !Array.isArray(images) || images.length < 5) {
      return NextResponse.json(
        { success: false, message: "Missing required fields or insufficient images" },
        { status: 400 }
      );
    }

    if (!["cars-rental", "bikes-rentals"].includes(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid category" },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please add at least one vehicle option" },
        { status: 400 }
      );
    }

    // Validate each option
    for (const option of options) {
      const availabilityValue = option?.available ?? option?.inventory ?? 1;
      if (
        !option?.model ||
        !option?.type ||
        typeof option?.pricePerDay !== "number" ||
        !Number.isFinite(option.pricePerDay) ||
        !Number.isFinite(Number(availabilityValue)) ||
        !Array.isArray(option?.images) ||
        option.images.length < 3
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Every vehicle option must include model, type, pricePerDay, availability and at least 3 images",
          },
          { status: 400 }
        );
      }
    }

    // Normalize options
    const normalizedOptions = options.map((option: any) => ({
      model: option.model.trim(),
      description: option.description ?? "",
      type: option.type.trim(),
      pricePerDay: Number(option.pricePerDay),
      taxes: option.taxes != null ? Number(option.taxes) : 0,
      currency: typeof option.currency === "string" && option.currency.trim().length ? option.currency : "INR",
      features: Array.isArray(option.features) ? option.features : [],
      amenities: Array.isArray(option.amenities) ? option.amenities : [],
      available: Number(option.available ?? option.inventory ?? 1),
      isRefundable: option.isRefundable !== undefined ? Boolean(option.isRefundable) : true,
      refundableUntilHours:
        option.refundableUntilHours !== undefined ? Number(option.refundableUntilHours) : 48,
      images: option.images,
    }));

    // Normalize videos
    const normalizedVideos = {
      inside: Array.isArray(videos?.inside) ? videos.inside : [],
      outside: Array.isArray(videos?.outside) ? videos.outside : [],
    };

    // Normalize amenities
    const normalizedAmenities: Record<string, string[]> = {};
    if (amenities && typeof amenities === "object") {
      Object.entries(amenities).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length) {
          normalizedAmenities[key] = value;
        }
      });
    }

    // Normalize tags
    const normalizedTags = Array.isArray(tags)
      ? tags
          .filter((tag: any) => typeof tag === "string" && tag.trim().length)
          .map((tag: string) => tag.trim())
      : [];

    // Normalize curated highlights
    const normalizedCuratedHighlights = Array.isArray(curatedHighlights)
      ? curatedHighlights
          .filter((item: any) => item && typeof item.title === "string" && item.title.trim().length)
          .map((item: any) => ({
            title: item.title.trim(),
            description:
              typeof item.description === "string" && item.description.trim().length
                ? item.description.trim()
                : undefined,
            icon:
              typeof item.icon === "string" && item.icon.trim().length
                ? item.icon.trim()
                : undefined,
          }))
      : [];

    // Normalize check-in/out rules
    const normalizedCheckInOutRules = {
      pickup: checkInOutRules?.pickup?.trim() || "",
      dropoff: checkInOutRules?.dropoff?.trim() || "",
      rules: Array.isArray(checkInOutRules?.rules)
        ? checkInOutRules.rules.filter((r: any) => typeof r === "string" && r.trim().length)
        : [],
    };

    if (!normalizedCheckInOutRules.pickup || !normalizedCheckInOutRules.dropoff) {
      return NextResponse.json(
        { success: false, message: "Pickup and dropoff times are required" },
        { status: 400 }
      );
    }

    // Create rental
    const rental = await VehicleRental.create({
      vendorId,
      name: name.trim(),
      category,
      location,
      images,
      gallery,
      heroHighlights,
      curatedHighlights: normalizedCuratedHighlights,
      tags: normalizedTags,
      videos: normalizedVideos,
      popularFacilities,
      amenities: normalizedAmenities,
      options: normalizedOptions,
      about,
      checkInOutRules: normalizedCheckInOutRules,
      vendorMessage: vendorMessage.trim(),
      defaultCancellationPolicy: defaultCancellationPolicy.trim(),
      defaultHouseRules: Array.isArray(defaultHouseRules)
        ? defaultHouseRules.filter((r: any) => typeof r === "string" && r.trim().length)
        : [],
      isActive: true,
    });

    const populatedRental = await VehicleRental.findById(rental._id)
      .populate("vendorId", "fullName email contactNumber")
      .lean();

    return NextResponse.json(
      { success: true, rental: populatedRental },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating vehicle rental:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create vehicle rental" },
      { status: 500 }
    );
  }
});

// DELETE - Delete a vehicle rental by ID
export const DELETE = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid rental ID is required" },
        { status: 400 }
      );
    }

    const rental = await VehicleRental.findById(id);
    if (!rental) {
      return NextResponse.json(
        { success: false, message: "Vehicle rental not found" },
        { status: 404 }
      );
    }

    // Only owner or admin
    if (user.accountType !== "admin" && rental.vendorId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this vehicle rental" },
        { status: 403 }
      );
    }

    await VehicleRental.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Vehicle rental deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting vehicle rental:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete vehicle rental" },
      { status: 500 }
    );
  }
});