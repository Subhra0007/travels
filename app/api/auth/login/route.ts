import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    // ✅ 1. Admin Login using .env credentials (NO HARDCODE)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Admin credentials missing in .env");
    }

    // ✅ Check for ADMIN login first (bypass DB)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { email: ADMIN_EMAIL, accountType: "admin" },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );

      const response = NextResponse.json({
        success: true,
        message: "Admin login successful",
        user: {
          id: "admin-fixed",
          fullName: "Super Admin",
          email: ADMIN_EMAIL,
          accountType: "admin",
        },
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 1 day
        secure: process.env.NODE_ENV === "production",
      });

      return response;
    }

    // ✅ 2. Normal USER / VENDOR login logic (UNCHANGED)
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, accountType: user.accountType },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
        isVendorSetupComplete: user.isVendorSetupComplete,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
