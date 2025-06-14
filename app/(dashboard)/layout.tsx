import type React from "react"
import { SidebarProvider } from "@/components/sidebar-provider"
import { MainSidebar } from "@/components/main-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <MainSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  )
}
