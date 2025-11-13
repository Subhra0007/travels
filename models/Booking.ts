import mongoose, { Schema, Document } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded";

export interface IBookingRoom {
  roomId?: mongoose.Types.ObjectId;
  roomName: string;
  quantity: number;
  pricePerNight: number;
  taxes: number;
  nights: number;
  total: number;
  addons?: string[];
}

export interface IBooking extends Document {
  stayId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId | null;
  customer: {
    fullName: string;
    email: string;
    phone?: string;
    notes?: string;
  };
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  rooms: IBookingRoom[];
  currency: string;
  subtotal: number;
  taxes: number;
  fees: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  metadata?: Record<string, any>;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingRoomSchema = new Schema<IBookingRoom>(
  {
    roomId: { type: Schema.Types.ObjectId },
    roomName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerNight: { type: Number, required: true, min: 0 },
    taxes: { type: Number, default: 0, min: 0 },
    nights: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
    addons: { type: [String], default: [] },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    stayId: { type: Schema.Types.ObjectId, ref: "Stay", required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      notes: String,
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    guests: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      infants: { type: Number, default: 0, min: 0 },
    },
    rooms: { type: [bookingRoomSchema], required: true },
    currency: { type: String, default: "INR" },
    subtotal: { type: Number, required: true, min: 0 },
    taxes: { type: Number, default: 0, min: 0 },
    fees: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "refunded"],
      default: "unpaid",
    },
    paymentReference: String,
    metadata: Schema.Types.Mixed,
    cancelledAt: Date,
  },
  { timestamps: true }
);

bookingSchema.index({ stayId: 1, checkIn: 1 });
bookingSchema.index({ vendorId: 1, status: 1 });
bookingSchema.index({ "customer.email": 1 });

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);
