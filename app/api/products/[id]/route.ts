import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  // Await the params promise to get the actual params
  const { id } = await params;
  
  // Validate product ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    // Fetch the specific product by ID
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}