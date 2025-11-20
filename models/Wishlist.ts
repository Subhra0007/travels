// models/Wishlist.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  stayId?: mongoose.Types.ObjectId;
  tourId?: mongoose.Types.ObjectId;
  adventureId?: mongoose.Types.ObjectId;
  vehicleRentalId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stayId: { type: Schema.Types.ObjectId, ref: "Stay" },
    tourId: { type: Schema.Types.ObjectId, ref: "Tour" },
    adventureId: { type: Schema.Types.ObjectId, ref: "Adventure" },
    vehicleRentalId: { type: Schema.Types.ObjectId, ref: "VehicleRental" },
  },
  { timestamps: true }
);

// Validation: exactly one service field must be set
wishlistSchema.pre("save", function (next) {
  const setFields = [
    this.stayId,
    this.tourId,
    this.adventureId,
    this.vehicleRentalId,
  ].filter(Boolean).length;

  if (setFields !== 1) {
    return next(new Error("Exactly one service reference must be provided"));
  }
  next();
});

// Sparse unique compound indexes — perfect for nullable fields
wishlistSchema.index({ userId: 1, stayId: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ userId: 1, tourId: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ userId: 1, adventureId: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ userId: 1, vehicleRentalId: 1 }, { unique: true, sparse: true });

// Fast lookup by user
wishlistSchema.index({ userId: 1 });

export default mongoose.models.Wishlist ||
  mongoose.model<IWishlist>("Wishlist", wishlistSchema);