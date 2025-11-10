//app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";
import Profile from "@/models/Profile";
import OTP from "@/models/OTP";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const {
      fullName,
      email,
      age,
      password,
      confirmPassword,
      contactNumber,
      accountType,
      otp,
    } = await req.json();

    if (
      !fullName ||
      !email ||
      !age ||
      !password ||
      !confirmPassword ||
      !contactNumber ||
      !otp
    ) {
      return NextResponse.json(
        { success: false, message: "All fields required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (await User.findOne({ email })) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const profile = await Profile.create({});
    const user = await User.create({
      fullName,
      email,
      age: Number(age),
      password,
      contactNumber,
      accountType: accountType ?? "user",
      additionalDetails: profile._id,
    });

    return NextResponse.json({
      success: true,
      message: "Signup successful",
      user: { id: user._id, fullName, email },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}