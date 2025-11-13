import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import Stay from "@/models/Stay";
import Booking from "@/models/Booking";
import Settlement from "@/models/Settlement";
import { auth } from "@/lib/middlewares/auth";

function calculateNights(checkIn: Date, checkOut: Date) {
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      stayId,
      checkIn,
      checkOut,
      rooms,
      guests,
      customer,
      currency = "INR",
      notes,
      source = "web",
    } = body;

    if (!stayId || !mongoose.Types.ObjectId.isValid(stayId)) {
      return NextResponse.json({ success: false, message: "Invalid stay id" }, { status: 400 });
    }

    if (!Array.isArray(rooms) || rooms.length === 0) {
      return NextResponse.json({ success: false, message: "At least one room booking is required" }, { status: 400 });
    }

    if (!customer?.fullName || !customer?.email) {
      return NextResponse.json({ success: false, message: "Guest name and email are required" }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      return NextResponse.json({ success: false, message: "Invalid check-in/out dates" }, { status: 400 });
    }

    const stay = await Stay.findById(stayId);
    if (!stay || !stay.isActive) {
      return NextResponse.json({ success: false, message: "Stay not found" }, { status: 404 });
    }

    const nights = calculateNights(checkInDate, checkOutDate);

    let subtotal = 0;
    let taxes = 0;

    const normalizedRooms = rooms.map((requested: any) => {
      const stayRoom = stay.rooms.id(requested.roomId) || stay.rooms.find((r) => r.name === requested.roomName);
      if (!stayRoom) {
        throw new Error(`Room ${requested.roomName || requested.roomId} not found`);
      }

      const quantity = Number(requested.quantity ?? 1);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error("Invalid room quantity");
      }

      const pricePerNight = Number(requested.pricePerNight ?? stayRoom.price);
      const roomTaxes = Number(requested.taxes ?? stayRoom.taxes ?? 0);
      const total = (pricePerNight + roomTaxes) * quantity * nights;

      subtotal += pricePerNight * quantity * nights;
      taxes += roomTaxes * quantity * nights;

      return {
        roomId: stayRoom._id,
        roomName: stayRoom.name,
        quantity,
        pricePerNight,
        taxes: roomTaxes,
        nights,
        total,
        addons: Array.isArray(requested.addons) ? requested.addons : [],
      };
    });

    const booking = await Booking.create({
      stayId: stay._id,
      vendorId: stay.vendorId,
      customerId: body.customerId ?? null,
      customer,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      guests: {
        adults: Number(guests?.adults ?? 1),
        children: Number(guests?.children ?? 0),
        infants: Number(guests?.infants ?? 0),
      },
      rooms: normalizedRooms,
      currency,
      subtotal,
      taxes,
      fees: Number(body.fees ?? 0),
      totalAmount: subtotal + taxes + Number(body.fees ?? 0),
      status: "pending",
      paymentStatus: "unpaid",
      metadata: { source, notes },
    });

    const settlementDueDate = new Date(checkOutDate);
    settlementDueDate.setDate(settlementDueDate.getDate() + 7);

    await Settlement.create({
      bookingId: booking._id,
      stayId: stay._id,
      vendorId: stay.vendorId,
      amountDue: booking.totalAmount,
      amountPaid: 0,
      currency,
      scheduledDate: settlementDueDate,
      status: "pending",
      notes: "Auto-generated from booking",
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Booking creation error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

export const GET = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const vendorIdParam = searchParams.get("vendorId");

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (user.accountType === "admin") {
      if (vendorIdParam) {
        if (!mongoose.Types.ObjectId.isValid(vendorIdParam)) {
          return NextResponse.json(
            { success: false, message: "Invalid vendor id" },
            { status: 400 }
          );
        }
        query.vendorId = vendorIdParam;
      }
    } else if (user.accountType === "vendor") {
      query.vendorId = user.id;
    } else {
      // regular user
      query.$or = [{ customerId: user.id }, { "customer.email": user.email }];
    }

    const bookings = await Booking.find(query)
      .populate("stayId", "name category location vendorId")
      .populate("vendorId", "fullName email contactNumber")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error("Booking fetch error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
});
