import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Stay from "@/models/Stay";
import { auth } from "@/lib/middlewares/auth";
import mongoose from "mongoose";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const normalizeStayPayload = (body: any) => {
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
    rooms,
    about,
    checkInOutRules,
    vendorMessage = "",
    defaultCancellationPolicy = "",
    defaultHouseRules = [],
  } = body;

  if (!name || !category || !location || !Array.isArray(images) || images.length < 5) {
    return { error: "Missing required fields or insufficient images" };
  }

  if (!["rooms", "hotels", "homestays", "bnbs"].includes(category)) {
    return { error: "Invalid category" };
  }

  if (!Array.isArray(rooms) || rooms.length === 0) {
    return { error: "Please add at least one room" };
  }

  for (const room of rooms) {
    const availabilityValue = room?.available ?? room?.inventory ?? 1;
    if (
      !room?.name ||
      !room?.bedType ||
      typeof room?.beds !== "number" ||
      typeof room?.capacity !== "number" ||
      typeof room?.price !== "number" ||
      !Number.isFinite(Number(availabilityValue)) ||
      !Array.isArray(room?.images) ||
      room.images.length < 3
    ) {
      return {
        error:
          "Every room must include name, bed type, beds, capacity, price, availability and at least 3 images",
      };
    }
  }

  const normalizedRooms = rooms.map((room: any) => ({
    name: room.name,
    description: room.description ?? "",
    bedType: room.bedType,
    beds: Number(room.beds),
    capacity: Number(room.capacity),
    price: Number(room.price),
    taxes: room.taxes != null ? Number(room.taxes) : 0,
    currency: typeof room.currency === "string" && room.currency.trim().length ? room.currency : "INR",
    size: room.size ?? "",
    features: Array.isArray(room.features) ? room.features : [],
    amenities: Array.isArray(room.amenities) ? room.amenities : [],
    available: Number(room.available ?? room.inventory ?? 1),
    isRefundable: room.isRefundable !== undefined ? Boolean(room.isRefundable) : true,
    refundableUntilHours:
      room.refundableUntilHours !== undefined ? Number(room.refundableUntilHours) : 48,
    images: room.images,
  }));

  const normalizedVideos = {
    inside: Array.isArray(videos?.inside) ? videos.inside : [],
    outside: Array.isArray(videos?.outside) ? videos.outside : [],
  };

  const normalizedAmenities: Record<string, string[]> = {};
  if (amenities && typeof amenities === "object") {
    Object.entries(amenities).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length) {
        normalizedAmenities[key] = value;
      }
    });
  }

  const normalizedTags = Array.isArray(tags)
    ? tags
        .filter((tag: any) => typeof tag === "string" && tag.trim().length)
        .map((tag: string) => tag.trim())
    : [];

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

  return {
    payload: {
      name,
      category,
      location,
      heroHighlights,
      images,
      gallery,
      curatedHighlights: normalizedCuratedHighlights,
      tags: normalizedTags,
      videos: normalizedVideos,
      popularFacilities,
      amenities: normalizedAmenities,
      rooms: normalizedRooms,
      about,
      checkInOutRules,
      vendorMessage,
      defaultCancellationPolicy,
      defaultHouseRules,
    },
  };
};
// GET - Fetch stays (vendor-specific or all for admin)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const all = searchParams.get("all") === "true"; // For admin/public to see all

    // Decode token to determine admin or vendor
    let accountType: string | null = null;
    try {
      const token = req.cookies.get("token")?.value;
      if (token && process.env.JWT_SECRET) {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
        accountType = decoded?.accountType || null;
      }
    } catch {}

    // If this is a vendor self-request (vendorId present and not all=true), block when vendor is locked
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
      } catch {
        // ignore token errors; treat as public request
      }
    }

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Valid stay ID is required" },
          { status: 400 }
        );
      }

      const stay = await Stay.findById(id)
        .populate("vendorId", "fullName email contactNumber")
        .lean();

      if (!stay) {
        return NextResponse.json(
          { success: false, message: "Stay not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, stay });
    }

    let query: any = {};

    // If vendorId provided, always filter by that vendor (admin/public or vendor self)
    if (vendorId) {
      if (mongoose.Types.ObjectId.isValid(vendorId)) {
        query.vendorId = new mongoose.Types.ObjectId(vendorId);
      } else {
        query.vendorId = vendorId;
      }
    }

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // If not admin viewing all, only show active stays
    if (!all) {
      query.isActive = true;
    }

    // Public all=true without a specific vendor: exclude locked or unapproved vendors (admins can see all)
    if (all && accountType !== "admin" && !vendorId) {
      const allowedVendors = await User.find({ accountType: "vendor", isVendorApproved: true, isVendorLocked: false }).select("_id");
      const allowedIds = allowedVendors.map((v) => v._id);
      query.vendorId = { $in: allowedIds };
    }

    const stays = await Stay.find(query)
      .populate("vendorId", "fullName email contactNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, stays });
  } catch (error: any) {
    console.error("Error fetching stays:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch stays" },
      { status: 500 }
    );
  }
}

// POST - Create a new stay
export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;

    // Verify vendor
    if (user.accountType !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Only vendors can create stays" },
        { status: 403 }
      );
    }

    const vendorId = user.id;

    const { payload, error } = normalizeStayPayload(body);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    const stay = await Stay.create({
      vendorId,
      ...payload,
      isActive: true,
    });

    const populatedStay = await Stay.findById(stay._id).populate(
      "vendorId",
      "fullName email contactNumber"
    );

    return NextResponse.json(
      { success: true, stay: populatedStay },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating stay:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create stay" },
      { status: 500 }
    );
  }
});

// PUT - Update an existing stay
export const PUT = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid stay ID is required" },
        { status: 400 }
      );
    }

    const stay = await Stay.findById(id);
    if (!stay) {
      return NextResponse.json(
        { success: false, message: "Stay not found" },
        { status: 404 }
      );
    }

    if (user.accountType !== "admin" && stay.vendorId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update this stay" },
        { status: 403 }
      );
    }

    const { payload, error } = normalizeStayPayload(body);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    Object.assign(stay, payload);
    await stay.save();

    const updatedStay = await Stay.findById(id).populate(
      "vendorId",
      "fullName email contactNumber"
    );

    return NextResponse.json({ success: true, stay: updatedStay });
  } catch (error: any) {
    console.error("Error updating stay:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update stay" },
      { status: 500 }
    );
  }
});

// DELETE - Remove a stay by ID
export const DELETE = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid stay ID is required" },
        { status: 400 }
      );
    }

    const stay = await Stay.findById(id);
    if (!stay) {
      return NextResponse.json(
        { success: false, message: "Stay not found" },
        { status: 404 }
      );
    }

    if (user.accountType !== "admin" && stay.vendorId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this stay" },
        { status: 403 }
      );
    }

    await Stay.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Stay deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting stay:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete stay" },
      { status: 500 }
    );
  }
});

