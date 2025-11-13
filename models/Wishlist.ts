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
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    stayId: { type: Schema.Types.ObjectId, ref: "Stay", index: true },
    tourId: { type: Schema.Types.ObjectId, ref: "Tour", index: true },
    adventureId: { type: Schema.Types.ObjectId, ref: "Adventure", index: true },
    vehicleRentalId: { type: Schema.Types.ObjectId, ref: "VehicleRental", index: true },
  },
  { timestamps: true, strict: true }
);

// Ensure only one of the service IDs is set
wishlistSchema.pre("validate", function (next) {
  const ids = [this.stayId, this.tourId, this.adventureId, this.vehicleRentalId].filter(Boolean);
  if (ids.length !== 1) {
    return next(new Error("Exactly one service ID must be provided"));
  }
  next();
});

// Compound indexes for uniqueness
wishlistSchema.index({ userId: 1, stayId: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ userId: 1, tourId: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ userId: 1, adventureId: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ userId: 1, vehicleRentalId: 1 }, { unique: true, sparse: true });

// Force model recompilation to ensure new fields are recognized
// Delete existing model if it exists to allow schema updates
if (mongoose.models.Wishlist) {
  delete (mongoose.models as any).Wishlist;
}

export default mongoose.model<IWishlist>("Wishlist", wishlistSchema);
