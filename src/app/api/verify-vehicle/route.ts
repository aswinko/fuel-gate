import { NextResponse } from "next/server"

// This is a mock API for vehicle verification
// In a real implementation, you would connect to a vehicle database
export async function POST(request: Request) {
  try {
    const { registrationNumber } = await request.json()

    if (!registrationNumber) {
      return NextResponse.json({ error: "No registration number provided" }, { status: 400 })
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Randomly determine if the vehicle is valid (manufactured after 2015)
    const isValid = Math.random() > 0.3
    const currentYear = new Date().getFullYear()
    const year = isValid
      ? 2015 + Math.floor(Math.random() * (currentYear - 2015 + 1))
      : 2010 + Math.floor(Math.random() * 5)

    const makes = ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda", "Toyota"]
    const models = ["Swift", "i20", "Nexon", "XUV300", "City", "Innova"]
    const colors = ["White", "Silver", "Black", "Red", "Blue", "Grey"]
    const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric"]

    return NextResponse.json({
      isValid,
      vehicleDetails: {
        registrationNumber,
        make: makes[Math.floor(Math.random() * makes.length)],
        model: models[Math.floor(Math.random() * models.length)],
        year,
        color: colors[Math.floor(Math.random() * colors.length)],
        fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
        owner: "John Doe",
      },
    })
  } catch (error) {
    console.error("Vehicle Verification Error:", error)
    return NextResponse.json({ error: "Failed to verify vehicle" }, { status: 500 })
  }
}
