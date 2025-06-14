"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ChevronLeft, Download, BookOpen, FileText } from "lucide-react"
import { CourseQCM } from "@/components/course/course-qcm"

export default function CoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("content")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const user = localStorage.getItem("user")

    if (!user) {
      router.push("/")
      return
    }

    setIsLoggedIn(true)
    setUserRole(role)
  }, [router])

  // Simuler le chargement du cours depuis une API
  useEffect(() => {
    // Dans une application réelle, vous feriez un appel API ici
    const fetchCourse = async () => {
      try {
        // Simuler un délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Données fictives du cours
        const mockCourse = {
          id: courseId,
          title: "Mathématiques - Fonctions et limites",
          description: "Cours complet sur les fonctions et les limites pour les classes de Terminale S",
          teacher: "Mme Dupont",
          progress: 75,
          sections: [
            {
              id: "section-1",
              title: "Introduction aux fonctions",
              content: `
                <h2>Introduction aux fonctions</h2>
                <p>Une fonction est une relation qui associe à chaque élément d'un ensemble un unique élément d'un autre ensemble.</p>
                <p>Formellement, une fonction f d'un ensemble E vers un ensemble F est une relation qui à tout élément x de E associe un unique élément y de F, noté f(x).</p>
                <h3>Domaine de définition</h3>
                <p>Le domaine de définition d'une fonction est l'ensemble des valeurs pour lesquelles la fonction est définie.</p>
                <h3>Image d'une fonction</h3>
                <p>L'image d'une fonction est l'ensemble des valeurs prises par la fonction.</p>
              `,
            },
            {
              id: "section-2",
              title: "Limites de fonctions",
              content: `
                <h2>Limites de fonctions</h2>
                <p>La notion de limite permet de décrire le comportement d'une fonction au voisinage d'un point ou à l'infini.</p>
                <h3>Limite finie en un point</h3>
                <p>On dit que la fonction f admet une limite finie L en un point a si f(x) se rapproche de L lorsque x se rapproche de a.</p>
                <h3>Limite infinie en un point</h3>
                <p>On dit que la fonction f admet une limite infinie en un point a si |f(x)| devient arbitrairement grand lorsque x se rapproche de a.</p>
              `,
            },
            {
              id: "section-3",
              title: "Continuité",
              content: `
                <h2>Continuité</h2>
                <p>Une fonction est continue en un point si sa limite en ce point existe et est égale à la valeur de la fonction en ce point.</p>
                <p>Une fonction est continue sur un intervalle si elle est continue en chaque point de cet intervalle.</p>
                <h3>Théorème des valeurs intermédiaires</h3>
                <p>Si f est une fonction continue sur un intervalle [a,b] et si f(a) et f(b) sont de signes contraires, alors il existe au moins un point c dans ]a,b[ tel que f(c) = 0.</p>
              `,
            },
          ],
          resources: [
            {
              id: "resource-1",
              title: "Fiche de synthèse - Fonctions",
              type: "pdf",
              url: "#",
            },
            {
              id: "resource-2",
              title: "Exercices supplémentaires",
              type: "pdf",
              url: "#",
            },
            {
              id: "resource-3",
              title: "Corrigé des exercices",
              type: "pdf",
              url: "#",
            },
          ],
          qcm: [
            {
              id: "qcm-1",
              title: "QCM - Fonctions et limites",
              questions: [
                {
                  id: "q1",
                  text: "Quelle est la limite de f(x) = 1/x lorsque x tend vers 0 par valeurs positives ?",
                  options: [
                    { id: "q1-a", text: "0" },
                    { id: "q1-b", text: "1" },
                    { id: "q1-c", text: "+∞" },
                    { id: "q1-d", text: "-∞" },
                  ],
                  correctAnswer: "q1-c",
                  type: "single",
                },
                {
                  id: "q2",
                  text: "Une fonction est continue en un point a si :",
                  options: [
                    { id: "q2-a", text: "f est définie en a" },
                    { id: "q2-b", text: "la limite de f en a existe" },
                    { id: "q2-c", text: "la limite de f en a est égale à f(a)" },
                    { id: "q2-d", text: "f est dérivable en a" },
                  ],
                  correctAnswer: "q2-c",
                  type: "single",
                },
                {
                  id: "q3",
                  text: "Quelles sont les propriétés des fonctions continues ? (plusieurs réponses possibles)",
                  options: [
                    { id: "q3-a", text: "La somme de deux fonctions continues est continue" },
                    { id: "q3-b", text: "Le produit de deux fonctions continues est continu" },
                    { id: "q3-c", text: "Toute fonction continue est dérivable" },
                    { id: "q3-d", text: "Une fonction continue sur un intervalle fermé borné est bornée" },
                  ],
                  correctAnswers: ["q3-a", "q3-b", "q3-d"],
                  type: "multiple",
                },
              ],
            },
          ],
        }

        setCourse(mockCourse)
        setLoading(false)
      } catch (error) {
        console.error("Erreur lors du chargement du cours:", error)
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  if (!isLoggedIn) {
    return null // Redirection gérée dans useEffect
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du cours...</p>
          </div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Cours non trouvé</h2>
            <p className="mt-2 text-gray-600">Le cours que vous recherchez n'existe pas ou a été supprimé.</p>
            <Button className="mt-4" onClick={() => router.back()}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Table des matières</h2>
              <ul className="space-y-2">
                {course.sections.map((section) => (
                  <li key={section.id}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start text-left ${
                        activeSection === section.id ? "bg-blue-50 text-blue-700" : ""
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.title}
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Votre progression</h3>
                <Progress value={course.progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{course.progress}% complété</p>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Ressources</h3>
                <ul className="space-y-2">
                  {course.resources.map((resource) => (
                    <li key={resource.id}>
                      <Button variant="ghost" className="w-full justify-start text-left" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          {resource.title}
                          <Download className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">{course.title}</h1>
                <p className="text-gray-600 mt-2">{course.description}</p>
                <div className="flex items-center mt-4 text-sm text-gray-500">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>Par {course.teacher}</span>
                </div>
              </div>

              <Tabs defaultValue="content" className="mt-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="content">Contenu du cours</TabsTrigger>
                  <TabsTrigger value="qcm">QCM</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-4">
                  {course.sections.map((section) => (
                    <div key={section.id} id={section.id} className={activeSection === section.id ? "" : "hidden"}>
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
                      <div className="mt-8 flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const currentIndex = course.sections.findIndex((s) => s.id === activeSection)
                            if (currentIndex > 0) {
                              setActiveSection(course.sections[currentIndex - 1].id)
                            }
                          }}
                          disabled={course.sections[0].id === activeSection}
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Section précédente
                        </Button>
                        <Button
                          onClick={() => {
                            const currentIndex = course.sections.findIndex((s) => s.id === activeSection)
                            if (currentIndex < course.sections.length - 1) {
                              setActiveSection(course.sections[currentIndex + 1].id)
                            }
                          }}
                          disabled={course.sections[course.sections.length - 1].id === activeSection}
                        >
                          Section suivante
                          <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="qcm">
                  {course.qcm.map((qcm) => (
                    <Card key={qcm.id}>
                      <CardContent className="pt-6">
                        <CourseQCM qcm={qcm} />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
