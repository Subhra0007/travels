//api/wishlist/route.ts
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

    // Fetch wishlist items and populate each service type separately to avoid strictPopulate errors
    const wishlistItems = await Wishlist.find({ userId }).lean();
    
    // Populate each service type separately
    const populatedItems = await Promise.all(
      wishlistItems.map(async (item) => {
        const populated: any = { ...item };
        
        if (item.stayId) {
          try {
            const stay = await Stay.findById(item.stayId).lean();
            if (stay && (stay as any).isActive) {
              populated.stayId = stay;
            } else {
              return null; // Filter out inactive stays
            }
          } catch {
            return null;
          }
        }
        
        if (item.tourId) {
          try {
            const tour = await Tour.findById(item.tourId).lean();
            if (tour && (tour as any).isActive) {
              populated.tourId = tour;
            } else {
              return null;
            }
          } catch {
            return null;
          }
        }
        
        if (item.adventureId) {
          try {
            const adventure = await Adventure.findById(item.adventureId).lean();
            if (adventure && (adventure as any).isActive) {
              populated.adventureId = adventure;
            } else {
              return null;
            }
          } catch {
            return null;
          }
        }
        
        if (item.vehicleRentalId) {
          try {
            const rental = await VehicleRental.findById(item.vehicleRentalId).lean();
            if (rental && (rental as any).isActive) {
              populated.vehicleRentalId = rental;
            } else {
              return null;
            }
          } catch {
            return null;
          }
        }
        
        return populated;
      })
    );
    
    const wishlistItemsFiltered = populatedItems.filter(Boolean);

    const allItems = wishlistItemsFiltered
      .map((item: any) => {
        if (item.stayId) {
          return {
            _id: item._id,
            stay: item.stayId,
            addedAt: item.createdAt,
            type: "stay",
          };
        }
        if (item.tourId) {
          return {
            _id: item._id,
            stay: item.tourId, // Using 'stay' key for backward compatibility with hook
            addedAt: item.createdAt,
            type: "tour",
          };
        }
        if (item.adventureId) {
          return {
            _id: item._id,
            stay: item.adventureId,
            addedAt: item.createdAt,
            type: "adventure",
          };
        }
        if (item.vehicleRentalId) {
          return {
            _id: item._id,
            stay: item.vehicleRentalId,
            addedAt: item.createdAt,
            type: "vehicle-rental",
          };
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, wishlist: allItems });
  } catch (error: any) {
    console.error("Wishlist fetch error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
});

export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const { stayId, tourId, adventureId, vehicleRentalId } = await req.json();

    // Determine which service type is being added
    let serviceId: string | null = null;
    let serviceType: string | null = null;
    let serviceModel: any = null;
    let updateQuery: any = {};
    let message = "";

    if (stayId && mongoose.Types.ObjectId.isValid(stayId)) {
      serviceId = stayId;
      serviceType = "stay";
      serviceModel = Stay;
      updateQuery = { userId, stayId };
      message = "Stay added to wishlist";
    } else if (tourId && mongoose.Types.ObjectId.isValid(tourId)) {
      serviceId = tourId;
      serviceType = "tour";
      serviceModel = Tour;
      updateQuery = { userId, tourId };
      message = "Tour added to wishlist";
    } else if (adventureId && mongoose.Types.ObjectId.isValid(adventureId)) {
      serviceId = adventureId;
      serviceType = "adventure";
      serviceModel = Adventure;
      updateQuery = { userId, adventureId };
      message = "Adventure added to wishlist";
    } else if (vehicleRentalId && mongoose.Types.ObjectId.isValid(vehicleRentalId)) {
      serviceId = vehicleRentalId;
      serviceType = "vehicle-rental";
      serviceModel = VehicleRental;
      updateQuery = { userId, vehicleRentalId };
      message = "Vehicle rental added to wishlist";
    } else {
      return NextResponse.json(
        { success: false, message: "A valid service ID is required (stayId, tourId, adventureId, or vehicleRentalId)" },
        { status: 400 }
      );
    }

    // Verify the service exists and is active
    const serviceExists = await serviceModel.exists({ _id: serviceId, isActive: true });
    if (!serviceExists) {
      return NextResponse.json(
        { success: false, message: `${serviceType} not found` },
        { status: 404 }
      );
    }

    // Create the update document with all fields explicitly set
    // This is required for upsert to work properly with strict mode
    const updateDoc: any = {
      $set: {
        userId,
      },
    };
    
    // Set the appropriate service ID field
    if (stayId) {
      updateDoc.$set.stayId = stayId;
    } else if (tourId) {
      updateDoc.$set.tourId = tourId;
    } else if (adventureId) {
      updateDoc.$set.adventureId = adventureId;
    } else if (vehicleRentalId) {
      updateDoc.$set.vehicleRentalId = vehicleRentalId;
    }

    await Wishlist.findOneAndUpdate(
      updateQuery,
      updateDoc,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error("Wishlist add error", error);
    if (error.code === 11000) {
      return NextResponse.json({ success: true, message: "Item already in wishlist" });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update wishlist" },
      { status: 500 }
    );
  }
});
