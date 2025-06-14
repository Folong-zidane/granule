"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { documentsService, activitiesService } from "@/services"

// Types pour le contenu de l'éditeur
export type EditorBlock = {
  id: string
  type: "paragraph" | "heading" | "list" | "image" | "table" | "quote"
  content: string
  level?: 1 | 2 | 3 | 4 | 5 | 6 // Pour les titres
  format?: "ordered" | "unordered" // Pour les listes
  url?: string // Pour les images
  alt?: string // Pour les images
  caption?: string // Pour les images et tableaux
  rows?: number // Pour les tableaux
  cols?: number // Pour les tableaux
  data?: any // Pour les données de tableau
  fontFamily?: string
  fontSize?: string
  isBold?: boolean
  isItalic?: boolean
  isUnderline?: boolean
  alignment?: string
  textColor?: string
  bgColor?: string
}

type EditorContextType = {
  documentId: string | null
  documentTitle: string
  blocks: EditorBlock[]
  selectedBlockId: string | null
  isModified: boolean
  lastSaved: Date | null
  isLoading: boolean
  error: Error | null

  // Actions
  setDocumentTitle: (title: string) => void
  setBlocks: (blocks: EditorBlock[]) => void
  addBlock: (type: EditorBlock["type"], position?: number) => void
  updateBlock: (id: string, data: Partial<EditorBlock>) => void
  deleteBlock: (id: string) => void
  moveBlockUp: (id: string) => void
  moveBlockDown: (id: string) => void
  selectBlock: (id: string | null) => void
  saveDocument: () => Promise<string>
  loadDocument: (id: string) => Promise<void>
  createNewDocument: () => void
  setIsModified: (value: boolean) => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: ReactNode }) {
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [documentTitle, setDocumentTitle] = useState<string>("Document sans titre")
  const [editorBlocks, setEditorBlocks] = useState<EditorBlock[]>([
    {
      id: "1",
      type: "heading",
      content: "Document sans titre",
      level: 1,
    },
    {
      id: "2",
      type: "paragraph",
      content: "Commencez à écrire votre contenu ici...",
    },
  ])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [isModified, setIsModified] = useState<boolean>(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  // Générer un ID unique pour les blocs
  const generateId = () => `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  // Ajouter un nouveau bloc
  const addBlock = (type: EditorBlock["type"], position?: number, predefinedId?: string) => {
    const newBlock: EditorBlock = {
      id: predefinedId || generateId(),
      type,
      content: "",
    }

    if (type === "heading") {
      newBlock.level = 2
    } else if (type === "list") {
      newBlock.format = "unordered"
    }

    setEditorBlocks((prevBlocks) => {
      const newBlocks = [...prevBlocks]
      if (position !== undefined) {
        newBlocks.splice(position, 0, newBlock)
      } else {
        newBlocks.push(newBlock)
      }
      return newBlocks
    })

    setIsModified(true)
    setSelectedBlockId(newBlock.id)

    return newBlock.id
  }

  // Mettre à jour un bloc existant
  const updateBlock = (id: string, data: Partial<EditorBlock>) => {
    setEditorBlocks((prevBlocks) => prevBlocks.map((block) => (block.id === id ? { ...block, ...data } : block)))
    setIsModified(true)
  }

  // Supprimer un bloc
  const deleteBlock = (id: string) => {
    setEditorBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id))
    setIsModified(true)
  }

  // Déplacer un bloc vers le haut
  const moveBlockUp = (id: string) => {
    setEditorBlocks((prevBlocks) => {
      const index = prevBlocks.findIndex((block) => block.id === id)
      if (index <= 0) return prevBlocks

      const newBlocks = [...prevBlocks]
      const temp = newBlocks[index]
      newBlocks[index] = newBlocks[index - 1]
      newBlocks[index - 1] = temp

      return newBlocks
    })
    setIsModified(true)
  }

  // Déplacer un bloc vers le bas
  const moveBlockDown = (id: string) => {
    setEditorBlocks((prevBlocks) => {
      const index = prevBlocks.findIndex((block) => block.id === id)
      if (index === -1 || index === prevBlocks.length - 1) return prevBlocks

      const newBlocks = [...prevBlocks]
      const temp = newBlocks[index]
      newBlocks[index] = newBlocks[index + 1]
      newBlocks[index + 1] = temp

      return newBlocks
    })
    setIsModified(true)
  }

  // Sélectionner un bloc
  const selectBlock = (id: string | null) => {
    setSelectedBlockId(id)
  }

  // Sauvegarder le document
  const saveDocument = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let savedDocId = documentId
      const documentData = {
        title: documentTitle,
        blocks: editorBlocks,
        preview: editorBlocks.find((b) => b.type === "paragraph")?.content.substring(0, 100) || "",
      }

      if (!documentId) {
        // Créer un nouveau document
        const newDocument = await documentsService.createDocument(documentData)
        savedDocId = newDocument.id
        setDocumentId(savedDocId)
      } else {
        // Mettre à jour un document existant
        await documentsService.updateDocument(documentId, documentData)
      }

      // Enregistrer l'activité
      await activitiesService.createActivity({
        action: documentId ? "modification" : "creation",
        documentId: savedDocId,
        documentTitle,
        user: "user-1", // Utilisateur connecté (à remplacer par l'ID réel)
      })

      setLastSaved(new Date())
      setIsModified(false)
      return savedDocId as string
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Charger un document
  const loadDocument = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const document = await documentsService.getDocumentById(id)

      setDocumentId(document.id)
      setDocumentTitle(document.title)
      setEditorBlocks(document.blocks)
      setLastSaved(new Date(document.lastModified))
      setIsModified(false)
      setSelectedBlockId(null)
    } catch (err) {
      console.error("Erreur lors du chargement:", err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Créer un nouveau document
  const createNewDocument = () => {
    setDocumentId(null)
    setDocumentTitle("Document sans titre")
    setEditorBlocks([
      {
        id: "1",
        type: "heading",
        content: "Document sans titre",
        level: 1,
      },
      {
        id: "2",
        type: "paragraph",
        content: "Commencez à écrire votre contenu ici...",
      },
    ])
    setSelectedBlockId(null)
    setIsModified(false)
    setLastSaved(null)
    setError(null)
  }

  return (
    <EditorContext.Provider
      value={{
        documentId,
        documentTitle,
        blocks: editorBlocks,
        selectedBlockId,
        isModified,
        lastSaved,
        isLoading,
        error,
        setDocumentTitle,
        setBlocks: setEditorBlocks,
        addBlock,
        updateBlock,
        deleteBlock,
        moveBlockUp,
        moveBlockDown,
        selectBlock,
        saveDocument,
        loadDocument,
        createNewDocument,
        setIsModified,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider")
  }
  return context
}
