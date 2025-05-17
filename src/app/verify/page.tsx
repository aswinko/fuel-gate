import React from "react";
import VerifyPage from "./VerifyPageClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/NavBar";

const page = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  return (
    <>
      <Navbar />
      <VerifyPage />
    </>
  );
};

export default page;
