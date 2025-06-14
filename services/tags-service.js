import apiClient from "@/lib/api-client"

/**
 * Service pour interagir avec l'API des tags
 */
const tagsService = {
  // Récupérer tous les tags
  getAllTags: async () => {
    try {
      const response = await apiClient.get("tags")
      return response.tags
    } catch (error) {
      console.error("Error fetching tags:", error)
      throw error
    }
  },

  // Récupérer un tag par ID
  getTagById: async (id) => {
    try {
      const response = await apiClient.get(`tags/${id}`)
      return response.tag
    } catch (error) {
      console.error(`Error fetching tag ${id}:`, error)
      throw error
    }
  },

  // Créer un nouveau tag
  createTag: async (tagData) => {
    try {
      const response = await apiClient.post("tags", tagData)
      return response.tag
    } catch (error) {
      console.error("Error creating tag:", error)
      throw error
    }
  },

  // Supprimer un tag
  deleteTag: async (id) => {
    try {
      const response = await apiClient.delete(`tags/${id}`)
      return response.tag
    } catch (error) {
      console.error(`Error deleting tag ${id}:`, error)
      throw error
    }
  },
}

export default tagsService
