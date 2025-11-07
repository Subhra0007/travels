import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
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
    isVendorSetupComplete: user.isVendorSetupComplete, // ✅ IMPORTANT
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
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}