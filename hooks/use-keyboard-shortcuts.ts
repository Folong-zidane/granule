"use client"

import { useEffect, useCallback } from "react"
import { useEditor } from "@/contexts/editor-context"

type KeyboardShortcut = {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  preventDefault?: boolean
}

export function useKeyboardShortcuts() {
  const { saveDocument, addBlock, selectedBlockId, blocks, updateBlock, deleteBlock } = useEditor()

  // Définir les raccourcis clavier
  const shortcuts: KeyboardShortcut[] = [
    // Sauvegarde (Ctrl+S)
    {
      key: "s",
      ctrlKey: true,
      action: () => saveDocument(),
      preventDefault: true,
    },

    // Nouveau paragraphe (Entrée à la fin d'un bloc)
    {
      key: "Enter",
      action: () => {
        if (!selectedBlockId) return

        const selectedIndex = blocks.findIndex((block) => block.id === selectedBlockId)
        if (selectedIndex === -1) return

        // Ajouter un nouveau paragraphe après le bloc sélectionné
        addBlock("paragraph", selectedIndex + 1)
      },
      preventDefault: false, // Permettre le comportement par défaut dans les champs de texte
    },

    // Supprimer un bloc (Suppr ou Backspace quand vide)
    {
      key: "Delete",
      action: () => {
        if (!selectedBlockId) return
        deleteBlock(selectedBlockId)
      },
      preventDefault: true,
    },

    // Mettre en gras (Ctrl+B)
    {
      key: "b",
      ctrlKey: true,
      action: () => {
        // Cette fonction serait implémentée dans un éditeur de texte riche
        console.log("Mettre en gras")
      },
      preventDefault: true,
    },

    // Mettre en italique (Ctrl+I)
    {
      key: "i",
      ctrlKey: true,
      action: () => {
        // Cette fonction serait implémentée dans un éditeur de texte riche
        console.log("Mettre en italique")
      },
      preventDefault: true,
    },

    // Souligner (Ctrl+U)
    {
      key: "u",
      ctrlKey: true,
      action: () => {
        // Cette fonction serait implémentée dans un éditeur de texte riche
        console.log("Souligner")
      },
      preventDefault: true,
    },
  ]

  // Gestionnaire d'événements pour les raccourcis clavier
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignorer les événements dans les champs de saisie (sauf pour certains raccourcis spécifiques)
      const isInputElement =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable

      // Vérifier chaque raccourci
      for (const shortcut of shortcuts) {
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey) &&
          (shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey) &&
          (shortcut.altKey === undefined || event.altKey === shortcut.altKey) &&
          (shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey)
        ) {
          // Si on est dans un champ de saisie et que le raccourci ne doit pas être appliqué
          if (isInputElement && !shortcut.preventDefault) {
            continue
          }

          // Empêcher le comportement par défaut si nécessaire
          if (shortcut.preventDefault) {
            event.preventDefault()
          }

          // Exécuter l'action
          shortcut.action()
          break
        }
      }
    },
    [selectedBlockId, blocks],
  )

  // Ajouter l'écouteur d'événements
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  return { handleKeyDown }
}
