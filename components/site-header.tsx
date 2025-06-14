"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoginDialog } from "@/components/auth/login-dialog"
import { BookOpen, ChevronDown, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const user = localStorage.getItem("user")
    const role = localStorage.getItem("userRole")

    if (user) {
      const userData = JSON.parse(user)
      setIsLoggedIn(true)
      setUserName(userData.name)
      setUserRole(role)
    } else {
      setIsLoggedIn(false)
      setUserName("")
      setUserRole(null)
    }
  }, [])

  const handleLogout = () => {
    // Supprimer les informations de l'utilisateur du localStorage
    localStorage.removeItem("user")
    localStorage.removeItem("userRole")

    // Mettre à jour l'état
    setIsLoggedIn(false)
    setUserName("")
    setUserRole(null)

    // Afficher une notification
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
    })

    // Rediriger vers la page d'accueil
    router.push("/")
  }

  const getDashboardLink = () => {
    if (userRole === "teacher") {
      return "/dashboard/mes-cours"
    } else if (userRole === "student") {
      return "/dashboard/dashboard-eleve"
    }
    return "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold">DocEnseignant</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Accueil
            </Link>
            <Link href="/fonctionnalites" className="text-sm font-medium transition-colors hover:text-primary">
              Fonctionnalités
            </Link>
            <Link href="/tarifs" className="text-sm font-medium transition-colors hover:text-primary">
              Tarifs
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium transition-colors hover:text-primary">
                Ressources
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/blog">Blog</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tutoriels">Tutoriels</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/faq">FAQ</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {userName}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()}>Tableau de bord</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profil">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <LoginDialog />
              <Button asChild>
                <Link href="/inscription">S'inscrire</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
