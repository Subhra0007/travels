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

    const items = await Wishlist.find({ userId }).lean();

    const populated = await Promise.all(
      items.map(async (item: any) => {
        let serviceData: any = null;
        let type = "";

        if (item.stayId) {
          const stay = await Stay.findById(item.stayId).lean();
          if (stay && (stay as any).isActive) {
            serviceData = stay;
            type = "stay";
          }
        } else if (item.tourId) {
          const tour = await Tour.findById(item.tourId).lean();
          if (tour && (tour as any).isActive) {
            serviceData = tour;
            type = "tour";
          }
        } else if (item.adventureId) {
          const adv = await Adventure.findById(item.adventureId).lean();
          if (adv && (adv as any).isActive) {
            serviceData = adv;
            type = "adventure";
          }
        } else if (item.vehicleRentalId) {
          const rental = await VehicleRental.findById(item.vehicleRentalId).lean();
          if (rental && (rental as any).isActive) {
            serviceData = rental;
            type = "vehicle-rental";
          }
        }

        if (!serviceData) return null;

        return {
          _id: item._id.toString(),
          stay: serviceData,           // kept for backward compat
          addedAt: item.createdAt,
          type,
        };
      })
    );

    return NextResponse.json({
      success: true,
      wishlist: populated.filter(Boolean),
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

    // This works perfectly with your sparse unique indexes
    const result = await Wishlist.findOneAndUpdate(
      { userId: userObjectId, [field]: serviceObjectId },
      { $setOnInsert: { userId: userObjectId, [field]: serviceObjectId } },
      { upsert: true, new: true }
    );

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