import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Facebook, Instagram, Twitter } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold">DocEnseignant</span>
            </Link>
            <p className="text-sm text-gray-500">
              La plateforme qui simplifie la création, la gestion et le partage de cours pour les enseignants et les
              étudiants.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://twitter.com">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://facebook.com">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://instagram.com">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Produit</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/fonctionnalites" className="hover:text-primary">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="hover:text-primary">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Ressources</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/tutoriels" className="hover:text-primary">
                  Tutoriels
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-primary">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Newsletter</h3>
            <p className="text-sm text-gray-500">
              Abonnez-vous à notre newsletter pour recevoir nos dernières actualités.
            </p>
            <div className="flex space-x-2">
              <Input type="email" placeholder="Votre email" className="max-w-[220px]" />
              <Button>S'abonner</Button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-gray-500">
          <p>© 2023 DocEnseignant. Tous droits réservés.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link href="/mentions-legales" className="hover:text-primary">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-primary">
              Politique de confidentialité
            </Link>
            <Link href="/conditions" className="hover:text-primary">
              Conditions d'utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
