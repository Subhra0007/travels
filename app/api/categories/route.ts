import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Category from "@/models/Category";
import { auth } from "@/lib/middlewares/auth";
import jwt from "jsonwebtoken";

// GET - Get all categories (public)
export const GET = auth(async (req: NextRequest) => {
  await dbConnect();
  
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";
  const mine = searchParams.get("mine") === "true";

  try {
    const query: any = {};
    const user = (req as any).user;
    
    if (mine) {
      // For vendor's own categories
      const isSeller = user?.accountType === "vendor" && user?.isSeller;
      if (!isSeller) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
      query.ownerType = "vendor";
      query.owner = user.id || user._id;
    } else if (!all) {
      query.isActive = true;
      query.$or = [
        { ownerType: { $exists: false } },
        { ownerType: "admin" },
        { ownerType: null },
      ];
    }

    const categories = await Category.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .select("name slug requiresVariants image displayOrder isActive ownerType owner");

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
});

// POST - Create a new category
export const POST = auth(async (req: NextRequest) => {
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

    const { name, requiresVariants, image, displayOrder } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      requiresVariants: !!requiresVariants,
      image: image || undefined,
      displayOrder: displayOrder || 0,
      isActive: true,
      ownerType: isSeller ? "vendor" : "admin",
      owner: isSeller ? user.id || user._id : null,
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
});

// PUT - Update a category
export const PUT = auth(async (req: NextRequest, context: any) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;
    const { params } = context;
    const { id } = params;

    const isAdmin = user.accountType === "admin";
    const isSeller = user.accountType === "vendor" && user.isSeller;

    if (!isAdmin && !isSeller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { name, requiresVariants, image, displayOrder, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Check if another category with the same slug exists (excluding current category)
    const existing = await Category.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // Find the category first to check ownership
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check ownership for vendors
    if (isSeller) {
      if (category.ownerType !== "vendor" || category.owner.toString() !== (user.id || user._id).toString()) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      slug,
      requiresVariants: !!requiresVariants,
      displayOrder: displayOrder || 0,
    };

    // Only admins can update image
    if (image !== undefined && isAdmin) {
      updateData.image = image;
    }

    // Only update isActive if provided
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
});

// DELETE - Delete a category
export const DELETE = auth(async (req: NextRequest, context: any) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    const { params } = context;
    const { id } = params;

    const isAdmin = user.accountType === "admin";
    const isSeller = user.accountType === "vendor" && user.isSeller;

    if (!isAdmin && !isSeller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Find the category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check ownership for vendors
    if (isSeller) {
      if (category.ownerType !== "vendor" || category.owner.toString() !== (user.id || user._id).toString()) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    // Delete the category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
});