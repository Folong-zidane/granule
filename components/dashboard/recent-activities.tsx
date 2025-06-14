import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, FileText, Share2, Download } from "lucide-react"

const activities = [
  {
    id: 1,
    action: "Modification",
    document: "Examen de mathématiques",
    time: "Il y a 2 heures",
    icon: Edit,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: 2,
    action: "Création",
    document: "Plan de cours - Histoire",
    time: "Hier, 15:30",
    icon: FileText,
    color: "bg-green-50 text-green-600",
  },
  {
    id: 3,
    action: "Partage",
    document: "Fiche d'exercices - Physique",
    time: "Il y a 3 jours",
    icon: Share2,
    color: "bg-purple-50 text-purple-600",
  },
  {
    id: 4,
    action: "Téléchargement",
    document: "Correction du devoir",
    time: "Il y a 1 semaine",
    icon: Download,
    color: "bg-amber-50 text-amber-600",
  },
]

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activités récentes</CardTitle>
        <CardDescription>Historique de vos dernières actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  <span className="font-semibold">{activity.action}</span> - {activity.document}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
