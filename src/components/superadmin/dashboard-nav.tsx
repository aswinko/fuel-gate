"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, FuelIcon, Home, Package, ShoppingBasket, ShoppingCart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "pumps",
    href: "/dashboard/pumps",
    icon: FuelIcon,
  },
]

const customerNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Browse Products",
    href: "/dashboard/browse",
    icon: Package,
  },
  {
    title: "My Cart",
    href: "/dashboard/cart",
    icon: ShoppingCart,
  },
  {
    title: "My Orders",
    href: "/dashboard/orders",
    icon: ShoppingBasket,
  },
  {
    title: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: Users,
  },
]

const superAdminNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Admins",
    href: "/dashboard/admins",
    icon: Users,
  },
  {
    title: "Add Vehicle",
    href: "/dashboard/add-vehicle",
    icon: Car,
  },
]

export function DashboardNav({ userRole}: {userRole: string}) {
  const pathname = usePathname()

  // Select nav items based on user role
  const navItems =
    userRole === "superadmin"
      ? superAdminNavItems
      : userRole === "admin"
        ? adminNavItems
            : customerNavItems

  return (
    <nav className="grid gap-1 px-2">
      {navItems.map((item, index) => (
        <Button key={index} asChild variant={pathname === item.href ? "secondary" : "ghost"} className="justify-start">
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}