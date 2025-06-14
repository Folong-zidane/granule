"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUp, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { parseDocument } from "@/lib/document-parser"
import { toast } from "@/components/ui/use-toast"

export function ImportDocumentForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documentUrl, setDocumentUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImport = async () => {
    setIsLoading(true)

    try {
      let documentContent: string | ArrayBuffer | null = null

      if (activeTab === "upload" && selectedFile) {
        // Lire le fichier local
        documentContent = await readFileAsText(selectedFile)
      } else if (activeTab === "url" && documentUrl) {
        // Récupérer le document depuis l'URL
        const response = await fetch(documentUrl)
        const contentType = response.headers.get("content-type") || ""
        if (
          contentType.includes("application/pdf") ||
          contentType.includes("application/vnd.openxmlformats") ||
          contentType.includes("application/msword") ||
          contentType.includes("application/zip")
        ) {
          documentContent = await response.arrayBuffer()
        } else {
          documentContent = await response.text()
        }
      } else {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un fichier ou entrer une URL valide.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (documentContent) {
        // Parser le document
        const parsedDocument = parseDocument(documentContent.toString())

        // Simuler l'enregistrement du document parsé
        localStorage.setItem("parsedDocument", JSON.stringify(parsedDocument))

        // Rediriger vers la page d'aperçu
        router.push("/apercu-document")
      }
    } catch (error) {
      console.error("Erreur lors de l'importation:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'importation du document.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const readFileAsText = (file: File): Promise<string | ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      // Déterminer si nous devons lire comme texte ou comme binaire
      const binaryTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
        "application/msword", // DOC
        "application/zip",
      ]

      if (binaryTypes.includes(file.type)) {
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      } else {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsText(file)
      }
    })
  }

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upload">Importer un fichier</TabsTrigger>
          <TabsTrigger value="url">Importer depuis une URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Glissez-déposez votre fichier ici</h3>
              <p className="text-gray-500 mb-4">ou</p>
              <Button onClick={handleBrowseClick}>Parcourir</Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".doc,.docx,.pdf,.txt,.rtf,.odt"
              />
            </div>

            {selectedFile && (
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="font-medium">Fichier sélectionné:</p>
                <p className="text-gray-600">{selectedFile.name}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-url">URL du document</Label>
              <Input
                id="document-url"
                placeholder="https://exemple.com/document.pdf"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Entrez l'URL d'un document accessible publiquement (PDF, DOCX, etc.)
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" className="mr-2" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button onClick={handleImport} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importation...
            </>
          ) : (
            "Importer"
          )}
        </Button>
      </div>
    </Card>
  )
}
