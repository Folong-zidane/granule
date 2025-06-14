"use client"

import { useEffect } from "react"
import { useEditor } from "@/contexts/editor-context"

export function useDocumentTitle() {
  const { documentTitle, isModified } = useEditor()

  useEffect(() => {
    // Mettre à jour le titre de la page
    const baseTitle = documentTitle || "Document sans titre"
    const indicator = isModified ? "* " : ""
    document.title = `${indicator}${baseTitle} - DocEnseignant`

    return () => {
      // Restaurer le titre par défaut lors du démontage
      document.title = "DocEnseignant - Plateforme d'édition"
    }
  }, [documentTitle, isModified])

  return documentTitle
}
