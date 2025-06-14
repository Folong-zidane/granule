import { BookOpen, FileText, Share2, Users, BarChart, CheckSquare } from "lucide-react"

export function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Fonctionnalités
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Tout ce dont vous avez besoin</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              DocEnseignant offre une suite complète d'outils pour créer, gérer et partager vos cours.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Éditeur de cours</h3>
            <p className="text-center text-gray-500">
              Créez des cours structurés avec un éditeur intuitif et des modèles prêts à l'emploi.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Partage sécurisé</h3>
            <p className="text-center text-gray-500">
              Partagez vos cours avec vos élèves via des codes d'accès ou des liens sécurisés.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">QCM interactifs</h3>
            <p className="text-center text-gray-500">
              Créez des questionnaires à choix multiples pour évaluer la compréhension de vos élèves.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Bibliothèque de ressources</h3>
            <p className="text-center text-gray-500">
              Accédez à une bibliothèque de ressources pédagogiques pour enrichir vos cours.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Gestion des élèves</h3>
            <p className="text-center text-gray-500">
              Gérez facilement l'accès de vos élèves à vos cours et suivez leur activité.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Statistiques et analyses</h3>
            <p className="text-center text-gray-500">
              Suivez la progression de vos élèves et identifiez les points à améliorer.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
