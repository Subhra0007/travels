// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Wishlist from "@/models/Wishlist";
import Stay from "@/models/Stay";
import Tour from "@/models/Tour";
import Adventure from "@/models/Adventure";
import VehicleRental from "@/models/VehicleRental";

export const GET = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;

    const items = await Wishlist.find({ userId })
      .populate({
        path: "stayId",
        match: { isActive: true },
        select: "_id name category location images rating price",
      })
      .populate({
        path: "tourId",
        match: { isActive: true },
        select: "_id name category location images rating",
      })
      .populate({
        path: "adventureId",
        match: { isActive: true },
        select: "_id name category location images rating",
      })
      .populate({
        path: "vehicleRentalId",
        match: { isActive: true },
        select: "_id name category location images rating",
      })
      .lean();

    const populated = items
      .map((item: any) => {
        let serviceData: any = null;
        let type = "";

        if (item.stayId) {
          serviceData = item.stayId;
          type = "stay";
        } else if (item.tourId) {
          serviceData = item.tourId;
          type = "tour";
        } else if (item.adventureId) {
          serviceData = item.adventureId;
          type = "adventure";
        } else if (item.vehicleRentalId) {
          serviceData = item.vehicleRentalId;
          type = "vehicle-rental";
        }

        // Filter out items where service was deleted or inactive
        if (!serviceData || typeof serviceData !== "object" || !serviceData._id) {
          return null;
        }

        return {
          _id: item._id.toString(),
          stay: serviceData, // kept for backward compat
          addedAt: item.createdAt,
          type,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      wishlist: populated,
    });
  } catch (error: any) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
});

export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const body = await req.json();

    const { stayId, tourId, adventureId, vehicleRentalId } = body;

    let field = "";
    let value: string | null = null;
    let Model: any = null;
    let typeName = "";

    if (stayId && mongoose.Types.ObjectId.isValid(stayId)) {
      field = "stayId"; value = stayId; Model = Stay; typeName = "Stay";
    } else if (tourId && mongoose.Types.ObjectId.isValid(tourId)) {
      field = "tourId"; value = tourId; Model = Tour; typeName = "Tour";
    } else if (adventureId && mongoose.Types.ObjectId.isValid(adventureId)) {
      field = "adventureId"; value = adventureId; Model = Adventure; typeName = "Adventure";
    } else if (vehicleRentalId && mongoose.Types.ObjectId.isValid(vehicleRentalId)) {
      field = "vehicleRentalId"; value = vehicleRentalId; Model = VehicleRental; typeName = "Vehicle rental";
    } else {
      return NextResponse.json(
        { success: false, message: "Valid service ID required" },
        { status: 400 }
      );
    }

    const serviceObjectId = new mongoose.Types.ObjectId(value!);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if service exists and is active
    const exists = await Model.findOne({ _id: serviceObjectId, isActive: true });
    if (!exists) {
      return NextResponse.json(
        { success: false, message: `${typeName} not found or no longer available` },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      userId: userObjectId,
      [field]: serviceObjectId,
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Already in your wishlist",
        itemId: existing._id.toString(),
      });
    }

    // Create new wishlist entry with proper validation
    const wishlistData: any = {
      userId: userObjectId,
      [field]: serviceObjectId,
    };

    const result = await Wishlist.create(wishlistData);

    return NextResponse.json({
      success: true,
      message: `${typeName} added to wishlist`,
      itemId: result._id.toString(), // useful for frontend
    });
  } catch (error: any) {
    console.error("Wishlist POST error:", error);

    if (error.code === 11000) {
      return NextResponse.json({
        success: true,
        message: "Already in your wishlist",
      });
    }

    return NextResponse.json(
      { success: false, message: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
});