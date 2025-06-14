import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

const recentDocuments = [
  {
    id: 1,
    title: "Examen de mathématiques - Terminale S",
    lastModified: "Modifié il y a 2 heures",
    tags: [
      { name: "Mathématiques", color: "bg-blue-100 text-blue-800" },
      { name: "Examen", color: "bg-red-100 text-red-800" },
    ],
  },
  {
    id: 2,
    title: "Plan de cours - Histoire Géographie",
    lastModified: "Modifié hier",
    tags: [
      { name: "Histoire", color: "bg-amber-100 text-amber-800" },
      { name: "Plan", color: "bg-green-100 text-green-800" },
    ],
  },
  {
    id: 3,
    title: "Fiche d'exercices - Physique Chimie",
    lastModified: "Modifié il y a 3 jours",
    tags: [
      { name: "Physique", color: "bg-purple-100 text-purple-800" },
      { name: "Exercices", color: "bg-indigo-100 text-indigo-800" },
    ],
  },
  {
    id: 4,
    title: "Correction du devoir - Français",
    lastModified: "Modifié il y a 1 semaine",
    tags: [
      { name: "Français", color: "bg-pink-100 text-pink-800" },
      { name: "Correction", color: "bg-orange-100 text-orange-800" },
    ],
  },
]

export function RecentDocuments() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Documents récents</CardTitle>
          <CardDescription>Vos documents récemment modifiés</CardDescription>
        </div>
        <Button variant="ghost" size="sm">
          Voir tous
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-md">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{doc.title}</h3>
                  <p className="text-xs text-gray-500">{doc.lastModified}</p>
                  <div className="flex gap-1 mt-1">
                    {doc.tags.map((tag, index) => (
                      <Badge key={index} className={tag.color} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
