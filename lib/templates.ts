import type { EditorBlock } from "@/contexts/editor-context"

export interface Template {
  id: string
  title: string
  description: string
  category: string
  blocks: EditorBlock[]
}

// Templates prédéfinis pour différents types de cours
const templates: Template[] = [
  {
    id: "default",
    title: "Plan de cours standard",
    description: "Un modèle de plan de cours avec introduction, objectifs et chapitres",
    category: "Général",
    blocks: [
      {
        id: "default-1",
        type: "heading",
        content: "Plan de cours",
        level: 1,
      },
      {
        id: "default-2",
        type: "heading",
        content: "Introduction",
        level: 2,
      },
      {
        id: "default-3",
        type: "paragraph",
        content: "Présentez votre cours et son contexte général ici...",
      },
      {
        id: "default-4",
        type: "heading",
        content: "Objectifs pédagogiques",
        level: 2,
      },
      {
        id: "default-5",
        type: "list",
        content:
          "• Objectif 1: Comprendre les concepts fondamentaux\n• Objectif 2: Appliquer les connaissances acquises\n• Objectif 3: Analyser et évaluer des situations complexes",
        format: "unordered",
      },
      {
        id: "default-6",
        type: "heading",
        content: "Chapitre 1: Fondamentaux",
        level: 2,
      },
      {
        id: "default-7",
        type: "paragraph",
        content: "Contenu du premier chapitre...",
      },
      {
        id: "default-8",
        type: "heading",
        content: "Chapitre 2: Applications pratiques",
        level: 2,
      },
      {
        id: "default-9",
        type: "paragraph",
        content: "Contenu du deuxième chapitre...",
      },
      {
        id: "default-10",
        type: "heading",
        content: "Évaluation",
        level: 2,
      },
      {
        id: "default-11",
        type: "paragraph",
        content: "Décrivez les méthodes d'évaluation ici...",
      },
    ],
  },
  {
    id: "exam",
    title: "Modèle d'examen",
    description: "Un modèle pour créer un examen avec différentes sections et types de questions",
    category: "Évaluation",
    blocks: [
      {
        id: "exam-1",
        type: "heading",
        content: "Examen de [Matière]",
        level: 1,
      },
      {
        id: "exam-2",
        type: "paragraph",
        content: "Durée: [Durée] - Points: [Total des points]",
      },
      {
        id: "exam-3",
        type: "heading",
        content: "Instructions",
        level: 2,
      },
      {
        id: "exam-4",
        type: "paragraph",
        content: "Répondez à toutes les questions. Les documents autorisés sont...",
      },
      {
        id: "exam-5",
        type: "heading",
        content: "Partie I: Questions à choix multiples (10 points)",
        level: 2,
      },
      {
        id: "exam-6",
        type: "paragraph",
        content: "Pour chaque question, sélectionnez la réponse correcte.",
      },
      {
        id: "exam-7",
        type: "heading",
        content: "Partie II: Questions à développement court (20 points)",
        level: 2,
      },
      {
        id: "exam-8",
        type: "paragraph",
        content: "Répondez aux questions suivantes en 2-3 phrases.",
      },
      {
        id: "exam-9",
        type: "heading",
        content: "Partie III: Problèmes (30 points)",
        level: 2,
      },
      {
        id: "exam-10",
        type: "paragraph",
        content: "Résolvez les problèmes suivants en montrant toutes les étapes de votre raisonnement.",
      },
    ],
  },
  {
    id: "lesson",
    title: "Plan de leçon détaillé",
    description: "Un modèle de leçon avec objectifs, activités et évaluation",
    category: "Enseignement",
    blocks: [
      {
        id: "lesson-1",
        type: "heading",
        content: "Leçon: [Titre de la leçon]",
        level: 1,
      },
      {
        id: "lesson-2",
        type: "heading",
        content: "Informations générales",
        level: 2,
      },
      {
        id: "lesson-3",
        type: "paragraph",
        content: "Niveau: [Niveau]\nDurée: [Durée]\nPrérequis: [Connaissances préalables nécessaires]",
      },
      {
        id: "lesson-4",
        type: "heading",
        content: "Objectifs d'apprentissage",
        level: 2,
      },
      {
        id: "lesson-5",
        type: "list",
        content: "• Les élèves seront capables de...\n• Les élèves comprendront...\n• Les élèves pourront appliquer...",
        format: "unordered",
      },
      {
        id: "lesson-6",
        type: "heading",
        content: "Matériel nécessaire",
        level: 2,
      },
      {
        id: "lesson-7",
        type: "list",
        content: "• Manuels\n• Fiches d'exercices\n• Équipement spécifique",
        format: "unordered",
      },
      {
        id: "lesson-8",
        type: "heading",
        content: "Déroulement de la leçon",
        level: 2,
      },
      {
        id: "lesson-9",
        type: "heading",
        content: "1. Introduction (10 min)",
        level: 3,
      },
      {
        id: "lesson-10",
        type: "paragraph",
        content: "Description de l'activité d'introduction...",
      },
      {
        id: "lesson-11",
        type: "heading",
        content: "2. Développement (30 min)",
        level: 3,
      },
      {
        id: "lesson-12",
        type: "paragraph",
        content: "Description des activités principales...",
      },
      {
        id: "lesson-13",
        type: "heading",
        content: "3. Conclusion (10 min)",
        level: 3,
      },
      {
        id: "lesson-14",
        type: "paragraph",
        content: "Description de l'activité de conclusion...",
      },
      {
        id: "lesson-15",
        type: "heading",
        content: "Évaluation",
        level: 2,
      },
      {
        id: "lesson-16",
        type: "paragraph",
        content: "Description des méthodes d'évaluation pour cette leçon...",
      },
    ],
  },
]

// Fonction pour récupérer un template par ID
export async function getTemplateById(id: string): Promise<Template | null> {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 300))

  const template = templates.find((t) => t.id === id)
  return template || templates[0] // Retourner le template par défaut si l'ID n'est pas trouvé
}

// Fonction pour récupérer tous les templates
export async function getAllTemplates(): Promise<Template[]> {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 300))

  return templates
}

// Fonction pour récupérer les templates par catégorie
export async function getTemplatesByCategory(category: string): Promise<Template[]> {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 300))

  return templates.filter((t) => t.category === category)
}
