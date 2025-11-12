import mongoose, { Schema, Document } from "mongoose";

export interface IStay extends Document {
  vendorId: mongoose.Types.ObjectId;
  name: string;
  category: "rooms" | "hotels" | "homestays" | "bnbs";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  heroHighlights: string[];
  images: string[]; // Minimum 5 required
  gallery: string[];
  videos: {
    inside?: string[];
    outside?: string[];
  };
  popularFacilities: string[]; // Quick badges with icons
  amenities: Record<string, string[]>; // Grouped facilities (e.g. Bathroom, Activities…)
  rooms: Array<{
    name: string;
    description?: string;
    bedType: string;
    beds: number;
    capacity: number;
    price: number;
    size?: string;
    features: string[];
    images: string[]; // Minimum 3 per room
  }>;
  about: {
    heading: string;
    description: string;
  };
  checkInOutRules: {
    checkIn: string;
    checkOut: string;
    rules: string[];
  };
  vendorMessage?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const staySchema = new Schema<IStay>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["rooms", "hotels", "homestays", "bnbs"],
      required: true,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    heroHighlights: { type: [String], default: [] },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length >= 5;
        },
        message: "At least 5 property images are required",
      },
    },
    gallery: { type: [String], default: [] },
    videos: {
      inside: { type: [String], default: [] },
      outside: { type: [String], default: [] },
    },
    popularFacilities: { type: [String], default: [] },
    amenities: { type: Map, of: [String], default: {} },
    rooms: [
      {
        name: { type: String, required: true },
        description: String,
        bedType: { type: String, required: true },
        beds: { type: Number, required: true, min: 1 },
        capacity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        size: String,
        features: { type: [String], default: [] },
        images: {
          type: [String],
          required: true,
          validate: {
            validator: function (v: string[]) {
              return Array.isArray(v) && v.length >= 3;
            },
            message: "Each room needs at least 3 images",
          },
        },
      },
    ],
    about: {
      heading: { type: String, required: true },
      description: { type: String, required: true },
    },
    checkInOutRules: {
      checkIn: { type: String, required: true },
      checkOut: { type: String, required: true },
      rules: { type: [String], default: [] },
    },
    vendorMessage: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for efficient queries
staySchema.index({ vendorId: 1, category: 1 });
staySchema.index({ category: 1, isActive: 1 });

export default mongoose.models.Stay || mongoose.model<IStay>("Stay", staySchema);

