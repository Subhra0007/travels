import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Product from "@/models/Product";
import { auth } from "@/lib/middlewares/auth";

// GET - Get a single product by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await dbConnect();
    
    // Handle both Promise and direct params (for Next.js 13+ and 15+)
    const resolvedParams = params instanceof Promise ? await params : params;
    const productId = resolvedParams.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT - Update a product (admin only)
export const PUT = auth(async (
  req: NextRequest,
  context?: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;

    // Only admin can update products
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can update products" },
        { status: 403 }
      );
    }

    if (!context?.params) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Handle both Promise and direct params
    const resolvedParams = context.params instanceof Promise ? await context.params : context.params;
    const productId = resolvedParams.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const { name, category, description, basePrice, images, variants, tags, isActive } = body;

    // Validate variants if provided
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        if (!variant.color || !variant.size || variant.stock === undefined) {
          return NextResponse.json(
            { success: false, message: "Each variant must have color, size, and stock" },
            { status: 400 }
          );
        }
      }
    }

    // Update product
    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (basePrice !== undefined) product.basePrice = basePrice;
    if (images !== undefined) product.images = images;
    if (variants !== undefined) product.variants = variants;
    if (tags !== undefined) product.tags = tags;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
});

// DELETE - Delete a product (admin only)
export const DELETE = auth(async (
  req: NextRequest,
  context?: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    // Only admin can delete products
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can delete products" },
        { status: 403 }
      );
    }

    if (!context?.params) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Handle both Promise and direct params
    const resolvedParams = context.params instanceof Promise ? await context.params : context.params;
    const productId = resolvedParams.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
});

