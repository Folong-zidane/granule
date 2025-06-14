import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ClipboardList, BookOpen } from "lucide-react"

const templates = [
  {
    id: 1,
    title: "Modèle d'examen",
    description: "Structure complète pour créer un examen",
    icon: FileText,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: 2,
    title: "Plan de cours",
    description: "Format pour organiser votre plan de cours",
    icon: BookOpen,
    color: "bg-green-50 text-green-600",
  },
  {
    id: 3,
    title: "Fiche d'exercices",
    description: "Modèle pour créer des fiches d'exercices",
    icon: ClipboardList,
    color: "bg-amber-50 text-amber-600",
  },
]

export function PopularTemplates() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Modèles populaires</CardTitle>
        <CardDescription>Commencez rapidement avec un modèle</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className={`p-3 rounded-md ${template.color}`}>
                <template.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{template.title}</h3>
                <p className="text-sm text-gray-500">{template.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
