'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addVehicle } from '@/app/actions/vehicle-actions'
import { toast } from 'sonner'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export default function AddVehicle() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fuelType, setFuelType] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('fuel_type', fuelType) // Ensure fuel_type is added manually

    const result = await addVehicle(formData)

    if (result.success) {
      toast.success('Vehicle added successfully!')
    } else {
      toast.error(result.error || 'Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto p-6 border py-6 mt-4 rounded-xl">
      <h2 className="text-2xl font-semibold mb-6">Add Vehicle</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Registration Number</Label>
          <Input name="registration_number" required />
        </div>
        <div>
          <Label>Manufacturing Year</Label>
          <Input name="manufacturing_year" type="number" required />
        </div>
        <div>
          <Label>Make & Model</Label>
          <Input name="make_model" required />
        </div>
        <div>
          <Label>Color</Label>
          <Input name="color" required />
        </div>
        <div>
          <Label>Fuel Type</Label>
          <Select value={fuelType} onValueChange={setFuelType}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Petrol">Petrol</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="CNG">CNG</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Registered Owner</Label>
          <Input name="registered_owner" required />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Vehicle'}
        </Button>
      </form>
    </div>
  )
}
