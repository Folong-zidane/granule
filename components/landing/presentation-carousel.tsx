"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const carouselItems = [
  {
    title: "Création de cours simplifiée",
    description: "Un éditeur intuitif pour créer des cours structurés et attrayants en quelques clics.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    title: "Partage sécurisé",
    description: "Partagez vos cours avec vos élèves via des codes d'accès ou des liens sécurisés.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    title: "Suivi de progression",
    description: "Suivez la progression de vos élèves et identifiez les points à améliorer.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    title: "QCM interactifs",
    description: "Créez des questionnaires interactifs pour évaluer la compréhension de vos élèves.",
    image: "/placeholder.svg?height=400&width=600",
  },
]

export function PresentationCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselItems.length) % carouselItems.length)
  }

  // Auto-rotation du carrousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="w-full py-12 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Découvrez DocEnseignant</h2>
          <p className="text-gray-500 mt-2">Une plateforme complète pour l'enseignement moderne</p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {carouselItems.map((item, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="order-2 md:order-1 p-6">
                          <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                          <p className="text-gray-500">{item.description}</p>
                        </div>
                        <div className="order-1 md:order-2">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-auto rounded-lg"
                            width={600}
                            height={400}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="flex justify-center mt-4 gap-2">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-primary" : "bg-gray-300"}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
