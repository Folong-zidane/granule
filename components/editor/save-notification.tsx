"use client"

import { useState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"

export function SaveNotification() {
  const [visible, setVisible] = useState(false)

  // Simuler une sauvegarde automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(true)

      // Masquer la notification après 3 secondes
      setTimeout(() => {
        setVisible(false)
      }, 3000)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-md shadow-md p-3 flex items-center gap-2 text-sm animate-in fade-in slide-in-from-bottom-5">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <span>Document enregistré automatiquement</span>
    </div>
  )
}
