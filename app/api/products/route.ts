import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Product from "@/models/Product";
import { auth } from "@/lib/middlewares/auth";
import jwt from "jsonwebtoken";

// GET - Get all products (public) or with filters
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const all = searchParams.get("all") === "true"; // For admin to see all products

    // Check if user is admin (from cookie/token)
    let isAdmin = false;
    try {
      const authHeader = req.headers.get("authorization");
      const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
      const tokenFromCookie = req.cookies.get("token")?.value;
      const token = tokenFromHeader || tokenFromCookie;
      
      if (token && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        isAdmin = decoded.accountType === "admin";
      }
    } catch {}

    const query: any = {};
    
    // Only show active products to non-admin users
    if (!isAdmin || !all) {
      query.isActive = true;
    }

    if (category && category !== "all") {
      query.category = category;
    }

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
}

// POST - Create a new product (admin only)
export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;

    // Only admin can create products
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can create products" },
        { status: 403 }
      );
    }

    const { name, category, description, basePrice, images, variants, tags } = body;

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

    // Check if category exists and requires variants
    const Category = (await import("@/models/Category")).default;
    const categoryDoc = await Category.findOne({ slug: category, isActive: true });
    if (!categoryDoc) {
      return NextResponse.json(
        { success: false, message: "Invalid category" },
        { status: 400 }
      );
    }

    // Validate variants if category requires them
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
      isActive: true,
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

