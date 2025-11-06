import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { IProfile } from "./Profile";

export interface IUser extends Document {
  fullName: string;
  email: string;
  contactNumber?: string;
  password: string;
  accountType?: "user" | "vendor";
  age?: number;
  avatar?: string;
  token?: string;
  resetPasswordExpires?: Date;
  additionalDetails: mongoose.Types.ObjectId | IProfile | null;
  comparePassword?: (candidate: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    contactNumber: String,
    password: { type: String, required: true },
    accountType: { type: String, enum: ["user", "vendor"], default: "user" },
    age: Number,
    avatar: String,
    token: String,
    resetPasswordExpires: Date,
    additionalDetails: { type: Schema.Types.ObjectId, ref: "Profile", default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if ((this as any).isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    (this as any).password = await bcrypt.hash((this as any).password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);
