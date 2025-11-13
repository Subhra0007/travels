import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Support from "@/models/Support";
import User from "@/models/User";

// GET - Admin views all support messages
export const GET = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    // Verify admin
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { status } = new URL(req.url).searchParams;
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const messages = await Support.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email")
      .populate("repliedBy", "fullName email")
      .lean();

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error("Admin support fetch error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch support messages" },
      { status: 500 }
    );
  }
});

