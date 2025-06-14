"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Printer, Download } from "lucide-react"

export default function PreviewPage() {
  const router = useRouter()
  const [document, setDocument] = useState<any>(null)

  useEffect(() => {
    // Récupérer le document parsé depuis le localStorage
    const parsedDocumentJson = localStorage.getItem("parsedDocument")

    if (parsedDocumentJson) {
      const parsedDocument = JSON.parse(parsedDocumentJson)
      setDocument(parsedDocument)
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (!document) return

    // Créer un blob avec le contenu du document
    const blob = new Blob([JSON.stringify(document, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Créer un lien de téléchargement et cliquer dessus
    const a = document.createElement("a")
    a.href = url
    a.download = `${document.title || "document"}.json`
    document.body.appendChild(a)
    a.click()

    // Nettoyer
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!document) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
            <p className="mb-6">Aucun document n'a été trouvé pour la prévisualisation.</p>
            <Button onClick={() => router.push("/importer-document")}>Importer un document</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimer
              </Button>
              <Button variant="outline" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
            </div>
          </div>

          <Card className="p-8 print:shadow-none print:border-none" id="preview-content">
            <h1 className="text-3xl font-bold mb-6 text-center">{document.title || "Document sans titre"}</h1>

            <div className="prose max-w-none">
              {document.chapters &&
                document.chapters.map((chapter: any, index: number) => (
                  <div key={index} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">{chapter.title}</h2>
                    <div className="text-gray-700 whitespace-pre-line">{chapter.content}</div>
                  </div>
                ))}

              {(!document.chapters || document.chapters.length === 0) && (
                <p className="text-gray-500 italic">Ce document ne contient aucun contenu.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
