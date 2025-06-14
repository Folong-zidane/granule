"use client"

import { useCallback } from "react"
import { useDocuments } from "@/contexts/documents-context"
import { useEditor } from "@/contexts/editor-context"

export function useTemplate() {
  const { templates, getTemplateById } = useDocuments()
  const { setDocumentTitle, blocks, setIsModified } = useEditor()

  // Appliquer un modèle au document actuel
  const applyTemplate = useCallback(
    (templateId: string) => {
      const template = getTemplateById(templateId)

      if (!template) {
        console.error(`Template with ID ${templateId} not found`)
        return false
      }

      // Appliquer le modèle
      setDocumentTitle(`Nouveau ${template.title}`)

      // Remplacer les blocs actuels par ceux du modèle
      // Note: Dans une implémentation réelle, vous voudriez probablement
      // utiliser une fonction du contexte de l'éditeur pour cela
      // setBlocks(template.blocks)

      setIsModified(true)

      return true
    },
    [getTemplateById, setDocumentTitle, setIsModified],
  )

  // Créer un nouveau document à partir d'un modèle
  const createFromTemplate = useCallback(
    async (templateId: string) => {
      const template = getTemplateById(templateId)

      if (!template) {
        console.error(`Template with ID ${templateId} not found`)
        return null
      }

      // Dans une implémentation réelle, vous appelleriez une fonction
      // du contexte de l'éditeur ou du contexte des documents pour créer
      // un nouveau document à partir du modèle

      return {
        success: true,
        templateName: template.title,
      }
    },
    [getTemplateById],
  )

  return {
    templates,
    applyTemplate,
    createFromTemplate,
  }
}
