//api/wishlist/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Wishlist from "@/models/Wishlist";

export const DELETE = auth(async (req: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    if (!context?.params) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }
    const { id: serviceId } = await context.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { success: false, message: "Invalid service ID" },
        { status: 400 }
      );
    }

    // Convert serviceId to ObjectId for proper matching
    const serviceObjectId = new mongoose.Types.ObjectId(serviceId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find and delete the wishlist entry that matches any of the service IDs
    const deleted = await Wishlist.findOneAndDelete({
      userId: userObjectId,
      $or: [
        { stayId: serviceObjectId },
        { tourId: serviceObjectId },
        { adventureId: serviceObjectId },
        { vehicleRentalId: serviceObjectId },
      ],
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Item removed from wishlist" });
  } catch (error: any) {
    console.error("Wishlist delete error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
});

