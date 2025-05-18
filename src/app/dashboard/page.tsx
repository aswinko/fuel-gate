import { redirect } from "next/navigation";
import { getUserRole } from "../actions/auth-actions";
import { createClient } from "@/lib/supabase/server";
import DashboardPage from "./DashboardClient";

export default async function page() {
  // This is a demo dashboard that shows different content based on user role
  // In a real app, you would fetch the user's role from the server

  const userRole = await getUserRole();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  // 🔹 Redirect if the user is not a admin or superadmin
  if (userRole !== "superadmin" && userRole != "admin") {
    redirect("/"); // 🔹 Redirect to unauthorized page
  }

  return <DashboardPage />;
}
