// app/(admin)/add-vehicle/actions.ts
'use server'

import { createClient } from "@/lib/supabase/server"

export async function addVehicle(formData: FormData) {
  const supabase = await createClient()

  const registration_number = formData.get('registration_number') as string
  const manufacturing_year = Number(formData.get('manufacturing_year'))
  const make_model = formData.get('make_model') as string
  const color = formData.get('color') as string
  const fuel_type = formData.get('fuel_type') as string
  const registered_owner = formData.get('registered_owner') as string

  const { data, error } = await supabase.from('vehicles').insert({
    registration_number,
    manufacturing_year,
    make_model,
    color,
    fuel_type,
    registered_owner
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}


export async function getAllVehicles() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('vehicles').select('*')

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}