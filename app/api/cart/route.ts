// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import CartItem from "@/models/CartItem";
import Product from "@/models/Product";
import Stay from "@/models/Stay";
import Tour from "@/models/Tour";
import Adventure from "@/models/Adventure";
import VehicleRental from "@/models/VehicleRental";

type CartItemLean = {
  _id: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
  quantity: number;
};

export const GET = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;

    const cartItems = (await CartItem.find({ user: userId }).lean()) as unknown as CartItemLean[];

    const populatedItems = await Promise.all(
      cartItems.map(async (item) => {
        let itemData: any = null;
        let Model: any = null;

        switch (item.itemType) {
          case "Product":
            Model = Product;
            break;
          case "Stay":
            Model = Stay;
            break;
          case "Tour":
            Model = Tour;
            break;
          case "Adventure":
            Model = Adventure;
            break;
          case "VehicleRental":
            Model = VehicleRental;
            break;
        }

        if (Model) {
          itemData = await Model.findById(item.itemId)
            .select("_id name images price basePrice category")
            .lean();
        }

        if (!itemData) {
          return null;
        }

        return {
          _id: item._id.toString(),
          itemId: item.itemId.toString(),
          itemType: item.itemType,
          quantity: item.quantity,
          item: itemData,
        };
      })
    );

    const validItems = populatedItems.filter(Boolean);

    return NextResponse.json({
      success: true,
      cart: validItems,
    });
  } catch (error: any) {
    console.error("Cart GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart" },
      { status: 500 }
    );
  }
});

export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const body = await req.json();

    const { itemId, itemType, quantity = 1 } = body;

    if (!itemId || !itemType) {
      return NextResponse.json(
        { success: false, message: "itemId and itemType are required" },
        { status: 400 }
      );
    }

    if (!["Product", "Stay", "Tour", "Adventure", "VehicleRental"].includes(itemType)) {
      return NextResponse.json(
        { success: false, message: "Invalid itemType" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    const itemObjectId = new mongoose.Types.ObjectId(itemId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Verify item exists
    let Model: any = null;
    switch (itemType) {
      case "Product":
        Model = Product;
        break;
      case "Stay":
        Model = Stay;
        break;
      case "Tour":
        Model = Tour;
        break;
      case "Adventure":
        Model = Adventure;
        break;
      case "VehicleRental":
        Model = VehicleRental;
        break;
    }

    const itemExists = await Model.findById(itemObjectId);
    if (!itemExists) {
      return NextResponse.json(
        { success: false, message: "Item not found" },
        { status: 404 }
      );
    }

    // Check if already in cart
    const existing = await CartItem.findOne({
      user: userObjectId,
      itemId: itemObjectId,
      itemType,
    });

    if (existing) {
      // Update quantity
      existing.quantity = quantity;
      await existing.save();
      return NextResponse.json({
        success: true,
        message: "Cart updated",
        cartItem: existing,
      });
    }

    // Create new cart item
    const cartItem = await CartItem.create({
      user: userObjectId,
      itemId: itemObjectId,
      itemType,
      quantity,
    });

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cartItem,
    });
  } catch (error: any) {
    console.error("Cart POST error:", error);

    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: "Item already in cart",
      });
    }

    return NextResponse.json(
      { success: false, message: "Failed to add to cart" },
      { status: 500 }
    );
  }
});

