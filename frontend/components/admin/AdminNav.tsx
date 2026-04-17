"use client"

import { useRouter } from "next/router"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const adminNavItems = [
  {
    value: "dashboard",
    label: "Dashboard",
    href: "/admin",
  },
  {
    value: "users",
    label: "Users",
    href: "/admin/users",
  },
]

export function AdminNav() {
  const router = useRouter()
  
  const getCurrentTab = () => {
    if (router.pathname === "/admin") return "dashboard"
    if (router.pathname === "/admin/users") return "users"
    return "dashboard"
  }

  return (
    <div className="border-b">
      <div className="container mx-auto px-4">
        <Tabs value={getCurrentTab()} className="w-full">
          <TabsList className="h-12 bg-transparent p-0">
            {adminNavItems.map((item) => (
              <Link key={item.value} href={item.href}>
                <TabsTrigger
                  value={item.value}
                  className={cn(
                    "h-12 rounded-none border-b-2 border-transparent px-6 data-[state=active]:border-primary data-[state=active]:bg-transparent",
                    getCurrentTab() === item.value && "border-primary"
                  )}
                >
                  {item.label}
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}