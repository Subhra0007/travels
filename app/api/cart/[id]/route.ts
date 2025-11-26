// app/api/cart/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import CartItem from "@/models/CartItem";

export const DELETE = auth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const { id } = await params;
    const cartItemId = id;

    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return NextResponse.json(
        { success: false, message: "Invalid cart item ID" },
        { status: 400 }
      );
    }

    const cartItem = await CartItem.findOne({
      _id: cartItemId,
      user: userId,
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    await CartItem.deleteOne({ _id: cartItemId });

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error: any) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove from cart" },
      { status: 500 }
    );
  }
});

export const PATCH = auth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const { id } = await params;
    const cartItemId = id;
    const body = await req.json();
    const { quantity } = body;

    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return NextResponse.json(
        { success: false, message: "Invalid cart item ID" },
        { status: 400 }
      );
    }

    if (quantity !== undefined && (quantity < 1 || !Number.isInteger(quantity))) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a positive integer" },
        { status: 400 }
      );
    }

    const cartItem = await CartItem.findOne({
      _id: cartItemId,
      user: userId,
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    if (quantity !== undefined) {
      cartItem.quantity = quantity;
      await cartItem.save();
    }

    return NextResponse.json({
      success: true,
      message: "Cart item updated",
      cartItem,
    });
  } catch (error: any) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update cart item" },
      { status: 500 }
    );
  }
});

