"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateCourseButton() {
  const router = useRouter()

  const handleCreateCourse = () => {
    router.push("/creer-cours")
  }

  return (
    <Button onClick={handleCreateCourse} className="gap-2">
      <PlusCircle className="h-4 w-4" />
      Créer un cours
    </Button>
  )
}
