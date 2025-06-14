"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"

type QCMOption = {
  id: string
  text: string
  isCorrect: boolean
}

type QCMQuestion = {
  id: string
  question: string
  options: QCMOption[]
  type: "single" | "multiple"
  explanation: string
}

type AddQCMDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (qcm: QCMQuestion) => void
  initialData?: QCMQuestion
}

export function AddQCMDialog({ open, onOpenChange, onSave, initialData }: AddQCMDialogProps) {
  const [question, setQuestion] = useState(initialData?.question || "")
  const [options, setOptions] = useState<QCMOption[]>(
    initialData?.options || [
      { id: "opt-1", text: "", isCorrect: false },
      { id: "opt-2", text: "", isCorrect: false },
    ],
  )
  const [type, setType] = useState<"single" | "multiple">(initialData?.type || "single")
  const [explanation, setExplanation] = useState(initialData?.explanation || "")

  const handleAddOption = () => {
    setOptions([...options, { id: `opt-${Date.now()}`, text: "", isCorrect: false }])
  }

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      return // Garder au moins 2 options
    }
    setOptions(options.filter((opt) => opt.id !== id))
  }

  const handleOptionTextChange = (id: string, text: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)))
  }

  const handleOptionCorrectChange = (id: string, isCorrect: boolean) => {
    if (type === "single") {
      // Pour les QCM à réponse unique, désélectionner les autres options
      setOptions(options.map((opt) => (opt.id === id ? { ...opt, isCorrect } : { ...opt, isCorrect: false })))
    } else {
      // Pour les QCM à réponses multiples, permettre plusieurs réponses correctes
      setOptions(options.map((opt) => (opt.id === id ? { ...opt, isCorrect } : opt)))
    }
  }

  const handleTypeChange = (newType: "single" | "multiple") => {
    setType(newType)
    if (newType === "single") {
      // Si on passe en mode réponse unique, s'assurer qu'une seule option est sélectionnée
      const correctOptions = options.filter((opt) => opt.isCorrect)
      if (correctOptions.length > 1) {
        // Garder seulement la première option correcte
        setOptions(
          options.map((opt, index) => {
            const isFirst = index === options.findIndex((o) => o.isCorrect)
            return opt.isCorrect ? { ...opt, isCorrect: isFirst } : opt
          }),
        )
      }
    }
  }

  const handleSave = () => {
    // Validation de base
    if (!question.trim()) {
      alert("Veuillez saisir une question.")
      return
    }

    if (!options.some((opt) => opt.isCorrect)) {
      alert("Veuillez sélectionner au moins une réponse correcte.")
      return
    }

    if (options.some((opt) => !opt.text.trim())) {
      alert("Veuillez remplir toutes les options.")
      return
    }

    const qcm: QCMQuestion = {
      id: initialData?.id || `qcm-${Date.now()}`,
      question,
      options,
      type,
      explanation,
    }

    onSave(qcm)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un QCM</DialogTitle>
          <DialogDescription>
            Créez une question à choix multiples pour évaluer la compréhension des élèves.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              placeholder="Saisissez votre question ici..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Type de réponse</Label>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroup value={type} onValueChange={(v) => handleTypeChange(v as "single" | "multiple")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Réponse unique</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="multiple" />
                    <Label htmlFor="multiple">Réponses multiples</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                {type === "single" ? (
                  <RadioGroup value={option.isCorrect ? option.id : ""}>
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      checked={option.isCorrect}
                      onClick={() => handleOptionCorrectChange(option.id, !option.isCorrect)}
                    />
                  </RadioGroup>
                ) : (
                  <Checkbox
                    id={option.id}
                    checked={option.isCorrect}
                    onCheckedChange={(checked) => handleOptionCorrectChange(option.id, !!checked)}
                  />
                )}
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(option.id)}
                  disabled={options.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddOption} className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une option
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explication (facultatif)</Label>
            <Textarea
              id="explanation"
              placeholder="Explication de la réponse correcte..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
