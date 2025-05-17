"use client"

import { useId, useState } from "react";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password must not be blank"),
});

export function UserAuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const toastId = useId();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    toast.loading("Signing in...", { id: toastId });

    setIsLoading(true);
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);

      const { success, data, error } = await login(formData);

      if (!success) {
        toast.error(`Login failed: ${error}`, { id: toastId });
        setIsLoading(false)
        return;
      }

      toast.success("Login successful", { id: toastId });
    // ✅ Redirect users based on their role
    if (data && typeof data === 'object' && 'role' in data) {
      if (data.role === "superadmin") {
        redirect("/dashboard");
      } else if (data.role === "admin") {
        redirect("/dashboard");
      } else if (data.role === "pump") {
        redirect("/verify");
      } else {
        redirect("/dashboard");
      }
    } else {
      toast.error("Invalid user data", { id: toastId });
    }

    setIsLoading(false);
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...register("email")} placeholder="name@example.com" type="email" disabled={isLoading} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" {...register("password")} type="password" disabled={isLoading} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>
    </div>
  );
}