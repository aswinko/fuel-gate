"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { signup } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export type UserRole = "superadmin" | "admin" | "pump";

// Define form validation schema
const formSchema = z
  .object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    phone: z.string().min(10, { message: "Invalid phone number" }),
    userType: z.enum(["farmer", "supplier", "user"]),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    address: z.string().optional(),
    farmName: z.string().optional(),
    companyName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function UserRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const toastId = useId();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      userType: "user",
      address: "",
      farmName: "",
      companyName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast.loading("Signing up...", { id: toastId });
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value as string);
    });

    const { success, error } = await signup(formData);
    if (!success) {
      toast.error(String(error), { id: toastId });
      console.log(error);
      
    } else {
      toast.success("Signup successful! Please verify your email.", { id: toastId });
      setTimeout(() => {
        window.location.href = "/login"; // Redirect after email verification
      }, 3000);
    }
    setIsLoading(false);  
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* User Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="userType">I am a</Label>
        <RadioGroup
          id="userType"
          defaultValue="user"
          className="flex flex-col space-y-1"
          onValueChange={(value) => form.setValue("userType", value as UserRole)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="farmer" id="farmer" />
            <Label htmlFor="farmer">Farmer (I produce and sell products)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="supplier" id="supplier" />
            <Label htmlFor="supplier">Supplier (I manage deliveries)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="user" id="user" />
            <Label htmlFor="user">User (I purchase products)</Label>
          </div>
        </RadioGroup>
      </div>

      {/* User Details */}
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input {...form.register("firstName")} placeholder="John" />
            {form.formState.errors.firstName && <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input {...form.register("lastName")} placeholder="Doe" />
            {form.formState.errors.lastName && <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input {...form.register("email")} type="email" placeholder="john.doe@example.com" />
          {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input {...form.register("phone")} placeholder="+1 (555) 000-0000" />
          {form.formState.errors.phone && <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input {...form.register("password")} type="password" />
          {form.formState.errors.password && <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input {...form.register("confirmPassword")} type="password" />
          {form.formState.errors.confirmPassword && <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>}
        </div>

        {form.watch("userType") === "farmer" && (
          <div className="space-y-2">
            <Label htmlFor="farmName">Farm Name</Label>
            <Input {...form.register("farmName")} placeholder="Green Valley Farms" />
          </div>
        )}

        {form.watch("userType") === "supplier" && (
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input {...form.register("companyName")} placeholder="Swift Delivery Services" />
          </div>
        )}

        {(form.watch("userType") === "user" || form.watch("userType") === "farmer") && (
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input {...form.register("address")} placeholder="123 Main St" />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}