import { CheckCircle } from "lucide-react"

export function AdvantagesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Pourquoi choisir DocEnseignant ?
              </h2>
              <p className="text-gray-500 md:text-xl/relaxed">
                Notre plateforme offre de nombreux avantages pour les enseignants et les élèves.
              </p>
            </div>
            <div className="grid gap-6 mt-8">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Gain de temps</h3>
                  <p className="text-gray-500">
                    Créez des cours rapidement grâce à notre éditeur intuitif et nos modèles prêts à l'emploi.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Accessibilité</h3>
                  <p className="text-gray-500">
                    Vos cours sont accessibles partout et à tout moment, sur tous les appareils.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Engagement des élèves</h3>
                  <p className="text-gray-500">
                    Augmentez l'engagement de vos élèves grâce à des contenus interactifs et des QCM.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Suivi personnalisé</h3>
                  <p className="text-gray-500">
                    Suivez la progression de chaque élève et adaptez votre enseignement en conséquence.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/placeholder.svg?height=500&width=500"
              alt="Avantages de DocEnseignant"
              className="aspect-square overflow-hidden rounded-xl object-cover object-center"
              width={500}
              height={500}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
