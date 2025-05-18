import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/app/actions/auth-actions";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const registrationNumber = formData.get("registrationNumber")?.toString().trim().replace(/\s+/g, "");
    const imageFile = formData.get("image") as File;
    const user = await getCurrentUser();

    if (!registrationNumber || !imageFile || !user?.user_id) {
      return NextResponse.json(
        { error: "Missing registration number or image or user id" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Upload image to Supabase Storage
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const fileBuffer = Buffer.from(await imageFile.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("vehicle-log")
      .upload(fileName, fileBuffer, {
        contentType: imageFile.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
    }

    const { data: imageUrlData } = supabase.storage
      .from("vehicle-log")
      .getPublicUrl(fileName);

    const imageUrl = imageUrlData.publicUrl;

    // Fetch vehicle details
    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("registration_number", registrationNumber)
      .single();

      const status = vehicleData ? "approved" : "rejected";
    // Insert log
    const { error: logError } = await supabase.from("verification_logs").insert([
      {
        registration_number: registrationNumber,
        image_url: imageUrl,
        vehicle_id: vehicleData?.id || null,
        user_id: user.id ?? null,
        status,
      },
    ]);

    if (logError) {
      console.error("Log error:", logError);
      return NextResponse.json({ error: "Log creation failed" }, { status: 500 });
    }

    if (vehicleError || !vehicleData) {
      return NextResponse.json(
        { isValid: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isValid: true,
      vehicleDetails: {
        registrationNumber: vehicleData.registration_number,
        make: vehicleData.make_model?.split(" ")?.[0] || "",
        model: vehicleData.make_model?.split(" ")?.[1] || "",
        year: vehicleData.manufacturing_year,
        color: vehicleData.color,
        fuelType: vehicleData.fuel_type,
        owner: vehicleData.registered_owner,
      },
    });
  } catch (err) {
    console.error("Error verifying vehicle:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
