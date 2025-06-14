"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { EditorBlock } from "./editor-context"

// Types pour les documents
export type Document = {
  id: string
  title: string
  lastModified: Date
  tags: Array<{
    id: string
    name: string
    color: string
  }>
  preview?: string // Aperçu du contenu
  blocks?: EditorBlock[] // Contenu complet
}

// Types pour les modèles
export type Template = {
  id: string
  title: string
  description: string
  category: string
  icon: string
  color: string
  blocks: EditorBlock[]
}

// Types pour les activités
export type Activity = {
  id: string
  action: "creation" | "modification" | "partage" | "telechargement" | "suppression"
  documentId: string
  documentTitle: string
  timestamp: Date
  user?: string
}

type DocumentsContextType = {
  // Documents
  recentDocuments: Document[]
  allDocuments: Document[]
  getDocumentById: (id: string) => Document | undefined
  searchDocuments: (query: string) => Document[]
  createDocument: (title: string, blocks: EditorBlock[]) => Promise<string>
  updateDocument: (id: string, data: Partial<Document>) => Promise<void>
  deleteDocument: (id: string) => Promise<void>

  // Templates
  templates: Template[]
  getTemplateById: (id: string) => Template | undefined
  searchTemplates: (query: string) => Template[]

  // Activities
  activities: Activity[]
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void

  // Tags
  tags: Array<{ id: string; name: string; color: string }>
  addTag: (name: string, color: string) => string
  removeTag: (id: string) => void

  // Loading states
  isLoading: boolean
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined)

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([])
  const [allDocuments, setAllDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [tags, setTags] = useState<Array<{ id: string; name: string; color: string }>>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)

      // Simuler un chargement depuis une API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Documents récents (mock data)
      const mockDocuments: Document[] = [
        {
          id: "doc-1",
          title: "Examen de mathématiques - Terminale S",
          lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures
          tags: [
            { id: "tag-1", name: "Mathématiques", color: "bg-blue-100 text-blue-800" },
            { id: "tag-2", name: "Examen", color: "bg-red-100 text-red-800" },
          ],
          preview: "Examen portant sur les fonctions et les limites...",
        },
        {
          id: "doc-2",
          title: "Plan de cours - Histoire Géographie",
          lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 jour
          tags: [
            { id: "tag-3", name: "Histoire", color: "bg-amber-100 text-amber-800" },
            { id: "tag-4", name: "Plan", color: "bg-green-100 text-green-800" },
          ],
          preview: "Plan détaillé du cours sur la Seconde Guerre mondiale...",
        },
        {
          id: "doc-3",
          title: "Fiche d'exercices - Physique Chimie",
          lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours
          tags: [
            { id: "tag-5", name: "Physique", color: "bg-purple-100 text-purple-800" },
            { id: "tag-6", name: "Exercices", color: "bg-indigo-100 text-indigo-800" },
          ],
          preview: "Série d'exercices sur les lois de Newton...",
        },
        {
          id: "doc-4",
          title: "Correction du devoir - Français",
          lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 semaine
          tags: [
            { id: "tag-7", name: "Français", color: "bg-pink-100 text-pink-800" },
            { id: "tag-8", name: "Correction", color: "bg-orange-100 text-orange-800" },
          ],
          preview: "Correction détaillée du commentaire de texte...",
        },
      ]

      // Templates (mock data)
      const mockTemplates: Template[] = [
        {
          id: "template-1",
          title: "Modèle d'examen",
          description: "Structure complète pour créer un examen",
          category: "Évaluation",
          icon: "FileText",
          color: "bg-blue-50 text-blue-600",
          blocks: [
            { id: "t1-1", type: "heading", content: "Examen de [Matière]", level: 1 },
            { id: "t1-2", type: "paragraph", content: "Durée: [Durée] - Classe: [Classe]" },
            { id: "t1-3", type: "heading", content: "Partie 1: [Titre]", level: 2 },
            { id: "t1-4", type: "paragraph", content: "Instructions pour la partie 1..." },
            { id: "t1-5", type: "heading", content: "Partie 2: [Titre]", level: 2 },
            { id: "t1-6", type: "paragraph", content: "Instructions pour la partie 2..." },
          ],
        },
        {
          id: "template-2",
          title: "Plan de cours",
          description: "Format pour organiser votre plan de cours",
          category: "Planification",
          icon: "BookOpen",
          color: "bg-green-50 text-green-600",
          blocks: [
            { id: "t2-1", type: "heading", content: "Plan de cours - [Matière]", level: 1 },
            { id: "t2-2", type: "heading", content: "Objectifs pédagogiques", level: 2 },
            { id: "t2-3", type: "list", content: "Objectif 1\nObjectif 2\nObjectif 3", format: "unordered" },
            { id: "t2-4", type: "heading", content: "Contenu du cours", level: 2 },
            { id: "t2-5", type: "heading", content: "Séance 1: [Titre]", level: 3 },
            { id: "t2-6", type: "paragraph", content: "Description de la séance 1..." },
          ],
        },
        {
          id: "template-3",
          title: "Fiche d'exercices",
          description: "Modèle pour créer des fiches d'exercices",
          category: "Exercices",
          icon: "ClipboardList",
          color: "bg-amber-50 text-amber-600",
          blocks: [
            { id: "t3-1", type: "heading", content: "Fiche d'exercices - [Matière]", level: 1 },
            { id: "t3-2", type: "paragraph", content: "Classe: [Classe] - Date: [Date]" },
            { id: "t3-3", type: "heading", content: "Exercice 1", level: 2 },
            { id: "t3-4", type: "paragraph", content: "Énoncé de l'exercice 1..." },
            { id: "t3-5", type: "heading", content: "Exercice 2", level: 2 },
            { id: "t3-6", type: "paragraph", content: "Énoncé de l'exercice 2..." },
          ],
        },
      ]

      // Activities (mock data)
      const mockActivities: Activity[] = [
        {
          id: "activity-1",
          action: "modification",
          documentId: "doc-1",
          documentTitle: "Examen de mathématiques",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures
        },
        {
          id: "activity-2",
          action: "creation",
          documentId: "doc-2",
          documentTitle: "Plan de cours - Histoire",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 jour
        },
        {
          id: "activity-3",
          action: "partage",
          documentId: "doc-3",
          documentTitle: "Fiche d'exercices - Physique",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours
        },
        {
          id: "activity-4",
          action: "telechargement",
          documentId: "doc-4",
          documentTitle: "Correction du devoir",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 semaine
        },
      ]

      // Tags (extraits des documents)
      const uniqueTags = new Map()
      mockDocuments.forEach((doc) => {
        doc.tags.forEach((tag) => {
          uniqueTags.set(tag.id, tag)
        })
      })

      setRecentDocuments(mockDocuments)
      setAllDocuments(mockDocuments)
      setTemplates(mockTemplates)
      setActivities(mockActivities)
      setTags(Array.from(uniqueTags.values()))

      setIsLoading(false)
    }

    loadInitialData()
  }, [])

  // Obtenir un document par ID
  const getDocumentById = (id: string) => {
    return allDocuments.find((doc) => doc.id === id)
  }

  // Rechercher des documents
  const searchDocuments = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return allDocuments.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.tags.some((tag) => tag.name.toLowerCase().includes(lowerQuery)),
    )
  }

  // Créer un nouveau document
  const createDocument = async (title: string, blocks: EditorBlock[]): Promise<string> => {
    // Simuler un appel API
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newId = `doc-${Date.now()}`
    const newDoc: Document = {
      id: newId,
      title,
      lastModified: new Date(),
      tags: [],
      blocks,
      preview: blocks.find((b) => b.type === "paragraph")?.content.substring(0, 100) || "",
    }

    setAllDocuments((prev) => [newDoc, ...prev])
    setRecentDocuments((prev) => [newDoc, ...prev].slice(0, 10))

    // Ajouter une activité
    addActivity({
      action: "creation",
      documentId: newId,
      documentTitle: title,
    })

    return newId
  }

  // Mettre à jour un document
  const updateDocument = async (id: string, data: Partial<Document>) => {
    // Simuler un appel API
    await new Promise((resolve) => setTimeout(resolve, 500))

    setAllDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, ...data, lastModified: new Date() } : doc)))

    setRecentDocuments((prev) => {
      const updated = prev.map((doc) => (doc.id === id ? { ...doc, ...data, lastModified: new Date() } : doc))

      // Réorganiser par date de modification
      return updated.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    })

    // Ajouter une activité
    addActivity({
      action: "modification",
      documentId: id,
      documentTitle: data.title || getDocumentById(id)?.title || "Document sans titre",
    })
  }

  // Supprimer un document
  const deleteDocument = async (id: string) => {
    // Simuler un appel API
    await new Promise((resolve) => setTimeout(resolve, 500))

    const docToDelete = getDocumentById(id)

    setAllDocuments((prev) => prev.filter((doc) => doc.id !== id))
    setRecentDocuments((prev) => prev.filter((doc) => doc.id !== id))

    // Ajouter une activité
    if (docToDelete) {
      addActivity({
        action: "suppression",
        documentId: id,
        documentTitle: docToDelete.title,
      })
    }
  }

  // Obtenir un modèle par ID
  const getTemplateById = (id: string) => {
    return templates.find((template) => template.id === id)
  }

  // Rechercher des modèles
  const searchTemplates = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return templates.filter(
      (template) =>
        template.title.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.category.toLowerCase().includes(lowerQuery),
    )
  }

  // Ajouter une activité
  const addActivity = (activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date(),
    }

    setActivities((prev) => [newActivity, ...prev])
  }

  // Ajouter un tag
  const addTag = (name: string, color: string) => {
    const newId = `tag-${Date.now()}`
    const newTag = { id: newId, name, color }

    setTags((prev) => [...prev, newTag])

    return newId
  }

  // Supprimer un tag
  const removeTag = (id: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id))

    // Supprimer également ce tag de tous les documents
    setAllDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        tags: doc.tags.filter((tag) => tag.id !== id),
      })),
    )

    setRecentDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        tags: doc.tags.filter((tag) => tag.id !== id),
      })),
    )
  }

  return (
    <DocumentsContext.Provider
      value={{
        recentDocuments,
        allDocuments,
        getDocumentById,
        searchDocuments,
        createDocument,
        updateDocument,
        deleteDocument,
        templates,
        getTemplateById,
        searchTemplates,
        activities,
        addActivity,
        tags,
        addTag,
        removeTag,
        isLoading,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentsContext)
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentsProvider")
  }
  return context
}
