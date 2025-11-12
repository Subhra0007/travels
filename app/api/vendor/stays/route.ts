import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Stay from "@/models/Stay";
import { auth } from "@/lib/middlewares/auth";
import mongoose from "mongoose";

// GET - Fetch stays (vendor-specific or all for admin)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const category = searchParams.get("category");
    const all = searchParams.get("all") === "true"; // For admin to see all

    let query: any = {};

    // If vendorId provided, filter by vendor
    if (vendorId && !all) {
      // Convert string to ObjectId if valid
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

    // Validate required fields
    const {
      name,
      category,
      location,
      heroHighlights = [],
      images,
      gallery = [],
      videos = {},
      popularFacilities = [],
      amenities = {},
      rooms,
      about,
      checkInOutRules,
      vendorMessage = "",
    } = body;

    if (!name || !category || !location || !Array.isArray(images) || images.length < 5) {
      return NextResponse.json(
        { success: false, message: "Missing required fields or insufficient images" },
        { status: 400 }
      );
    }

    if (!["rooms", "hotels", "homestays", "bnbs"].includes(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid category" },
        { status: 400 }
      );
    }

    if (!Array.isArray(rooms) || rooms.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please add at least one room" },
        { status: 400 }
      );
    }

    for (const room of rooms) {
      if (
        !room?.name ||
        !room?.bedType ||
        typeof room?.beds !== "number" ||
        typeof room?.capacity !== "number" ||
        typeof room?.price !== "number" ||
        !Array.isArray(room?.images) ||
        room.images.length < 3
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Every room must include name, bed type, beds, capacity, price and at least 3 images",
          },
          { status: 400 }
        );
      }
    }

    const normalizedRooms = rooms.map((room: any) => ({
      name: room.name,
      description: room.description ?? "",
      bedType: room.bedType,
      beds: Number(room.beds),
      capacity: Number(room.capacity),
      price: Number(room.price),
      size: room.size ?? "",
      features: Array.isArray(room.features) ? room.features : [],
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

    // Create stay
    const stay = await Stay.create({
      vendorId,
      name,
      category,
      location,
      images,
      gallery,
      heroHighlights,
      videos: normalizedVideos,
      popularFacilities,
      amenities: normalizedAmenities,
      rooms: normalizedRooms,
      about,
      checkInOutRules,
      vendorMessage,
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

