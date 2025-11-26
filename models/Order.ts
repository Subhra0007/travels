// models/Order.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  itemId: mongoose.Types.ObjectId;
  itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  deliveryCharge: number;
  address: {
    name: string;
    phone: string;
    pincode: string;
    address: string;
    city: string;
    state: string;
    landmark?: string;
  };
  status: "Placed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemType: {
      type: String,
      enum: ["Product", "Stay", "Tour", "Adventure", "VehicleRental"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, default: 15, min: 0 },
    address: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      pincode: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      landmark: { type: String },
    },
    status: {
      type: String,
      enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Placed",
    },
  },
  { timestamps: true }
);

// Index for fast user lookup
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);

