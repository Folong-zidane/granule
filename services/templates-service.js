import apiClient from "@/lib/api-client"

/**
 * Service pour interagir avec l'API des modèles
 */
const templatesService = {
  // Récupérer tous les modèles
  getAllTemplates: async () => {
    try {
      const response = await apiClient.get("templates")
      return response.templates
    } catch (error) {
      console.error("Error fetching templates:", error)
      throw error
    }
  },

  // Rechercher des modèles
  searchTemplates: async (query) => {
    try {
      const response = await apiClient.get("templates", { query })
      return response.templates
    } catch (error) {
      console.error("Error searching templates:", error)
      throw error
    }
  },

  // Récupérer un modèle par ID
  getTemplateById: async (id) => {
    try {
      const response = await apiClient.get(`templates/${id}`)
      return response.template
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error)
      throw error
    }
  },
}

export default templatesService
