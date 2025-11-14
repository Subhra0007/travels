import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Booking from "@/models/Booking";
import { auth } from "@/lib/middlewares/auth";
import mongoose from "mongoose";

export const GET = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    if (user.accountType !== "vendor") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // Ensure vendorId is a valid ObjectId for queries
    let vendorId: any = user.id;
    if (mongoose.Types.ObjectId.isValid(user.id)) {
      vendorId = new mongoose.Types.ObjectId(user.id);
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's bookings count
    const todayBookingsCount = await Booking.countDocuments({
      vendorId,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // Total bookings count
    const totalBookingsCount = await Booking.countDocuments({ vendorId });

    // Today's earnings (from completed bookings that were completed today)
    // Prioritize completedAt, fall back to updatedAt for backward compatibility
    let todayEarnings = 0;
    try {
      const todayEarningsAgg = await Booking.aggregate([
        {
          $match: {
            vendorId: vendorId,
            status: "completed",
          },
        },
        {
          $addFields: {
            // Use completedAt if it exists and is not null, otherwise use updatedAt
            completionDate: {
              $cond: {
                if: { $and: [{ $ne: ["$completedAt", null] }, { $ne: ["$completedAt", undefined] }] },
                then: "$completedAt",
                else: "$updatedAt"
              }
            }
          }
        },
        {
          $match: {
            completionDate: { $gte: today, $lt: tomorrow }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$totalAmount", 0] } },
          },
        },
      ]);
      
      if (Array.isArray(todayEarningsAgg) && todayEarningsAgg.length > 0 && todayEarningsAgg[0].total !== null && todayEarningsAgg[0].total !== undefined) {
        todayEarnings = todayEarningsAgg[0].total;
      } else {
        // Fallback: use find and calculate manually
        const todayCompletedBookings = await Booking.find({
          vendorId: vendorId,
          status: "completed",
          $or: [
            { completedAt: { $gte: today, $lt: tomorrow } },
            { 
              completedAt: { $exists: false },
              updatedAt: { $gte: today, $lt: tomorrow }
            }
          ]
        }).select("totalAmount").lean();
        
        todayEarnings = todayCompletedBookings.reduce((sum, booking: any) => {
          return sum + (booking.totalAmount || 0);
        }, 0);
      }
    } catch (error) {
      console.error("Error calculating today's earnings:", error);
      todayEarnings = 0;
    }

    // Total earnings (from all completed bookings)
    // Match all completed bookings for this vendor
    let totalEarnings = 0;
    try {
      const totalEarningsAgg = await Booking.aggregate([
        {
          $match: {
            vendorId: vendorId,
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$totalAmount", 0] } },
          },
        },
      ]);
      
      if (Array.isArray(totalEarningsAgg) && totalEarningsAgg.length > 0 && totalEarningsAgg[0].total !== null && totalEarningsAgg[0].total !== undefined) {
        totalEarnings = totalEarningsAgg[0].total;
      } else {
        // Fallback: use find and calculate manually
        const completedBookings = await Booking.find({
          vendorId: vendorId,
          status: "completed",
        }).select("totalAmount").lean();
        
        totalEarnings = completedBookings.reduce((sum, booking: any) => {
          return sum + (booking.totalAmount || 0);
        }, 0);
      }
    } catch (error) {
      console.error("Error calculating total earnings:", error);
      // Fallback: use find and calculate manually
      try {
        const completedBookings = await Booking.find({
          vendorId: vendorId,
          status: "completed",
        }).select("totalAmount").lean();
        
        totalEarnings = completedBookings.reduce((sum, booking: any) => {
          return sum + (booking.totalAmount || 0);
        }, 0);
      } catch (fallbackError) {
        console.error("Fallback total earnings calculation failed:", fallbackError);
        totalEarnings = 0;
      }
    }

    // Recent 5 bookings
    const recentBookings = await Booking.find({ vendorId })
      .populate("stayId", "name")
      .populate("tourId", "name")
      .populate("adventureId", "name")
      .populate("vehicleRentalId", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("serviceType stayId tourId adventureId vehicleRentalId status totalAmount createdAt")
      .lean();

    // Format recent bookings
    const formattedBookings = recentBookings.map((booking: any) => {
      let serviceName = "Unknown";
      if (booking.stayId?.name) serviceName = booking.stayId.name;
      else if (booking.tourId?.name) serviceName = booking.tourId.name;
      else if (booking.adventureId?.name) serviceName = booking.adventureId.name;
      else if (booking.vehicleRentalId?.name) serviceName = booking.vehicleRentalId.name;

      return {
        _id: booking._id,
        serviceName,
        status: booking.status,
        price: booking.totalAmount,
      };
    });

    // Sales data for charts
    // Week-wise data (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekBookings = await Booking.aggregate([
      {
        $match: {
          vendorId: vendorId,
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Month-wise data (last 12 months)
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 12);
    monthStart.setHours(0, 0, 0, 0);

    const monthBookings = await Booking.aggregate([
      {
        $match: {
          vendorId: vendorId,
          createdAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Year-wise data (last 5 years)
    const yearStart = new Date();
    yearStart.setFullYear(yearStart.getFullYear() - 5);
    yearStart.setHours(0, 0, 0, 0);

    const yearBookings = await Booking.aggregate([
      {
        $match: {
          vendorId: vendorId,
          createdAt: { $gte: yearStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Debug logging
    console.log(`Vendor ${user.id} stats: Total Earnings: ${totalEarnings}, Today Earnings: ${todayEarnings}, Total Bookings: ${totalBookingsCount}, Today Bookings: ${todayBookingsCount}`);

    return NextResponse.json({
      success: true,
      stats: {
        todayBookings: todayBookingsCount,
        totalBookings: totalBookingsCount,
        todayEarnings,
        totalEarnings,
      },
      recentBookings: formattedBookings,
      salesData: {
        week: weekBookings.map((item) => ({ name: item._id, value: item.count })),
        month: monthBookings.map((item) => ({ name: item._id, value: item.count })),
        year: yearBookings.map((item) => ({ name: item._id, value: item.count })),
      },
    });
  } catch (error: any) {
    console.error("Vendor stats error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch vendor stats" },
      { status: 500 }
    );
  }
});

