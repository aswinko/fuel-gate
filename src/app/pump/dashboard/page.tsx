import React from "react";
import PumpDashboardPage from "./PumpDashboardClient";
import Navbar from "@/components/layout/NavBar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/app/actions/auth-actions";

const page = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const userRole = await getUserRole();

  // 🔹 Redirect if the user is not a pump
  if (userRole !== "pump") {
    redirect("/"); // 🔹 Redirect to unauthorized page
  }

  return (
    <>
      <Navbar />
      <PumpDashboardPage />
    </>
  );
};

export default page;
