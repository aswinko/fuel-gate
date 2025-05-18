'use server'


import { createClient } from "@/lib/supabase/server";

export async function getVerificationLogs() {
  const supabase = await createClient();
  const { data: logs, error } = await supabase
    .from("verification_logs")
    .select("created_at, status, vehicle_id");

    if (error) {
        console.error("Error fetching verification logs:", error.message);
        return { success: false, error: error.message };
        }
    return { success: true, data: logs };
}
