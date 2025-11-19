import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Booking from "@/models/Booking";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const getTokenVendorId = (req: NextRequest): string | null => {
  try {
    const token = req.cookies.get("token")?.value;
    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { accountType?: string; id?: string; _id?: string };
      if (decoded?.accountType === "vendor") {
        return decoded?.id || decoded?._id || null;
      }
    }
  } catch {}
  return null;
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const addDays = (d: Date, delta: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + delta);
  return x;
};
const addMonths = (d: Date, delta: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return x;
};
const addYears = (d: Date, delta: number) => {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + delta);
  return x;
};

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const vendorId = getTokenVendorId(req);
    if (!vendorId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let vendorObjectId: Types.ObjectId;
    try {
      vendorObjectId = new Types.ObjectId(vendorId);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const vendorMatch = { vendorId: vendorObjectId };
    const activeBookingMatch = { status: { $ne: "cancelled" } };
    const earningsStatusMatch = { status: { $in: ["confirmed", "completed"] }, paymentStatus: { $ne: "refunded" } };

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const yesterdayStart = startOfDay(addDays(now, -1));
    const yesterdayEnd = endOfDay(addDays(now, -1));

    const [todayBookings, totalBookings, todayEarningsAgg, yesterdayEarningsAgg, totalEarningsAgg] = await Promise.all([
      Booking.countDocuments({ ...vendorMatch, ...activeBookingMatch, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Booking.countDocuments({ ...vendorMatch, ...activeBookingMatch }),
      Booking.aggregate([
        { $match: { ...vendorMatch, ...earningsStatusMatch, updatedAt: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Booking.aggregate([
        { $match: { ...vendorMatch, ...earningsStatusMatch, updatedAt: { $gte: yesterdayStart, $lte: yesterdayEnd } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Booking.aggregate([
        { $match: { ...vendorMatch, ...earningsStatusMatch } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const todayEarnings = Array.isArray(todayEarningsAgg) && todayEarningsAgg.length ? todayEarningsAgg[0].total : 0;
    const yesterdayEarnings = Array.isArray(yesterdayEarningsAgg) && yesterdayEarningsAgg.length ? yesterdayEarningsAgg[0].total : 0;
    const totalEarnings = Array.isArray(totalEarningsAgg) && totalEarningsAgg.length ? totalEarningsAgg[0].total : 0;

    // Sales data: weekly, monthly, yearly booking counts
    const weekStart = startOfDay(addDays(now, -6));
    const monthStart = startOfDay(addMonths(now, -11));
    const yearStart = startOfDay(addYears(now, -2));

    const weekAgg = await Booking.aggregate([
      { $match: { ...vendorMatch, ...activeBookingMatch, createdAt: { $gte: weekStart, $lte: todayEnd } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const monthAgg = await Booking.aggregate([
      { $match: { ...vendorMatch, ...activeBookingMatch, createdAt: { $gte: monthStart, $lte: todayEnd } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const yearAgg = await Booking.aggregate([
      { $match: { ...vendorMatch, ...activeBookingMatch, createdAt: { $gte: yearStart, $lte: todayEnd } } },
      { $group: { _id: { $dateToString: { format: "%Y", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    type CountAgg = { _id: string; count: number };
    const salesData = {
      week: (weekAgg as CountAgg[]).map((d) => ({ name: d._id, value: d.count })),
      month: (monthAgg as CountAgg[]).map((d) => ({ name: d._id, value: d.count })),
      year: (yearAgg as CountAgg[]).map((d) => ({ name: d._id, value: d.count })),
    };

    // Recent bookings with service names
    const recentAgg = await Booking.aggregate([
      { $match: vendorMatch },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      { $lookup: { from: "stays", localField: "stayId", foreignField: "_id", as: "stay" } },
      { $lookup: { from: "tours", localField: "tourId", foreignField: "_id", as: "tour" } },
      { $lookup: { from: "adventures", localField: "adventureId", foreignField: "_id", as: "adventure" } },
      { $lookup: { from: "vehiclerentals", localField: "vehicleRentalId", foreignField: "_id", as: "vehicle" } },
      { $addFields: { serviceName: { $ifNull: [ { $arrayElemAt: ["$stay.name", 0] }, { $ifNull: [ { $arrayElemAt: ["$tour.name", 0] }, { $ifNull: [ { $arrayElemAt: ["$adventure.name", 0] }, { $arrayElemAt: ["$vehicle.name", 0] } ] } ] } ] } } },
      { $project: { _id: 1, status: 1, price: "$totalAmount", serviceName: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        todayBookings,
        totalBookings,
        todayEarnings,
        yesterdayEarnings,
        totalEarnings,
      },
      salesData,
      recentBookings: recentAgg,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to compute vendor stats";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

