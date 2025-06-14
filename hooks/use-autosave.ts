"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor } from "@/contexts/editor-context"

type AutosaveOptions = {
  interval?: number // Intervalle en millisecondes
  enabled?: boolean // Activer/désactiver l'autosave
  onSave?: () => void // Callback après sauvegarde
  onError?: (error: any) => void // Callback en cas d'erreur
}

export function useAutosave(options: AutosaveOptions = {}) {
  const {
    interval = 30000, // 30 secondes par défaut
    enabled = true,
    onSave,
    onError,
  } = options

  const { isModified, saveDocument } = useEditor()
  const [lastSaveAttempt, setLastSaveAttempt] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fonction de sauvegarde
  const save = async () => {
    if (!isModified || isSaving) return

    setIsSaving(true)
    setError(null)
    setLastSaveAttempt(new Date())

    try {
      await saveDocument()
      onSave?.()
    } catch (err) {
      console.error("Erreur lors de la sauvegarde automatique:", err)
      setError(err as Error)
      onError?.(err)
    } finally {
      setIsSaving(false)
    }
  }

  // Configurer l'autosave
  useEffect(() => {
    if (!enabled) return

    // Nettoyer le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Configurer le nouveau timeout
    timeoutRef.current = setTimeout(save, interval)

    // Nettoyer à la destruction du composant
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, interval, isModified, isSaving])

  // Sauvegarder manuellement
  const saveNow = async () => {
    // Annuler le timeout en cours
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Sauvegarder immédiatement
    await save()

    // Redémarrer le timer si l'autosave est activé
    if (enabled) {
      timeoutRef.current = setTimeout(save, interval)
    }
  }

  return {
    isSaving,
    lastSaveAttempt,
    error,
    saveNow,
  }
}
