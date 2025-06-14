"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, X, HelpCircle } from "lucide-react"

type QCMOption = {
  id: string
  text: string
  isCorrect: boolean
}

type QCM = {
  id: string
  question: string
  options: QCMOption[]
  type: "single" | "multiple"
  explanation: string
  sectionId: string
}

type CourseQCMProps = {
  qcm: QCM
}

export function CourseQCM({ qcm }: CourseQCMProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleOptionChange = (optionId: string) => {
    if (qcm.type === "single") {
      setSelectedOptions([optionId])
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      )
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  const handleReset = () => {
    setSelectedOptions([])
    setIsSubmitted(false)
    setShowExplanation(false)
  }

  const isCorrect = () => {
    if (qcm.type === "single") {
      const selectedOption = qcm.options.find((opt) => opt.id === selectedOptions[0])
      return selectedOption?.isCorrect || false
    } else {
      // Pour les QCM à réponses multiples, toutes les réponses correctes doivent être sélectionnées
      // et aucune réponse incorrecte ne doit être sélectionnée
      const correctOptionIds = qcm.options.filter((opt) => opt.isCorrect).map((opt) => opt.id)
      const incorrectOptionIds = qcm.options.filter((opt) => !opt.isCorrect).map((opt) => opt.id)

      const allCorrectSelected = correctOptionIds.every((id) => selectedOptions.includes(id))
      const noIncorrectSelected = !incorrectOptionIds.some((id) => selectedOptions.includes(id))

      return allCorrectSelected && noIncorrectSelected
    }
  }

  return (
    <Card className="border-blue-100 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Question</CardTitle>
        <CardDescription>{qcm.question}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {qcm.type === "single" ? (
            <RadioGroup value={selectedOptions[0]} disabled={isSubmitted}>
              {qcm.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onClick={() => handleOptionChange(option.id)}
                  />
                  <Label
                    htmlFor={option.id}
                    className={`flex-1 ${isSubmitted && option.isCorrect ? "text-green-700 font-medium" : ""}`}
                  >
                    {option.text}
                    {isSubmitted && (
                      <span className="ml-2">
                        {option.isCorrect ? (
                          <Check className="inline h-4 w-4 text-green-600" />
                        ) : selectedOptions.includes(option.id) ? (
                          <X className="inline h-4 w-4 text-red-600" />
                        ) : null}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              {qcm.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => !isSubmitted && handleOptionChange(option.id)}
                    disabled={isSubmitted}
                  />
                  <Label
                    htmlFor={option.id}
                    className={`flex-1 ${isSubmitted && option.isCorrect ? "text-green-700 font-medium" : ""}`}
                  >
                    {option.text}
                    {isSubmitted && (
                      <span className="ml-2">
                        {option.isCorrect ? (
                          <Check className="inline h-4 w-4 text-green-600" />
                        ) : selectedOptions.includes(option.id) ? (
                          <X className="inline h-4 w-4 text-red-600" />
                        ) : null}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {isSubmitted && (
          <div className="mt-4">
            <div
              className={`p-3 rounded-md ${isCorrect() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {isCorrect() ? (
                <p className="font-medium">Bonne réponse !</p>
              ) : (
                <p className="font-medium">Réponse incorrecte. Réessayez ou consultez l'explication.</p>
              )}
            </div>

            {showExplanation && (
              <div className="mt-3 p-3 bg-gray-100 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Explication :</span> {qcm.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isSubmitted ? (
          <Button onClick={handleSubmit} disabled={selectedOptions.length === 0}>
            Valider
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Réessayer
            </Button>
            <Button variant="outline" onClick={() => setShowExplanation(!showExplanation)}>
              {showExplanation ? "Masquer l'explication" : "Voir l'explication"}
              <HelpCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
