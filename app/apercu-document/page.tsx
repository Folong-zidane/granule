"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DocumentPreviewPage() {
  const router = useRouter()
  const [documentPreview, setDocumentPreview] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Récupérer le document parsé depuis le localStorage
    const parsedDocumentJson = localStorage.getItem("parsedDocument")

    if (parsedDocumentJson) {
      const parsedDocument = JSON.parse(parsedDocumentJson)
      setDocumentPreview(parsedDocument)
    }

    setIsLoading(false)
  }, [])

  const handleEdit = () => {
    router.push("/editeur?imported=true")
  }

  const handlePreview = () => {
    router.push("/previsualiser")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg">Chargement de l'aperçu...</p>
      </div>
    )
  }

  if (!documentPreview) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
            <p className="mb-6">Aucun document n'a été importé ou une erreur s'est produite.</p>
            <Button onClick={() => router.push("/importer-document")}>Réessayer</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Aperçu du document</h1>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">{documentPreview.title || "Document sans titre"}</h2>

            <div className="prose max-w-none">
              {documentPreview.chapters &&
                documentPreview.chapters.slice(0, 2).map((chapter: any, index: number) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{chapter.title}</h3>
                    <div className="text-gray-700">
                      {chapter.content.slice(0, 200)}
                      {chapter.content.length > 200 && "..."}
                    </div>
                  </div>
                ))}

              {(!documentPreview.chapters || documentPreview.chapters.length === 0) && (
                <p className="text-gray-500 italic">Aucun contenu disponible pour l'aperçu.</p>
              )}

              {documentPreview.chapters && documentPreview.chapters.length > 2 && (
                <p className="text-gray-500 italic mt-4">
                  + {documentPreview.chapters.length - 2} autres chapitres non affichés dans cet aperçu.
                </p>
              )}
            </div>
          </Card>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handlePreview}>
              Prévisualiser
            </Button>
            <Button onClick={handleEdit}>Éditer le document</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
