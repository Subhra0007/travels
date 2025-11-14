import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { auth } from "@/lib/middlewares/auth";

// PUT - Update a category (admin only)
export const PUT = auth(async (
  req: NextRequest,
  context?: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;

    // Only admin can update categories
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can update categories" },
        { status: 403 }
      );
    }

    if (!context?.params) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 }
      );
    }

    // Handle both Promise and direct params
    const resolvedParams = context.params instanceof Promise ? await context.params : context.params;
    const categoryId = resolvedParams.id;

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 }
      );
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const { name, requiresVariants, image, displayOrder, isActive } = body;

    // If name is being changed, update slug
    if (name && name.trim() !== category.name) {
      const newSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      // Check if slug already exists
      const existing = await Category.findOne({ slug: newSlug, _id: { $ne: categoryId } });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Category with this name already exists" },
          { status: 400 }
        );
      }

      category.name = name.trim();
      category.slug = newSlug;
    }

    if (requiresVariants !== undefined) category.requiresVariants = requiresVariants;
    if (image !== undefined) category.image = image;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
});

// DELETE - Delete a category (admin only)
export const DELETE = auth(async (
  req: NextRequest,
  context?: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    // Only admin can delete categories
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can delete categories" },
        { status: 403 }
      );
    }

    if (!context?.params) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 }
      );
    }

    // Handle both Promise and direct params
    const resolvedParams = context.params instanceof Promise ? await context.params : context.params;
    const categoryId = resolvedParams.id;

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 }
      );
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if any products use this category
    const productCount = await Product.countDocuments({ category: category.slug });
    if (productCount > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete category. ${productCount} product(s) are using this category.` },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(categoryId);

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
});

