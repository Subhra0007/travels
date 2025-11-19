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
    const ctxParams = context?.params ? await context.params : ({ id: "" } as { id: string });
    const serviceId = ctxParams?.id || "";

    const isValidObjectId = serviceId && mongoose.Types.ObjectId.isValid(serviceId);
    const serviceObjectId = isValidObjectId ? new mongoose.Types.ObjectId(serviceId) : null;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find and delete the wishlist entry that matches any of the service IDs
    const deleted = await Wishlist.findOneAndDelete(
      isValidObjectId
        ? {
            userId: userObjectId,
            $or: [
              { _id: serviceObjectId },
              { stayId: serviceObjectId },
              { tourId: serviceObjectId },
              { adventureId: serviceObjectId },
              { vehicleRentalId: serviceObjectId },
            ],
          }
        : {
            userId: userObjectId,
          }
    );

    if (!deleted) {
      // Idempotent success: nothing to delete means it's already removed
      return NextResponse.json({ success: true, message: "Item removed from wishlist" });
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

