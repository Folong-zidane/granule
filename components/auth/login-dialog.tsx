"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

// Données utilisateurs simulées
const users = {
  teachers: [
    { name: "Batchakui", email: "batchakui@gmail.com", password: "batchakui" },
    { name: "Folong", email: "folong@gmail.com", password: "folong" },
  ],
  students: [
    { name: "Etudiant", email: "etudiant@gmail.com", password: "etudiant" },
    { name: "Zidane", email: "zidane@gmail.com", password: "zidane" },
  ],
}

export function LoginDialog() {
  const [open, setOpen] = useState(false)
  const [teacherEmail, setTeacherEmail] = useState("")
  const [teacherPassword, setTeacherPassword] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentPassword, setStudentPassword] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault()

    const teacher = users.teachers.find((t) => t.email === teacherEmail && t.password === teacherPassword)

    if (teacher) {
      // Stocker les informations de l'utilisateur dans localStorage
      localStorage.setItem("user", JSON.stringify(teacher))
      localStorage.setItem("userRole", "teacher")

      // Fermer le dialogue et rediriger vers le dashboard enseignant
      setOpen(false)
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${teacher.name}!`,
      })
      router.push("/dashboard/mes-cours")
    } else {
      toast({
        title: "Échec de la connexion",
        description: "Email ou mot de passe incorrect.",
        variant: "destructive",
      })
    }
  }

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault()

    const student = users.students.find((s) => s.email === studentEmail && s.password === studentPassword)

    if (student) {
      // Stocker les informations de l'utilisateur dans localStorage
      localStorage.setItem("user", JSON.stringify(student))
      localStorage.setItem("userRole", "student")

      // Fermer le dialogue et rediriger vers le dashboard étudiant
      setOpen(false)
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${student.name}!`,
      })
      router.push("/dashboard/dashboard-eleve")
    } else {
      toast({
        title: "Échec de la connexion",
        description: "Email ou mot de passe incorrect.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Connexion</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connexion</DialogTitle>
          <DialogDescription>Connectez-vous à votre compte pour accéder à votre espace personnel.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="teacher" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teacher">Enseignant</TabsTrigger>
            <TabsTrigger value="student">Étudiant</TabsTrigger>
          </TabsList>

          <TabsContent value="teacher">
            <form onSubmit={handleTeacherLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-email">Email</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-password">Mot de passe</Label>
                <Input
                  id="teacher-password"
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  required
                />
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit">Se connecter</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="student">
            <form onSubmit={handleStudentLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student-email">Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-password">Mot de passe</Label>
                <Input
                  id="student-password"
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                />
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit">Se connecter</Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
