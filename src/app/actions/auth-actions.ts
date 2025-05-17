"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";


interface AuthResponse {
  error: null | string;
  success: boolean;
  data: unknown | null;
}

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  pump_name: string;
  address: string;
  phone: string;
  created_at: string;
}


export async function signup(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient();

  // Extract form fields
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  // const role = formData.get("user-type") as string;
  const farmName = formData.get("farmName") as string | null;
  const companyName = formData.get("companyName") as string | null;
  const address = formData.get("address") as string | null;
  const userType = formData.get("userType") as string;

  // 🔹 Check if the email already exists in `user_profiles`
  const { data: existingUser, error: checkError } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (checkError) {
    return {
      error: "Database error while checking email!",
      success: false,
      data: null,
    };
  }

  if (existingUser) {
    return {
      error: "Email is already registered!",
      success: false,
      data: null,
    };
  }

  // Sign up user in Supabase Auth
  const { data: signupData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: `${firstName} ${lastName}` } },
  });

  if (authError) {
    return { error: authError.message, success: false, data: null };
  }

  const userId = signupData?.user?.id;
  if (!userId) {
    return { error: "User ID not found!", success: false, data: null };
  }

  console.log("User created in auth, inserting into user_profiles...");

  // Insert user details in `user_profiles`
  const { error: profileError } = await supabase.from("user_profiles").insert([
    {
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      phone,
      farm_name: userType === "farmer" ? farmName : null,
      company_name: userType === "supplier" ? companyName : null,
      address,
      email,
    },
  ]);

  if (profileError) {
    console.error("Error inserting into user_profiles:", profileError.message);
    return {
      error: "Failed to store user profile",
      success: false,
      data: null,
    };
  }

  console.log("User profile stored successfully, inserting into user_roles...");

  // Insert user role in `user_roles`
  const { error: roleError } = await supabase
    .from("user_roles")
    .insert([{ user_id: userId, role: userType }]);

  if (roleError) {
    console.error("Error inserting into user_roles:", roleError.message);
    return { error: "Failed to store user role", success: false, data: null };
  }

  console.log("User role stored successfully.");

  return { error: null, success: true, data: signupData };
}

export async function login(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient();

  const credentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // ✅ Authenticate user
  const { data: signInData, error: authError } =
    await supabase.auth.signInWithPassword(credentials);

  if (authError || !signInData?.user) {
    return {
      error: authError?.message || "Authentication failed!",
      success: false,
      data: null,
    };
  }

  const userId = signInData.user.id;
  
  // ✅ Fetch user role from `user_roles`
  const { data: userRoleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (roleError || !userRoleData) {
    return {
      error: "User role not found!",
      success: false,
      data: null,
    };
  }

  return {
    success: true,
    data: { userId, role: userRoleData.role },
    error: null,
  };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getUserRole(): Promise<string | null> {
  const supabase = await createClient();

  // ✅ Get authenticated user
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    console.error("User not found:", userError?.message);
    return null;
  }

  const userId = userData.user.id;

  // ✅ Fetch user role from `user_roles`
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (roleError || !roleData) {
    console.error("Error fetching user role:", roleError?.message);
    return null;
  }

  return roleData.role;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  // ✅ Get authenticated user
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    console.error("Error fetching current user:", authError?.message);
    return null;
  }

  const userId = authData.user.id;

  // ✅ Fetch user details from `user_profiles`
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select(
      "*"
    )
    .eq("user_id", userId)
    .single();

  if (profileError) {
    console.error("Error fetching user profile:", profileError.message);
    return null;
  }

  return userProfile;
}

export async function getAllUsers(): Promise<User[] | null> {
  const supabase = await createClient();

  // Fetch users along with their roles
  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      "*"
    );

  if (error || !data) {
    console.error("Error fetching users:", error.message);
    return null;
  }

  return data;
}

export async function getAllUserRoles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id, role");

  if (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }

  return data; // Array of { user_id, role }
}

export async function updateUserStatus(userId: string, newStatus: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_profiles")
    .update({ status: newStatus })
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to update user status:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}


export async function updateUserProfile(
  userId: string,
  formData: FormData
): Promise<AuthResponse> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_profiles")
    .update({
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
    })
    .eq("user_id", userId);

  if (error) {
    return {
      error: error.message,
      success: false,
      data: null,
    };
  }

  return {
    error: null,
    success: true,
    data: null,
  };
}