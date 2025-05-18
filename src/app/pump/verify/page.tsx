import React from "react";
import VerifyPage from "./VerifyPageClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/NavBar";
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
      <VerifyPage />
    </>
  );
};

export default page;
