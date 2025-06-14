/**
 * Utilitaire pour simuler une base de données avec des fichiers JSON
 * Dans un environnement réel, ces fonctions seraient remplacées par des appels à une vraie base de données
 */

// Importation des données JSON
import documentsData from "@/data/documents.json"
import templatesData from "@/data/templates.json"
import activitiesData from "@/data/activities.json"
import tagsData from "@/data/tags.json"
import usersData from "@/data/users.json"

// Copies locales des données pour simuler les modifications
let documents = [...documentsData.documents]
let templates = [...templatesData.templates]
let activities = [...activitiesData.activities]
let tags = [...tagsData.tags]
let users = [...usersData.users]

// Fonction pour simuler un délai réseau
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// Générateur d'ID unique
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`

// Fonctions CRUD pour les documents
export const documentsDb = {
  getAll: async () => {
    await delay()
    return [...documents]
  },

  getById: async (id) => {
    await delay()
    const document = documents.find((doc) => doc.id === id)
    if (!document) throw new Error(`Document with id ${id} not found`)
    return { ...document }
  },

  create: async (documentData) => {
    await delay()
    const newDocument = {
      id: generateId("doc"),
      lastModified: new Date().toISOString(),
      ...documentData,
    }
    documents.unshift(newDocument)
    return { ...newDocument }
  },

  update: async (id, documentData) => {
    await delay()
    const index = documents.findIndex((doc) => doc.id === id)
    if (index === -1) throw new Error(`Document with id ${id} not found`)

    const updatedDocument = {
      ...documents[index],
      ...documentData,
      lastModified: new Date().toISOString(),
    }

    documents[index] = updatedDocument
    return { ...updatedDocument }
  },

  delete: async (id) => {
    await delay()
    const index = documents.findIndex((doc) => doc.id === id)
    if (index === -1) throw new Error(`Document with id ${id} not found`)

    const deletedDocument = documents[index]
    documents.splice(index, 1)
    return { ...deletedDocument }
  },

  search: async (query) => {
    await delay()
    if (!query) return [...documents]

    const lowerQuery = query.toLowerCase()
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowerQuery) || (doc.preview && doc.preview.toLowerCase().includes(lowerQuery)),
    )
  },
}

// Fonctions CRUD pour les templates
export const templatesDb = {
  getAll: async () => {
    await delay()
    return [...templates]
  },

  getById: async (id) => {
    await delay()
    const template = templates.find((t) => t.id === id)
    if (!template) throw new Error(`Template with id ${id} not found`)
    return { ...template }
  },

  search: async (query) => {
    await delay()
    if (!query) return [...templates]

    const lowerQuery = query.toLowerCase()
    return templates.filter(
      (template) =>
        template.title.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.category.toLowerCase().includes(lowerQuery),
    )
  },
}

// Fonctions CRUD pour les activités
export const activitiesDb = {
  getAll: async () => {
    await delay()
    return [...activities]
  },

  getByUser: async (userId) => {
    await delay()
    return activities.filter((activity) => activity.user === userId)
  },

  create: async (activityData) => {
    await delay()
    const newActivity = {
      id: generateId("activity"),
      timestamp: new Date().toISOString(),
      ...activityData,
    }
    activities.unshift(newActivity)
    return { ...newActivity }
  },
}

// Fonctions CRUD pour les tags
export const tagsDb = {
  getAll: async () => {
    await delay()
    return [...tags]
  },

  getById: async (id) => {
    await delay()
    const tag = tags.find((t) => t.id === id)
    if (!tag) throw new Error(`Tag with id ${id} not found`)
    return { ...tag }
  },

  create: async (tagData) => {
    await delay()
    const newTag = {
      id: generateId("tag"),
      ...tagData,
    }
    tags.push(newTag)
    return { ...newTag }
  },

  delete: async (id) => {
    await delay()
    const index = tags.findIndex((t) => t.id === id)
    if (index === -1) throw new Error(`Tag with id ${id} not found`)

    const deletedTag = tags[index]
    tags.splice(index, 1)
    return { ...deletedTag }
  },
}

// Fonctions pour les utilisateurs
export const usersDb = {
  getAll: async () => {
    await delay()
    return [...users]
  },

  getById: async (id) => {
    await delay()
    const user = users.find((u) => u.id === id)
    if (!user) throw new Error(`User with id ${id} not found`)
    return { ...user }
  },

  getByEmail: async (email) => {
    await delay()
    const user = users.find((u) => u.email === email)
    if (!user) throw new Error(`User with email ${email} not found`)
    return { ...user }
  },

  updatePreferences: async (id, preferences) => {
    await delay()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) throw new Error(`User with id ${id} not found`)

    users[index] = {
      ...users[index],
      preferences: {
        ...users[index].preferences,
        ...preferences,
      },
    }

    return { ...users[index] }
  },
}

// Réinitialiser la base de données (utile pour les tests)
export const resetDb = () => {
  documents = [...documentsData.documents]
  templates = [...templatesData.templates]
  activities = [...activitiesData.activities]
  tags = [...tagsData.tags]
  users = [...usersData.users]
}
