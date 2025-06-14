"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileEdit, FolderOpen, Settings, PlusCircle, ChevronLeft } from "lucide-react"

export function MainSidebar() {
  const pathname = usePathname()
  const { isOpen, toggleSidebar } = useSidebar()

  const navItems = [
    {
      title: "Tableau de bord",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Nouvel éditeur",
      href: "/editeur",
      icon: FileEdit,
    },
    {
      title: "Mes documents",
      href: "/documents",
      icon: FolderOpen,
    },
    {
      title: "Paramètres",
      href: "/parametres",
      icon: Settings,
    },
  ]

  if (!isOpen) {
    return (
      <div className="fixed top-0 left-0 h-full z-40">
        <Button variant="ghost" size="icon" className="m-2" onClick={toggleSidebar}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 h-screen w-64 flex-shrink-0 transition-all duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-600">DocEnseignant</h2>
          <p className="text-sm text-gray-500">Plateforme d'édition</p>
        </div>

        <div className="p-4">
          <Button className="w-full" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer un document
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === item.href ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              ME
            </div>
            <div>
              <p className="text-sm font-medium">Marie Enseignante</p>
              <p className="text-xs text-gray-500">Lycée Victor Hugo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
