import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Stay from "@/models/Stay";
import { auth } from "@/lib/middlewares/auth";

// GET - Fetch single stay
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const stay = await Stay.findById(id).populate(
      "vendorId",
      "fullName email contactNumber"
    );

    if (!stay) {
      return NextResponse.json(
        { success: false, message: "Stay not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, stay });
  } catch (error: any) {
    console.error("Error fetching stay:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch stay" },
      { status: 500 }
    );
  }
}

// PUT - Update stay
export const PUT = auth(async (req: NextRequest,
context: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    // Verify vendor
    if (user.accountType !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Only vendors can update stays" },
        { status: 403 }
      );
    }

    const vendorId = user.id;

    // Check if stay exists and belongs to vendor
    const { id } = await context.params;
    const stay = await Stay.findById(id);
    if (!stay) {
      return NextResponse.json(
        { success: false, message: "Stay not found" },
        { status: 404 }
      );
    }

    if (stay.vendorId.toString() !== vendorId.toString()) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update this stay" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate images if provided
    if (body.images && (!Array.isArray(body.images) || body.images.length < 5)) {
      return NextResponse.json(
        { success: false, message: "At least 5 images are required" },
        { status: 400 }
      );
    }

    let normalizedRooms: Array<{
      name: string;
      description: string;
      bedType: string;
      beds: number;
      capacity: number;
      price: number;
      taxes?: number;
      currency?: string;
      size: string;
      features: string[];
      amenities: string[];
      available: number;
      images: string[];
      isRefundable?: boolean;
      refundableUntilHours?: number;
    }> | undefined;
    if (body.rooms) {
      if (!Array.isArray(body.rooms) || !body.rooms.length) {
        return NextResponse.json(
          { success: false, message: "Please include at least one room" },
          { status: 400 }
        );
      }

      for (const room of body.rooms) {
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
          return NextResponse.json(
            {
              success: false,
              message: "Every room must include name, bed type, beds, capacity, price and at least 3 images",
            },
            { status: 400 }
          );
        }
      }

      normalizedRooms = body.rooms.map((room: any) => ({
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
        images: room.images,
        isRefundable: room.isRefundable !== undefined ? Boolean(room.isRefundable) : true,
        refundableUntilHours:
          room.refundableUntilHours !== undefined ? Number(room.refundableUntilHours) : 48,
      }));
    }

    let normalizedVideos:
      | {
          inside: string[];
          outside: string[];
        }
      | undefined;
    if (body.videos) {
      normalizedVideos = {
        inside: Array.isArray(body.videos?.inside) ? body.videos.inside : [],
        outside: Array.isArray(body.videos?.outside) ? body.videos.outside : [],
      };
    }

    let normalizedAmenities: Record<string, string[]> | undefined;
    if (body.amenities && typeof body.amenities === "object") {
      normalizedAmenities = {};
      Object.entries(body.amenities).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length) {
          (normalizedAmenities as Record<string, string[]>)[key] = value;
        }
      });
    }

    if (body.heroHighlights && !Array.isArray(body.heroHighlights)) {
      return NextResponse.json(
        { success: false, message: "Hero highlights must be an array" },
        { status: 400 }
      );
    }

    if (body.gallery && !Array.isArray(body.gallery)) {
      return NextResponse.json(
        { success: false, message: "Gallery must be an array" },
        { status: 400 }
      );
    }

    if (body.popularFacilities && !Array.isArray(body.popularFacilities)) {
      return NextResponse.json(
        { success: false, message: "Popular facilities must be an array" },
        { status: 400 }
      );
    }

    const normalizedTags = Array.isArray(body.tags)
      ? body.tags
          .filter((tag: any) => typeof tag === "string" && tag.trim().length)
          .map((tag: string) => tag.trim())
      : undefined;

    const normalizedCuratedHighlights = Array.isArray(body.curatedHighlights)
      ? body.curatedHighlights
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
      : undefined;

    const payload: any = { ...body };
    if (normalizedRooms) payload.rooms = normalizedRooms;
    if (normalizedVideos) payload.videos = normalizedVideos;
    if (normalizedAmenities) payload.amenities = normalizedAmenities;
    if (normalizedTags !== undefined) payload.tags = normalizedTags;
    if (normalizedCuratedHighlights !== undefined) payload.curatedHighlights = normalizedCuratedHighlights;

    // Update stay
    const updatedStay = await Stay.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    ).populate("vendorId", "fullName email contactNumber");

    return NextResponse.json({ success: true, stay: updatedStay });
  } catch (error: any) {
    console.error("Error updating stay:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update stay" },
      { status: 500 }
    );
  }
});

// DELETE - Delete stay
export const DELETE = auth(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    const isAdmin = user.accountType === "admin";
    const isVendor = user.accountType === "vendor";

    if (!isAdmin && !isVendor) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const vendorId = user.id;

    // Check if stay exists
    const { id } = await context.params;
    const stay = await Stay.findById(id);
    if (!stay) {
      return NextResponse.json(
        { success: false, message: "Stay not found" },
        { status: 404 }
      );
    }

    // Only vendor can delete their own stays (unless admin)
    if (!isAdmin && stay.vendorId.toString() !== vendorId.toString()) {
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

