import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string; // URL-friendly version (e.g., "t-shirt" -> "t-shirt")
  requiresVariants: boolean; // true for jacket and t-shirt
  image?: string; // Optional image for navbar
  displayOrder: number; // For ordering in UI
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    requiresVariants: { type: Boolean, default: false },
    image: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for efficient queries
categorySchema.index({ slug: 1, isActive: 1 });
categorySchema.index({ displayOrder: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);

