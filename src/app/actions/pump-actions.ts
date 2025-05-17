"use server"

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false
    }
  }
)

export const createPumpUser = async (form: {
  email: string
  full_name: string
  phone: string
  pump_name: string
  address: string
}) => {
  // Generate password
  const cleanName = form.full_name.replace(/\s+/g, "")
  const last4Name = cleanName.slice(-4)
  const last4Phone = form.phone.slice(-4)
  const generatedPassword = `${last4Name}${last4Phone}`

  // 1. Create user in Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: form.email,
    password: generatedPassword,
    email_confirm: true,
  })

  if (authError) throw authError

  const user_id = authUser.user?.id
  if (!user_id) throw new Error("User ID not found after creation.")

  // 2. Insert into user_profiles
  const { error: profileError } = await supabase.from("user_profiles").insert({
    user_id,
    email: form.email,
    full_name: form.full_name,
    phone: form.phone,
    pump_name: form.pump_name,
    address: form.address,
  })

  if (profileError) throw profileError

  // 3. Insert into user_roles
  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id,
    role: "pump",
  })

  if (roleError) throw roleError

  return { user_id, generatedPassword }
}



export const createAdminUser = async ({email, full_name, pen_no}: {
  email: string
  full_name: string
  pen_no: string
}) => {
  // Generate password
  const cleanName = full_name.replace(/\s+/g, "")
  const last4Name = cleanName.slice(-4)
  const last4PenNo = pen_no.slice(-4)
  const generatedPassword = `${last4Name}${last4PenNo}`

  // 1. Create user in Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: generatedPassword,
    email_confirm: true,
  })

  if (authError) throw authError

  const user_id = authUser.user?.id
  if (!user_id) throw new Error("User ID not found after creation.")

  // 2. Insert into user_profiles
  const { error: profileError } = await supabase.from("user_profiles").insert({
    user_id,
    email: email,
    full_name: full_name,
    pen_no: pen_no,
  })

  if (profileError) throw profileError

  // 3. Insert into user_roles
  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id,
    role: "admin",
  })

  if (roleError) throw roleError

  return { user_id, generatedPassword }
}
