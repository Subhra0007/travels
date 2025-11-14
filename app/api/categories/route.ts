import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Category from "@/models/Category";
import { auth } from "@/lib/middlewares/auth";
import jwt from "jsonwebtoken";

// GET - Get all categories (public)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true"; // For admin to see all categories

    // Check if user is admin
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
    if (!isAdmin || !all) {
      query.isActive = true;
    }

    const categories = await Category.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .select("name slug requiresVariants image displayOrder isActive");

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST - Create a new category (admin only)
export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;

    // Only admin can create categories
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can create categories" },
        { status: 403 }
      );
    }

    const { name, requiresVariants, image, displayOrder } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Check if category with same slug exists
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      requiresVariants: requiresVariants || false,
      image: image || undefined,
      displayOrder: displayOrder || 0,
      isActive: true,
    });

    return NextResponse.json(
      { success: true, category },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
});

