"use server";

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

export async function getVerificationLogsById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("verification_logs")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) {
    console.error("Error fetching verification logs:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}
