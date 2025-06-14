"use client"

import { useEffect } from "react"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Menu,
  Save,
  User,
  ChevronDown,
  Search,
  Replace,
  Maximize,
  Minimize,
  BookOpen,
  Pencil,
  Copy,
} from "lucide-react"
import { useSidebar } from "@/components/sidebar-provider"
import { useEditor } from "@/contexts/editor-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function EditorHeader() {
  const router = useRouter()
  const { isOpen, toggleSidebar } = useSidebar()
  const { documentTitle, setDocumentTitle, saveDocument, createNewDocument, loadDocument, isModified, documentId } =
    useEditor()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<"edit" | "read">("edit")
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [replaceText, setReplaceText] = useState("")
  const [showAboutDialog, setShowAboutDialog] = useState(false)
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [publishedDocId, setPublishedDocId] = useState<string | null>(null)
  const [accessCode, setAccessCode] = useState<string>("")
  const [shareLink, setShareLink] = useState<string>("")
  const [showShareDialog, setShowShareDialog] = useState(false)

  // Gestion du titre du document
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentTitle(e.target.value)
  }

  // Fonctions du menu Fichier
  const handleNewDocument = () => {
    if (isModified) {
      if (confirm("Vous avez des modifications non enregistrées. Voulez-vous continuer?")) {
        createNewDocument()
        toast({
          title: "Nouveau document créé",
          description: "Un nouveau document vide a été créé.",
        })
      }
    } else {
      createNewDocument()
      toast({
        title: "Nouveau document créé",
        description: "Un nouveau document vide a été créé.",
      })
    }
  }

  const handleOpenDocument = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Vérifier si le fichier a le bon format
      if (data.title && data.blocks) {
        createNewDocument() // Réinitialiser d'abord
        setDocumentTitle(data.title)

        // Ici, vous devriez utiliser une fonction du contexte pour charger les blocs
        // Pour l'instant, nous affichons juste un message de succès
        toast({
          title: "Document ouvert",
          description: `Le document "${data.title}" a été ouvert avec succès.`,
        })
      } else {
        throw new Error("Format de fichier invalide")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le fichier. Format invalide.",
        variant: "destructive",
      })
    }

    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSaveDocument = async () => {
    try {
      await saveDocument()
      toast({
        title: "Document enregistré",
        description: "Votre document a été enregistré avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le document.",
        variant: "destructive",
      })
    }
  }

  const handleSaveDocumentAs = () => {
    // Créer un objet avec les données du document
    const documentData = {
      title: documentTitle,
      // Vous devriez récupérer les blocs depuis le contexte
      blocks: [],
    }

    // Convertir en JSON et créer un blob
    const blob = new Blob([JSON.stringify(documentData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Créer un lien de téléchargement et cliquer dessus
    const a = document.createElement("a")
    a.href = url
    a.download = `${documentTitle.replace(/\s+/g, "_")}.json`
    document.body.appendChild(a)
    a.click()

    // Nettoyer
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Document exporté",
      description: "Votre document a été exporté au format JSON.",
    })
  }

  const handleExportPDF = () => {
    toast({
      title: "Export PDF",
      description: "Fonctionnalité d'export PDF en cours de développement.",
    })

    // Dans une implémentation réelle, vous utiliseriez une bibliothèque comme jsPDF
    // ou une API côté serveur pour générer le PDF
  }

  const handlePrint = () => {
    window.print()
  }

  // Fonctions du menu Édition
  const handleUndo = () => {
    // À implémenter avec l'historique des modifications
    toast({
      title: "Annuler",
      description: "Fonctionnalité d'annulation en cours de développement.",
    })
  }

  const handleRedo = () => {
    // À implémenter avec l'historique des modifications
    toast({
      title: "Rétablir",
      description: "Fonctionnalité de rétablissement en cours de développement.",
    })
  }

  const handleCut = () => {
    document.execCommand("cut")
  }

  const handleCopy = () => {
    document.execCommand("copy")
  }

  const handlePaste = () => {
    document.execCommand("paste")
  }

  const handleSearch = () => {
    setShowSearchDialog(true)
  }

  const performSearch = () => {
    if (!searchText) return

    // Implémentation de la recherche
    // Dans une application réelle, vous utiliseriez une fonction du contexte
    toast({
      title: "Recherche",
      description: `Recherche de "${searchText}" en cours...`,
    })
  }

  const performReplace = () => {
    if (!searchText) return

    // Implémentation du remplacement
    // Dans une application réelle, vous utiliseriez une fonction du contexte
    toast({
      title: "Remplacement",
      description: `Remplacement de "${searchText}" par "${replaceText}" en cours...`,
    })
  }

  // Fonctions du menu Affichage
  const toggleViewMode = () => {
    setViewMode(viewMode === "edit" ? "read" : "edit")
    toast({
      title: `Mode ${viewMode === "edit" ? "lecture" : "édition"}`,
      description: `Passage en mode ${viewMode === "edit" ? "lecture" : "édition"}.`,
    })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true)
        })
        .catch((err) => {
          toast({
            title: "Erreur",
            description: "Impossible de passer en mode plein écran.",
            variant: "destructive",
          })
        })
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false)
        })
        .catch((err) => {
          toast({
            title: "Erreur",
            description: "Impossible de quitter le mode plein écran.",
            variant: "destructive",
          })
        })
    }
  }

  // Fonction pour publier le document
  const handlePublish = async () => {
    try {
      // Sauvegarder d'abord le document
      const docId = await saveDocument()

      // Générer un code d'accès unique (dans une application réelle, ce serait plus sécurisé)
      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      // Générer un lien de partage
      const shareLink = `${window.location.origin}/cours/${docId}`

      // Simuler une API pour marquer le document comme publié
      localStorage.setItem(`document_${docId}_published`, "true")
      localStorage.setItem(`document_${docId}_accessCode`, accessCode)
      localStorage.setItem(`document_${docId}_shareLink`, shareLink)

      // Afficher le dialogue de confirmation avec le code et le lien
      setPublishedDocId(docId)
      setAccessCode(accessCode)
      setShareLink(shareLink)
      setShowPublishDialog(false)
      setShowShareDialog(true)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de publier le document.",
        variant: "destructive",
      })
    }
  }

  // Écouter les événements de changement de plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isOpen && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Input
            value={documentTitle}
            onChange={handleTitleChange}
            className="h-8 w-64 border-none focus-visible:ring-0 text-lg font-medium"
          />
          {isModified && <span className="text-sm text-gray-500">*</span>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 mr-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Fichier
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleNewDocument}>
                  Nouveau
                  <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenDocument}>
                  Ouvrir
                  <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSaveDocument}>
                  Enregistrer
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSaveDocumentAs}>
                  Enregistrer sous...
                  <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportPDF}>Exporter en PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  Imprimer
                  <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Édition
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleUndo}>
                  Annuler
                  <DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRedo}>
                  Rétablir
                  <DropdownMenuShortcut>⇧⌘Z</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCut}>
                  Couper
                  <DropdownMenuShortcut>⌘X</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  Copier
                  <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePaste}>
                  Coller
                  <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSearch}>
                  Rechercher
                  <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Affichage
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={toggleViewMode}>
                  {viewMode === "edit" ? (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Mode lecture
                    </>
                  ) : (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      Mode édition
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleSidebar}>
                  {isOpen ? "Masquer" : "Afficher"} la barre latérale
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <>
                      <Minimize className="mr-2 h-4 w-4" />
                      Quitter le plein écran
                    </>
                  ) : (
                    <>
                      <Maximize className="mr-2 h-4 w-4" />
                      Plein écran
                    </>
                  )}
                  <DropdownMenuShortcut>F11</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" className="gap-1" onClick={handleSaveDocument}>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enregistrer le document (⌘S)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700 ml-2"
            onClick={() => setShowPublishDialog(true)}
          >
            Publier
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Paramètres</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Input file caché pour l'ouverture de fichiers */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

      {/* Dialogue de recherche et remplacement */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechercher et remplacer</DialogTitle>
            <DialogDescription>
              Recherchez du texte dans votre document et remplacez-le si nécessaire.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="search" className="text-sm font-medium">
                Rechercher
              </label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Texte à rechercher..."
                />
                <Button onClick={performSearch} size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="replace" className="text-sm font-medium">
                Remplacer par
              </label>
              <div className="flex gap-2">
                <Input
                  id="replace"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="Texte de remplacement..."
                />
                <Button onClick={performReplace} size="sm">
                  <Replace className="h-4 w-4 mr-2" />
                  Remplacer
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSearchDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de publication */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publier le document</DialogTitle>
            <DialogDescription>Configurez les options de publication et de partage de votre cours.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="access-type">Type d'accès</Label>
              <Select defaultValue="private">
                <SelectTrigger id="access-type">
                  <SelectValue placeholder="Sélectionnez le type d'accès" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (accessible à tous)</SelectItem>
                  <SelectItem value="private">Privé (accessible par code ou lien)</SelectItem>
                  <SelectItem value="restricted">Restreint (accessible à certains groupes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="download-options">Options de téléchargement</Label>
              <Select defaultValue="allowed">
                <SelectTrigger id="download-options">
                  <SelectValue placeholder="Options de téléchargement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowed">Autoriser le téléchargement des ressources</SelectItem>
                  <SelectItem value="disallowed">Interdire le téléchargement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Checkbox id="enable-comments" />
                <span>Activer les commentaires</span>
              </Label>
            </div>

            <p className="text-sm text-gray-500">Vous pourrez modifier ces paramètres après la publication.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
              Publier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de partage après publication */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cours publié avec succès!</DialogTitle>
            <DialogDescription>
              Partagez ce cours avec vos élèves en utilisant le code ou le lien ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Code d'accès</Label>
              <div className="flex items-center gap-2">
                <Input value={accessCode} readOnly className="font-mono text-center text-lg" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(accessCode)
                    toast({ title: "Code copié!" })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Partagez ce code avec vos élèves pour qu'ils puissent accéder au cours.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Lien de partage</Label>
              <div className="flex items-center gap-2">
                <Input value={shareLink} readOnly className="text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink)
                    toast({ title: "Lien copié!" })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowShareDialog(false)
                router.push("/mes-cours")
              }}
            >
              Voir mes cours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
