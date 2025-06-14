"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ImageIcon,
  Table,
  List,
  ListOrdered,
  Palette,
  Type,
  FileQuestion,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEditor } from "@/contexts/editor-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AddQCMDialog } from "@/components/editor/add-qcm-dialog"

export function EditorToolbar() {
  const { blocks, updateBlock, selectedBlockId, addBlock, setIsModified } = useEditor()

  // États pour les dialogues et popovers
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [showTextColorPopover, setShowTextColorPopover] = useState(false)
  const [showBgColorPopover, setShowBgColorPopover] = useState(false)
  const [showQCMDialog, setShowQCMDialog] = useState(false)

  // États pour les dialogues
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [tableRows, setTableRows] = useState(2)
  const [tableCols, setTableCols] = useState(2)

  // État pour suivre le formatage actuel
  const [currentFormatting, setCurrentFormatting] = useState({
    fontFamily: "arial",
    fontSize: "16",
    isBold: false,
    isItalic: false,
    isUnderline: false,
    alignment: "left",
    textColor: "#000000",
    bgColor: "transparent",
  })

  // Couleurs prédéfinies
  const predefinedColors = [
    "#000000",
    "#5c5c5c",
    "#8a8a8a",
    "#cfcfcf",
    "#ffffff",
    "#ff0000",
    "#ff8000",
    "#ffff00",
    "#80ff00",
    "#00ff00",
    "#00ff80",
    "#00ffff",
    "#0080ff",
    "#0000ff",
    "#8000ff",
    "#ff00ff",
    "#ff0080",
    "#4a86e8",
    "#6aa84f",
    "#e69138",
  ]

  // Mettre à jour le formatage en fonction du bloc sélectionné
  useEffect(() => {
    if (!selectedBlockId) return

    const selectedBlock = blocks.find((block) => block.id === selectedBlockId)
    if (!selectedBlock) return

    // Extraire les informations de formatage du bloc sélectionné
    // Dans une implémentation réelle, ces informations seraient stockées dans le bloc
    // Pour cet exemple, nous utilisons des valeurs par défaut
    setCurrentFormatting({
      fontFamily: selectedBlock.fontFamily || "arial",
      fontSize: selectedBlock.fontSize || "16",
      isBold: selectedBlock.isBold || false,
      isItalic: selectedBlock.isItalic || false,
      isUnderline: selectedBlock.isUnderline || false,
      alignment: selectedBlock.alignment || "left",
      textColor: selectedBlock.textColor || "#000000",
      bgColor: selectedBlock.bgColor || "transparent",
    })
  }, [selectedBlockId, blocks])

  // Fonction pour appliquer le formatage au bloc sélectionné
  const applyFormatting = (formatting) => {
    if (!selectedBlockId) {
      toast({
        title: "Aucun bloc sélectionné",
        description: "Veuillez sélectionner un bloc de texte pour appliquer le formatage.",
        variant: "destructive",
      })
      return
    }

    updateBlock(selectedBlockId, formatting)
    setIsModified(true)

    // Mettre à jour l'état local du formatage
    setCurrentFormatting((prev) => ({
      ...prev,
      ...formatting,
    }))
  }

  // Gestionnaires pour les actions de formatage
  const handleFontFamilyChange = (value) => {
    applyFormatting({ fontFamily: value })
  }

  const handleFontSizeChange = (value) => {
    applyFormatting({ fontSize: value })
  }

  const toggleBold = () => {
    applyFormatting({ isBold: !currentFormatting.isBold })
  }

  const toggleItalic = () => {
    applyFormatting({ isItalic: !currentFormatting.isItalic })
  }

  const toggleUnderline = () => {
    applyFormatting({ isUnderline: !currentFormatting.isUnderline })
  }

  const setAlignment = (alignment) => {
    applyFormatting({ alignment })
  }

  const setTextColor = (color) => {
    applyFormatting({ textColor: color })
    setShowTextColorPopover(false)
  }

  const setBgColor = (color) => {
    applyFormatting({ bgColor: color })
    setShowBgColorPopover(false)
  }

  // Gestionnaires pour l'insertion d'éléments
  const insertImage = () => {
    if (!imageUrl) {
      toast({
        title: "URL manquante",
        description: "Veuillez entrer une URL d'image valide.",
        variant: "destructive",
      })
      return
    }

    // Générer un ID unique pour le nouveau bloc
    const newBlockId = `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Ajouter un nouveau bloc d'image après le bloc sélectionné
    const selectedIndex = blocks.findIndex((block) => block.id === selectedBlockId)
    const insertIndex = selectedIndex !== -1 ? selectedIndex + 1 : blocks.length

    // Ajouter le bloc avec l'ID prédéfini
    addBlock("image", insertIndex, newBlockId)

    // Mettre à jour le bloc avec les données d'image
    updateBlock(newBlockId, {
      type: "image",
      content: "",
      url: imageUrl,
      alt: imageAlt || "Image",
    })

    setIsModified(true)
    setShowImageDialog(false)
    setImageUrl("")
    setImageAlt("")

    toast({
      title: "Image insérée",
      description: "L'image a été insérée dans le document.",
    })
  }

  const insertTable = () => {
    // Créer une structure de tableau HTML simple
    let tableHTML = '<table style="width:100%; border-collapse: collapse;">'

    for (let i = 0; i < tableRows; i++) {
      tableHTML += "<tr>"
      for (let j = 0; j < tableCols; j++) {
        tableHTML += '<td style="border: 1px solid #ccc; padding: 8px;">Cellule</td>'
      }
      tableHTML += "</tr>"
    }

    tableHTML += "</table>"

    // Générer un ID unique pour le nouveau bloc
    const newTableId = `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Ajouter un nouveau bloc de tableau après le bloc sélectionné
    const selectedIndex = blocks.findIndex((block) => block.id === selectedBlockId)
    const insertIndex = selectedIndex !== -1 ? selectedIndex + 1 : blocks.length

    // Ajouter le bloc avec l'ID prédéfini
    addBlock("table", insertIndex, newTableId)

    // Mettre à jour le bloc avec les données de tableau
    updateBlock(newTableId, {
      content: tableHTML,
      rows: tableRows,
      cols: tableCols,
    })

    setIsModified(true)
    setShowTableDialog(false)
    setTableRows(2)
    setTableCols(2)

    toast({
      title: "Tableau inséré",
      description: `Un tableau de ${tableRows}×${tableCols} a été inséré dans le document.`,
    })
  }

  const insertList = (format) => {
    const listType = format === "ordered" ? "ordered" : "unordered"
    const listPrefix = format === "ordered" ? "1. " : "• "

    // Générer un ID unique pour le nouveau bloc
    const newListId = `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Ajouter un nouveau bloc de liste après le bloc sélectionné
    const selectedIndex = blocks.findIndex((block) => block.id === selectedBlockId)
    const insertIndex = selectedIndex !== -1 ? selectedIndex + 1 : blocks.length

    // Ajouter le bloc avec l'ID prédéfini
    addBlock("list", insertIndex, newListId)

    // Mettre à jour le bloc avec les données de liste
    updateBlock(newListId, {
      content: `${listPrefix}Élément de liste\n${listPrefix}Élément de liste\n${listPrefix}Élément de liste`,
      format: listType,
    })

    setIsModified(true)

    toast({
      title: "Liste insérée",
      description: `Une liste ${format === "ordered" ? "numérotée" : "à puces"} a été insérée dans le document.`,
    })
  }

  const insertQCM = (qcmData) => {
    // Générer un ID unique pour le nouveau bloc
    const newQCMId = `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Ajouter un nouveau bloc de QCM après le bloc sélectionné
    const selectedIndex = blocks.findIndex((block) => block.id === selectedBlockId)
    const insertIndex = selectedIndex !== -1 ? selectedIndex + 1 : blocks.length

    // Ajouter le bloc avec l'ID prédéfini
    addBlock("qcm", insertIndex, newQCMId)

    // Mettre à jour le bloc avec les données du QCM
    updateBlock(newQCMId, {
      content: JSON.stringify(qcmData),
      qcmData: qcmData,
    })

    setIsModified(true)

    toast({
      title: "QCM inséré",
      description: "Un QCM a été inséré dans le document.",
    })
  }

  return (
    <div className="bg-white border-b border-gray-200 p-2 flex items-center gap-2 overflow-x-auto">
      <TooltipProvider>
        <div className="flex items-center gap-1 mr-2">
          <Select value={currentFormatting.fontFamily} onValueChange={handleFontFamilyChange}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Police" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arial">Arial</SelectItem>
              <SelectItem value="times">Times New Roman</SelectItem>
              <SelectItem value="calibri">Calibri</SelectItem>
              <SelectItem value="georgia">Georgia</SelectItem>
              <SelectItem value="verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentFormatting.fontSize} onValueChange={handleFontSizeChange}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue placeholder="Taille" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="14">14</SelectItem>
              <SelectItem value="16">16</SelectItem>
              <SelectItem value="18">18</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="24">24</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center border-l border-r border-gray-200 px-2 gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentFormatting.isBold ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={toggleBold}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Gras (Ctrl+B)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentFormatting.isItalic ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={toggleItalic}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italique (Ctrl+I)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentFormatting.isUnderline ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={toggleUnderline}
              >
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Souligné (Ctrl+U)</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center border-r border-gray-200 pr-2 gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentFormatting.alignment === "left" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setAlignment("left")}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Aligner à gauche</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentFormatting.alignment === "center" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setAlignment("center")}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Centrer</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentFormatting.alignment === "right" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setAlignment("right")}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Aligner à droite</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentFormatting.alignment === "justify" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setAlignment("justify")}
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Justifier</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center border-r border-gray-200 pr-2 gap-1">
          <Popover open={showTextColorPopover} onOpenChange={setShowTextColorPopover}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                    <Type className="h-4 w-4" />
                    <div
                      className="absolute bottom-1 left-1 right-1 h-1 rounded-sm"
                      style={{ backgroundColor: currentFormatting.textColor }}
                    />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Couleur du texte</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64">
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: color }}
                    onClick={() => setTextColor(color)}
                    aria-label={`Couleur ${color}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="custom-text-color">Personnalisée:</Label>
                <Input
                  id="custom-text-color"
                  type="color"
                  value={currentFormatting.textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-16 h-8"
                />
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={showBgColorPopover} onOpenChange={setShowBgColorPopover}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                    <Palette className="h-4 w-4" />
                    <div
                      className="absolute bottom-1 left-1 right-1 h-1 rounded-sm"
                      style={{
                        backgroundColor:
                          currentFormatting.bgColor === "transparent" ? "#cccccc" : currentFormatting.bgColor,
                      }}
                    />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Couleur d'arrière-plan</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64">
              <div className="grid grid-cols-5 gap-2">
                <button
                  className="w-8 h-8 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white relative"
                  onClick={() => setBgColor("transparent")}
                  aria-label="Transparent"
                >
                  <div className="absolute inset-0 flex items-center justify-center text-red-500">/</div>
                </button>
                {predefinedColors.slice(1).map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: color }}
                    onClick={() => setBgColor(color)}
                    aria-label={`Couleur ${color}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="custom-bg-color">Personnalisée:</Label>
                <Input
                  id="custom-bg-color"
                  type="color"
                  value={currentFormatting.bgColor === "transparent" ? "#ffffff" : currentFormatting.bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-16 h-8"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowImageDialog(true)}>
                <ImageIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insérer une image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowTableDialog(true)}>
                <Table className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insérer un tableau</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertList("unordered")}>
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Liste à puces</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertList("ordered")}>
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Liste numérotée</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowQCMDialog(true)}>
                <FileQuestion className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insérer un QCM</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Dialogue pour insérer une image */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insérer une image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image-url" className="text-right">
                URL de l'image
              </Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://exemple.com/image.jpg"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image-alt" className="text-right">
                Texte alternatif
              </Label>
              <Input
                id="image-alt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="col-span-3"
                placeholder="Description de l'image"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Annuler
            </Button>
            <Button onClick={insertImage}>Insérer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour insérer un tableau */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insérer un tableau</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-rows" className="text-right">
                Lignes
              </Label>
              <Input
                id="table-rows"
                type="number"
                min="1"
                max="20"
                value={tableRows}
                onChange={(e) => setTableRows(Number.parseInt(e.target.value) || 2)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-cols" className="text-right">
                Colonnes
              </Label>
              <Input
                id="table-cols"
                type="number"
                min="1"
                max="10"
                value={tableCols}
                onChange={(e) => setTableCols(Number.parseInt(e.target.value) || 2)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>
              Annuler
            </Button>
            <Button onClick={insertTable}>Insérer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour insérer un QCM */}
      <AddQCMDialog open={showQCMDialog} onOpenChange={setShowQCMDialog} onSave={insertQCM} />
    </div>
  )
}
