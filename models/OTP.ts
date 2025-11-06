import mongoose from "mongoose";
import { mailSender } from "@/lib/utils/mailSender";
import emailVerificationTemplate from "@/lib/mail/templates/emailVerificationTemplate";

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 min TTL
});

OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    await mailSender(
      this.email,
      "Your OTP",
      emailVerificationTemplate(this.otp)
    );
  }
  next();
});

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);