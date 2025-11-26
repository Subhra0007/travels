import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Product from "@/models/Product";
import { auth } from "@/lib/middlewares/auth";

export const GET = auth(async (req: NextRequest) => {
  await dbConnect();
  
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";
  const mine = searchParams.get("mine") === "true";
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sellerId = searchParams.get("sellerId");

  try {
    const query: any = {};
    const user = (req as any).user;

    // If sellerId is provided, filter by that seller
    if (sellerId) {
      query.sellerId = sellerId;
    } else if (mine) {
      // For vendor's own products
      const isSeller = user.accountType === "vendor" && user.isSeller;
      if (!isSeller) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
      query.sellerId = user.id || user._id;
    } else if (!all) {
      query.isActive = true;
    }

    if (category && category !== "all") query.category = category;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
});

export const POST = auth(async (req: NextRequest, context: any) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;

    const isAdmin = user.accountType === "admin";
    const isSeller = user.accountType === "vendor" && user.isSeller;

    if (!isAdmin && !isSeller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { name, category, description, basePrice, images, variants, tags, stock } = body;

    if (!name || !category || !description || basePrice === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one image is required" },
        { status: 400 }
      );
    }

    const Category = (await import("@/models/Category")).default;
    const categoryDoc = await Category.findOne({ slug: category, isActive: true });

    if (!categoryDoc) {
      return NextResponse.json(
        { success: false, message: "Invalid category" },
        { status: 400 }
      );
    }

    if (categoryDoc.requiresVariants) {
      if (!variants || !Array.isArray(variants) || variants.length === 0) {
        return NextResponse.json(
          { success: false, message: `At least one variant is required for ${categoryDoc.name}` },
          { status: 400 }
        );
      }

      for (const variant of variants) {
        if (!variant.color || !variant.size || variant.stock === undefined) {
          return NextResponse.json(
            { success: false, message: "Each variant must have color, size, and stock" },
            { status: 400 }
          );
        }
      }
    }

    const product = await Product.create({
      name,
      category,
      description,
      basePrice,
      images,
      variants: variants || [],
      tags: tags || [],
      stock: categoryDoc.requiresVariants ? undefined : stock || 0, // Add stock for non-variant products
      isActive: true,
      sellerId: isSeller ? user.id || user._id : null,
    });

    return NextResponse.json(
      { success: true, product },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
});