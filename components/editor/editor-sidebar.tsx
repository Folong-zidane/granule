"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Search,
  FileText,
  ImageIcon,
  Video,
  FileQuestion,
  Plus,
  Heading1,
  Heading2,
  Heading3,
  PenLineIcon as ParagraphIcon,
  ListIcon,
  TableIcon,
} from "lucide-react"
import { useEditor } from "@/contexts/editor-context"
import { toast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function EditorSidebar() {
  const { blocks, addBlock, updateBlock, selectBlock, selectedBlockId } = useEditor()

  const [isOpen, setIsOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [documentStructure, setDocumentStructure] = useState<any[]>([])
  const [filteredResources, setFilteredResources] = useState<any[]>([])
  const dragItemRef = useRef<HTMLDivElement>(null)

  // Ressources disponibles (dans une application réelle, ces données viendraient d'une API)
  const resources = {
    documents: [
      { id: "doc-1", name: "Fiche de cours.pdf", type: "document", url: "/documents/fiche-cours.pdf" },
      { id: "doc-2", name: "Exercices supplémentaires.docx", type: "document", url: "/documents/exercices.docx" },
    ],
    images: [
      {
        id: "img-1",
        name: "Diagramme.png",
        type: "image",
        url: "/placeholder.svg?height=300&width=400",
        thumbnail: "/placeholder.svg?height=50&width=50",
      },
      {
        id: "img-2",
        name: "Graphique.jpg",
        type: "image",
        url: "/placeholder.svg?height=300&width=400",
        thumbnail: "/placeholder.svg?height=50&width=50",
      },
    ],
    videos: [
      {
        id: "vid-1",
        name: "Tutoriel.mp4",
        type: "video",
        url: "/videos/tutoriel.mp4",
        thumbnail: "/placeholder.svg?height=50&width=50",
      },
    ],
    quizzes: [{ id: "quiz-1", name: "QCM Chapitre 1", type: "quiz", url: "/quizzes/qcm-chapitre-1" }],
  }

  // Générer la structure du document à partir des blocs
  useEffect(() => {
    const structure: any[] = []
    let currentSection: any = null
    let currentSubsection: any = null

    blocks.forEach((block, index) => {
      if (block.type === "heading") {
        const level = block.level || 1

        if (level === 1) {
          // Titre principal
          currentSection = {
            id: block.id,
            title: block.content,
            level: 1,
            children: [],
          }
          structure.push(currentSection)
          currentSubsection = null
        } else if (level === 2 && currentSection) {
          // Sous-titre
          currentSubsection = {
            id: block.id,
            title: block.content,
            level: 2,
            children: [],
          }
          currentSection.children.push(currentSubsection)
        } else if (level === 3 && currentSubsection) {
          // Sous-sous-titre
          currentSubsection.children.push({
            id: block.id,
            title: block.content,
            level: 3,
          })
        }
      }
    })

    setDocumentStructure(structure)
  }, [blocks])

  // Filtrer les ressources en fonction de la recherche
  useEffect(() => {
    if (!searchQuery) {
      setFilteredResources(resources)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = {
      documents: resources.documents.filter((doc) => doc.name.toLowerCase().includes(query)),
      images: resources.images.filter((img) => img.name.toLowerCase().includes(query)),
      videos: resources.videos.filter((vid) => vid.name.toLowerCase().includes(query)),
      quizzes: resources.quizzes.filter((quiz) => quiz.name.toLowerCase().includes(query)),
    }

    setFilteredResources(filtered)
  }, [searchQuery])

  // Naviguer vers un bloc spécifique
  const navigateToBlock = (blockId: string) => {
    selectBlock(blockId)

    // Faire défiler jusqu'au bloc sélectionné
    const blockElement = document.getElementById(`block-${blockId}`)
    if (blockElement) {
      blockElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Ajouter une ressource à l'éditeur
  const addResourceToEditor = (resource: any) => {
    const selectedIndex = blocks.findIndex((block) => block.id === selectedBlockId)
    const insertIndex = selectedIndex !== -1 ? selectedIndex + 1 : blocks.length

    // Générer un ID unique pour le nouveau bloc
    const newBlockId = `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    switch (resource.type) {
      case "image":
        // Ajouter un bloc d'image avec l'ID prédéfini
        addBlock("image", insertIndex, newBlockId)

        // Mettre à jour le bloc avec les données d'image
        updateBlock(newBlockId, {
          type: "image",
          url: resource.url,
          alt: resource.name,
          caption: resource.name,
        })

        toast({
          title: "Image ajoutée",
          description: `L'image "${resource.name}" a été ajoutée au document.`,
        })
        break

      case "video":
      case "document":
      case "quiz":
        // Ajouter un bloc de paragraphe avec l'ID prédéfini
        addBlock("paragraph", insertIndex, newBlockId)

        // Mettre à jour le bloc avec un lien
        updateBlock(newBlockId, {
          content: `<a href="${resource.url}" target="_blank">${resource.name}</a>`,
        })

        toast({
          title: `${resource.type === "document" ? "Document" : "Quiz"} ajouté`,
          description: `Le ${resource.type === "document" ? "document" : "quiz"} "${resource.name}" a été ajouté au document.`,
        })
        break
    }
  }

  // Gérer le glisser-déposer
  const handleDragStart = (e: React.DragEvent, resource: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(resource))
    e.dataTransfer.effectAllowed = "copy"

    // Ajouter une image fantôme pour le glisser-déposer
    if (dragItemRef.current) {
      e.dataTransfer.setDragImage(dragItemRef.current, 20, 20)
    }
  }

  // Ajouter un nouveau bloc de structure
  const addStructureBlock = (type: string, level = 1) => {
    const selectedIndex = blocks.findIndex((block) => block.id === selectedBlockId)
    const insertIndex = selectedIndex !== -1 ? selectedIndex + 1 : blocks.length

    switch (type) {
      case "heading":
        addBlock("heading", insertIndex)
        setTimeout(() => {
          const newBlockId = blocks[insertIndex]?.id
          if (newBlockId) {
            updateBlock(newBlockId, {
              level: level,
              content: `Nouveau titre niveau ${level}`,
            })
          }
        }, 0)
        break

      case "paragraph":
        addBlock("paragraph", insertIndex)
        break

      case "list":
        addBlock("list", insertIndex)
        setTimeout(() => {
          const newBlockId = blocks[insertIndex]?.id
          if (newBlockId) {
            updateBlock(newBlockId, {
              format: "unordered",
              content: "• Élément de liste\n• Élément de liste\n• Élément de liste",
            })
          }
        }, 0)
        break

      case "table":
        addBlock("table", insertIndex)
        setTimeout(() => {
          const newBlockId = blocks[insertIndex]?.id
          if (newBlockId) {
            updateBlock(newBlockId, {
              content: `<table style="width:100%; border-collapse: collapse;">
                <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Cellule</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">Cellule</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">Cellule</td>
                  <td style="border: 1px solid #ccc; padding: 8px;">Cellule</td>
                </tr>
              </table>`,
              rows: 2,
              cols: 2,
            })
          }
        }, 0)
        break
    }
  }

  // Rendu récursif de la structure du document
  const renderStructureItem = (item: any, depth = 0) => {
    return (
      <div key={item.id} className="mb-1">
        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 pl-${depth * 4 + 2} text-sm ${selectedBlockId === item.id ? "bg-blue-50 text-blue-700" : ""}`}
          onClick={() => navigateToBlock(item.id)}
        >
          {item.level === 1 ? (
            <Heading1 className="h-4 w-4" />
          ) : item.level === 2 ? (
            <Heading2 className="h-4 w-4" />
          ) : (
            <Heading3 className="h-4 w-4" />
          )}
          <span className="truncate">{item.title}</span>
        </Button>

        {item.children && item.children.length > 0 && (
          <div className="ml-4">{item.children.map((child: any) => renderStructureItem(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  // Rendu d'une ressource avec bouton d'ajout
  const renderResource = (resource: any) => {
    const Icon =
      resource.type === "document"
        ? FileText
        : resource.type === "image"
          ? ImageIcon
          : resource.type === "video"
            ? Video
            : FileQuestion

    return (
      <div
        key={resource.id}
        className="flex items-center group"
        draggable
        onDragStart={(e) => handleDragStart(e, resource)}
      >
        <Button variant="ghost" className="w-full justify-start gap-2 text-sm pr-10 relative">
          <Icon className="h-4 w-4" />
          <span className="truncate">{resource.name}</span>

          <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      addResourceToEditor(resource)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ajouter au document</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-64 border-r border-gray-200 bg-white h-full overflow-hidden flex flex-col">
      <Tabs defaultValue="structure" className="flex flex-col h-full">
        <TabsList className="w-full">
          <TabsTrigger value="structure" className="flex-1">
            Structure
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex-1">
            Ressources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="p-0 flex-1 overflow-hidden flex flex-col">
          <div className="p-3 flex-1 overflow-hidden flex flex-col">
            <div className="relative mb-4">
              <div className="flex items-center gap-1 mb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => addStructureBlock("heading", 1)}
                      >
                        <Heading1 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ajouter un titre</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => addStructureBlock("heading", 2)}
                      >
                        <Heading2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ajouter un sous-titre</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => addStructureBlock("paragraph")}
                      >
                        <ParagraphIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ajouter un paragraphe</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => addStructureBlock("list")}
                      >
                        <ListIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ajouter une liste</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => addStructureBlock("table")}
                      >
                        <TableIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ajouter un tableau</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Search className="absolute left-2 top-[calc(2.5rem+2px)] h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {documentStructure.length > 0 ? (
                  documentStructure.map((item) => renderStructureItem(item))
                ) : (
                  <div className="text-sm text-gray-500 p-2 text-center">
                    Aucune structure détectée. Ajoutez des titres à votre document.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="p-0 flex-1 overflow-hidden flex flex-col">
          <div className="p-3 flex-1 overflow-hidden flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {filteredResources.documents?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Documents</h3>
                    <div className="space-y-1">{filteredResources.documents.map((doc) => renderResource(doc))}</div>
                  </div>
                )}

                {filteredResources.images?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Images</h3>
                    <div className="space-y-1">{filteredResources.images.map((img) => renderResource(img))}</div>
                  </div>
                )}

                {filteredResources.videos?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Vidéos</h3>
                    <div className="space-y-1">{filteredResources.videos.map((vid) => renderResource(vid))}</div>
                  </div>
                )}

                {filteredResources.quizzes?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Quiz</h3>
                    <div className="space-y-1">{filteredResources.quizzes.map((quiz) => renderResource(quiz))}</div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      {/* Élément invisible pour le glisser-déposer */}
      <div
        ref={dragItemRef}
        className="fixed -left-full -top-full w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center border border-blue-300"
      >
        <Plus className="h-4 w-4 text-blue-600" />
      </div>
    </div>
  )
}
