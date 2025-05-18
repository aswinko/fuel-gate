import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch verification logs (with user_id and vehicle_id)
    const { data: logs, error: logsError } = await supabase
      .from("verification_logs")
      .select(
        `id, registration_number, image_url, created_at, status, user_id, vehicle_id`
      )
      .order("created_at", { ascending: false });

    if (logsError) {
      console.error("Error fetching verification logs:", logsError.message);
      return NextResponse.json(
        { error: "Unable to fetch verification logs" },
        { status: 500 }
      );
    }

    // Extract unique user_ids and vehicle_ids to minimize queries
    const userIds = [...new Set(logs.map((log) => log.user_id).filter(Boolean))];
    const vehicleIds = [...new Set(logs.map((log) => log.vehicle_id).filter(Boolean))];

    // 2. Fetch user profiles separately
    const { data: users, error: usersError } = await supabase
      .from("user_profiles")
      .select(`id, pump_name, email`)
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching user profiles:", usersError.message);
      return NextResponse.json(
        { error: "Unable to fetch user profiles" },
        { status: 500 }
      );
    }

    // 3. Fetch vehicles separately
    const { data: vehicles, error: vehiclesError } = await supabase
      .from("vehicles")
      .select(`id, make_model, registered_owner, manufacturing_year`)
      .in("id", vehicleIds);

    if (vehiclesError) {
      console.error("Error fetching vehicles:", vehiclesError.message);
      return NextResponse.json(
        { error: "Unable to fetch vehicles" },
        { status: 500 }
      );
    }

    // 4. Merge the data manually
    const mergedLogs = logs.map((log, index) => {
      const user = users.find((u) => u.id === log.user_id);
      const vehicle = vehicles.find((v) => v.id === log.vehicle_id);

      return {
        id: `log-${index + 1}`,
        pumpName: user?.pump_name ?? "Unknown Pump",
        email: user?.email ?? "Unknown PEN",
        registeredOwner: vehicle?.registered_owner ?? "Unknown Owner",
        model: vehicle?.make_model ?? "Unknown Model",
        manufacturingYear: vehicle?.manufacturing_year ?? null,
        registrationNo: log.registration_number ?? "N/A",
        imageUrl: log.image_url ?? "/placeholder.svg",
        createdAt: log.created_at ?? new Date().toISOString(),
        status: log.status ?? "pending",
      };
    });

    return NextResponse.json(mergedLogs);
  } catch (err) {
    console.error("Unhandled error:", err);
    return NextResponse.json(
      { error: "Unexpected server error occurred" },
      { status: 500 }
    );
  }
}
