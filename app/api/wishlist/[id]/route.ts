//api/wishlist/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Wishlist from "@/models/Wishlist";

type ContextPromise = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, context: ContextPromise) {
  const concrete = { params: await context.params };
  const handler = auth(async (request: NextRequest, ctx?: { params: { id: string } }) => {
    try {
      await dbConnect();
      const userId = (request as unknown as { user: { id: string } }).user.id;
      if (!ctx?.params) {
        return NextResponse.json(
          { success: false, message: "Invalid request" },
          { status: 400 }
        );
      }
      const { id: serviceId } = ctx.params;

      if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return NextResponse.json(
          { success: false, message: "Invalid service ID" },
          { status: 400 }
        );
      }

      const serviceObjectId = new mongoose.Types.ObjectId(serviceId);
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const deletedByDocument = await Wishlist.findOneAndDelete({
        _id: serviceObjectId,
        userId: userObjectId,
      });

      if (deletedByDocument) {
        return NextResponse.json({ success: true, message: "Item removed from wishlist" });
      }

      const deletedByService = await Wishlist.findOneAndDelete({
        userId: userObjectId,
        $or: [
          { stayId: serviceObjectId },
          { tourId: serviceObjectId },
          { adventureId: serviceObjectId },
          { vehicleRentalId: serviceObjectId },
        ],
      });

      if (!deletedByService) {
        return NextResponse.json(
          { success: false, message: "Item not found in wishlist" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, message: "Item removed from wishlist" });
    } catch (error: unknown) {
      console.error("Wishlist delete error", error);
      const message = error instanceof Error ? error.message : "Failed to remove from wishlist";
      return NextResponse.json(
        { success: false, message },
        { status: 500 }
      );
    }
  });

  return handler(req, concrete);
}

