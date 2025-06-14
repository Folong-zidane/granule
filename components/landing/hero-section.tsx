import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Créez et partagez des cours interactifs
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                DocEnseignant est la plateforme qui simplifie la création, la gestion et le partage de cours pour les
                enseignants et les étudiants.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link href="/inscription">Commencer gratuitement</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/fonctionnalites">Découvrir les fonctionnalités</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/placeholder.svg?height=550&width=550"
              alt="Plateforme DocEnseignant"
              className="aspect-square overflow-hidden rounded-xl object-cover object-center"
              width={550}
              height={550}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
