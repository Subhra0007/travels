// app/vehicle-rental/[id]/page.tsx
import { notFound } from "next/navigation";
import VehicleRental from "@/models/VehicleRental";
import dbConnect from "@/lib/config/database";
import mongoose from "mongoose";

import VehicleRentalDetailClient, {
  type VehicleRentalDetailPayload,
} from "../vehiclerentalDetailsClient"; // <= Correct, case-sensitive

async function fetchRental(id: string): Promise<VehicleRentalDetailPayload | null> {
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

    return JSON.parse(JSON.stringify(doc)) as VehicleRentalDetailPayload;
  } catch (err) {
    console.error("fetchRental error:", err);
    return null;
  }
}

export default async function VehicleRentalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const rental = await fetchRental(params.id);

  if (!rental) notFound();

  return <VehicleRentalDetailClient rental={rental} />;
}
