// app/api/wishlist/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Wishlist from "@/models/Wishlist";
import { ensureWishlistIndexes } from "@/lib/db/ensureWishlistIndexes";

export const DELETE = auth(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    await ensureWishlistIndexes();
    const userId = (req as any).user.id;
    
    // Await params to get the id
    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid wishlist item ID" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const targetId = new mongoose.Types.ObjectId(id);

    // First: Try to delete by Wishlist document _id (most common case from frontend)
    const deletedByDocId = await Wishlist.findOneAndDelete({
      _id: targetId,
      userId: userObjectId,
    });

    if (deletedByDocId) {
      return NextResponse.json({
        success: true,
        message: "Item removed from wishlist",
      });
    }

    // Second: Fallback — try to delete by service ID (stayId, tourId, etc.)
    const deletedByServiceId = await Wishlist.findOneAndDelete({
      userId: userObjectId,
      $or: [
        { stayId: targetId },
        { tourId: targetId },
        { adventureId: targetId },
        { vehicleRentalId: targetId },
      ],
    });

    if (!deletedByServiceId) {
      return NextResponse.json(
        { success: false, message: "Item not found in your wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from wishlist",
    });
  } catch (error: any) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove item from wishlist" },
      { status: 500 }
    );
  }
});