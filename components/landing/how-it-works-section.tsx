import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HowItWorksSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Comment ça marche</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Découvrez comment DocEnseignant simplifie la création et le partage de cours.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold">Créez votre cours</h3>
            <p className="text-center text-gray-500">
              Utilisez notre éditeur intuitif pour créer des cours structurés avec du texte, des images et des QCM.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold">Publiez et partagez</h3>
            <p className="text-center text-gray-500">
              Publiez votre cours et partagez-le avec vos élèves via un code d'accès ou un lien sécurisé.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold">Suivez les progrès</h3>
            <p className="text-center text-gray-500">
              Suivez la progression de vos élèves, leurs résultats aux QCM et adaptez votre enseignement.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <Button size="lg" asChild>
            <Link href="/inscription">Commencer maintenant</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
