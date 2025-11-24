// app/vehicle-rental/[id]/page.tsx
import { notFound } from "next/navigation";
import VehicleRental from "@/models/VehicleRental";
import dbConnect from "@/lib/config/database";
import VehicleRentalDetailClient, {
  type VehicleRentalDetailPayload,
} from "../vehiclerentalDetailsClient";
import mongoose from "mongoose";

async function fetchRental(id: string): Promise<VehicleRentalDetailPayload | null> {
  // ---- Guard: invalid ObjectId or blocked words ----
  if (
    !id ||
    !mongoose.Types.ObjectId.isValid(id) ||
    ["add", "new", "create", "edit"].includes(id.toLowerCase())
  ) {
    return null;
  }

  try {
    await dbConnect();
    const doc = await VehicleRental.findById(id)
      .lean()
      .populate("vendorId", "fullName email contactNumber");

    if (!doc || !(doc as any).isActive) return null;

    // Remove MongoDB ObjectId serialization issues
    return JSON.parse(JSON.stringify(doc)) as VehicleRentalDetailPayload;
  } catch (err) {
    console.error("fetchRental error:", err);
    return null;
  }
}

interface PageParams {
  params: Promise<{ id: string }>;
}

export default async function VehicleRentalDetailPage({ params }: PageParams) {
  const { id } = await params;
  const rental = await fetchRental(id);

  if (!rental) notFound();

  return <VehicleRentalDetailClient rental={rental} />;
}