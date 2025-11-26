"use server";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Order from "@/models/Order";

const buildPipeline = (scope: "admin" | "vendor") => {
  const pipeline: mongoose.PipelineStage[] = [
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "buyer",
      },
    },
    {
      $unwind: {
        path: "$buyer",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $unwind: "$items" },
    { $match: { "items.itemType": "Product" } },
    {
      $lookup: {
        from: "products",
        localField: "items.itemId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "product.sellerId",
        foreignField: "_id",
        as: "vendor",
      },
    },
    {
      $unwind: {
        path: "$vendor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        unitPrice: {
          $ifNull: [
            "$items.variant.price",
            {
              $ifNull: ["$product.price", { $ifNull: ["$product.basePrice", 0] }],
            },
          ],
        },
      },
    },
    {
      $addFields: {
        soldAmount: { $multiply: ["$unitPrice", "$items.quantity"] },
      },
    },
  ];

  if (scope === "admin") {
    pipeline.push({
      $match: {
        $or: [{ "product.sellerId": { $exists: false } }, { "product.sellerId": null }],
      },
    });
  } else {
    pipeline.push({
      $match: {
        "product.sellerId": { $type: "objectId" },
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });

  return pipeline;
};

const normalizeStatus = (status?: string | null) => {
  if (!status || status === "Placed") return "Pending";
  return status;
};

const mapRow = (row: any) => {
  const productImage =
    row?.items?.variant?.photos?.[0] ||
    row?.product?.images?.[0] ||
    row?.product?.photos?.[0] ||
    null;

  return {
    orderId: row?._id?.toString(),
    buyerId: row?.user?.toString?.() ?? null,
    productId: row?.items?.itemId?.toString?.() ?? row?.product?._id?.toString?.(),
    itemId: row?.items?.itemId?.toString(),
    variantId: row?.items?.variantId?.toString() ?? null,
    productName: row?.product?.name ?? "Unknown product",
    productImage,
    quantity: row?.items?.quantity ?? 0,
    unitPrice: row?.unitPrice ?? 0,
    soldAmount: row?.soldAmount ?? 0,
    buyerName: row?.address?.name ?? row?.buyer?.fullName ?? "Unknown",
    buyerEmail: row?.buyer?.email ?? null,
    buyerPhone: row?.address?.phone ?? row?.buyer?.contactNumber ?? null,
    buyerAddress: {
      line1: row?.address?.address ?? "",
      city: row?.address?.city ?? "",
      state: row?.address?.state ?? "",
      pincode: row?.address?.pincode ?? "",
    },
    deliveryDate: row?.items?.deliveryDate ?? null,
    status: normalizeStatus(row?.items?.status ?? row?.status),
    orderStatus: normalizeStatus(row?.status),
    orderCreatedAt: row?.createdAt ?? null,
    vendorName: row?.vendor?.fullName ?? null,
    vendorId: row?.vendor?._id?.toString() ?? null,
  };
};

export const GET = auth(async (req: NextRequest) => {
  try {
    const user = (req as any).user;
    if (user.accountType !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const scopeParam = searchParams.get("scope") === "vendor" ? "vendor" : "admin";

    const rows = await Order.aggregate(buildPipeline(scopeParam));

    return NextResponse.json({
      success: true,
      data: rows.map(mapRow),
    });
  } catch (error: any) {
    console.error("Admin orders fetch failed:", error);
    return NextResponse.json({ success: false, message: "Failed to load orders" }, { status: 500 });
  }
});

