// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Order from "@/models/Order";
import CartItem from "@/models/CartItem";
import Product from "@/models/Product";
import Stay from "@/models/Stay";
import Tour from "@/models/Tour";
import Adventure from "@/models/Adventure";
import VehicleRental from "@/models/VehicleRental";

type OrderItem = {
  itemId: mongoose.Types.ObjectId;
  itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
  quantity: number;
  itemData?: any;
};

type OrderLean = {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  deliveryCharge: number;
  address: string;
  status: string;
  createdAt: Date;
};

export const GET = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;

    const orders = (await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean()) as unknown as OrderLean[];

    // Populate item details
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const populatedItems = await Promise.all(
          order.items.map(async (item: OrderItem) => {
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
              const itemData = await Model.findById(item.itemId)
                .select("_id name images price basePrice category")
                .lean();
              return {
                ...item,
                itemData,
              };
            }
            return item;
          })
        );

        return {
          ...order,
          items: populatedItems,
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: populatedOrders,
    });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
});

export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const body = await req.json();

    const { items, address, deliveryCharge = 15 } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Items are required" },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address is required" },
        { status: 400 }
      );
    }

    // Validate and calculate total amount
    let totalAmount = 0;

    for (const item of items) {
      const { itemId, itemType, quantity } = item;

      if (!itemId || !itemType || !quantity || quantity < 1) {
        return NextResponse.json(
          { success: false, message: "Invalid item data" },
          { status: 400 }
        );
      }

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
        default:
          return NextResponse.json(
            { success: false, message: "Invalid item type" },
            { status: 400 }
          );
      }

      const itemData = await Model.findById(itemId);
      if (!itemData) {
        return NextResponse.json(
          { success: false, message: `Item not found: ${itemId}` },
          { status: 404 }
        );
      }

      const price = itemData.price || itemData.basePrice || 0;
      totalAmount += price * quantity;
    }

    // Create order
    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      deliveryCharge,
      address,
      status: "Placed",
    });

    // Clear cart items if they were from cart
    // (This is optional - you might want to keep them for reference)
    // await CartItem.deleteMany({ user: userId, itemId: { $in: items.map(i => i.itemId) } });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error: any) {
    console.error("Order POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to place order" },
      { status: 500 }
    );
  }
});

