"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Trash2, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function CourseSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simuler le chargement des données du cours
  useEffect(() => {
    // Dans une application réelle, vous feriez un appel API ici
    setTimeout(() => {
      setCourse({
        id: courseId,
        title: "Titre du cours",
        description: "Description détaillée du cours...",
        accessType: "private",
        accessCode: "ABC123",
        shareLink: `https://docenseignant.fr/cours/${courseId}`,
        allowDownloads: true,
        allowComments: true,
        showTableOfContents: true,
        allowPrinting: true,
        groups: ["Terminale S1", "Terminale S2"],
      })
      setIsLoading(false)
    }, 500)
  }, [courseId])

  const handleSaveSettings = () => {
    // Dans une application réelle, vous feriez un appel API ici
    toast({
      title: "Paramètres enregistrés",
      description: "Les paramètres du cours ont été mis à jour avec succès.",
    })
  }

  const handleDeleteCourse = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.")) {
      // Dans une application réelle, vous feriez un appel API ici
      toast({
        title: "Cours supprimé",
        description: "Le cours a été supprimé avec succès.",
      })
      router.push("/mes-cours")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Chargement...</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Paramètres du cours</h1>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="access">Accès</TabsTrigger>
            <TabsTrigger value="display">Affichage</TabsTrigger>
            <TabsTrigger value="danger">Zone de danger</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>Modifiez les informations de base de votre cours.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du cours</Label>
                  <Input
                    id="title"
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres d'accès</CardTitle>
                <CardDescription>Configurez qui peut accéder à votre cours et comment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="access-type">Type d'accès</Label>
                  <Select
                    value={course.accessType}
                    onValueChange={(value) => setCourse({ ...course, accessType: value })}
                  >
                    <SelectTrigger id="access-type">
                      <SelectValue placeholder="Sélectionnez le type d'accès" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public (accessible à tous)</SelectItem>
                      <SelectItem value="private">Privé (accessible par code ou lien)</SelectItem>
                      <SelectItem value="restricted">Restreint (accessible à certains groupes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {course.accessType === "private" && (
                  <div className="space-y-2">
                    <Label htmlFor="access-code">Code d'accès</Label>
                    <div className="flex items-center gap-2">
                      <Input id="access-code" value={course.accessCode} readOnly className="font-mono" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
                          setCourse({ ...course, accessCode: newCode })
                          toast({ title: "Code régénéré" })
                        }}
                      >
                        Régénérer
                      </Button>
                    </div>
                  </div>
                )}

                {course.accessType === "restricted" && (
                  <div className="space-y-2">
                    <Label>Groupes autorisés</Label>
                    <div className="flex flex-wrap gap-2">
                      {course.groups.map((group) => (
                        <Badge key={group} variant="outline">
                          {group}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1"
                            onClick={() => {
                              setCourse({
                                ...course,
                                groups: course.groups.filter((g) => g !== group),
                              })
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Dans une application réelle, vous afficheriez un dialogue pour ajouter un groupe
                          const newGroup = prompt("Nom du groupe:")
                          if (newGroup && !course.groups.includes(newGroup)) {
                            setCourse({
                              ...course,
                              groups: [...course.groups, newGroup],
                            })
                          }
                        }}
                      >
                        Ajouter un groupe
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-downloads">Autoriser le téléchargement des ressources</Label>
                    <Switch
                      id="allow-downloads"
                      checked={course.allowDownloads}
                      onCheckedChange={(checked) => setCourse({ ...course, allowDownloads: checked })}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Permet aux élèves de télécharger les ressources attachées au cours.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-comments">Autoriser les commentaires</Label>
                    <Switch
                      id="allow-comments"
                      checked={course.allowComments}
                      onCheckedChange={(checked) => setCourse({ ...course, allowComments: checked })}
                    />
                  </div>
                  <p className="text-sm text-gray-500">Permet aux élèves de laisser des commentaires sur le cours.</p>
                </div>

                <Button onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Options d'affichage</CardTitle>
                <CardDescription>Configurez comment votre cours est affiché aux élèves.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-toc">Afficher la table des matières</Label>
                    <Switch
                      id="show-toc"
                      checked={course.showTableOfContents}
                      onCheckedChange={(checked) => setCourse({ ...course, showTableOfContents: checked })}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Affiche une table des matières dans la barre latérale pour faciliter la navigation.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-printing">Autoriser l'impression</Label>
                    <Switch
                      id="allow-printing"
                      checked={course.allowPrinting}
                      onCheckedChange={(checked) => setCourse({ ...course, allowPrinting: checked })}
                    />
                  </div>
                  <p className="text-sm text-gray-500">Permet aux élèves d'imprimer le contenu du cours.</p>
                </div>

                <Button onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Zone de danger</CardTitle>
                <CardDescription>Les actions dans cette section sont irréversibles. Soyez prudent.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-md bg-red-50">
                    <h3 className="font-medium text-red-800 mb-2">Supprimer ce cours</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Cette action est irréversible. Toutes les données associées à ce cours seront définitivement
                      supprimées.
                    </p>
                    <Button variant="destructive" onClick={handleDeleteCourse}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer définitivement
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
