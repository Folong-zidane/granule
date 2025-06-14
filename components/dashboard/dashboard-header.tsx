"use client"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-provider"
import { Menu, PlusCircle } from "lucide-react"

export function DashboardHeader() {
  const { isOpen, toggleSidebar } = useSidebar()

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isOpen && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bienvenue, Marie</h1>
            <p className="text-sm text-gray-500">Que souhaitez-vous créer aujourd'hui ?</p>
          </div>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Créer un document
        </Button>
      </div>
    </header>
  )
}
