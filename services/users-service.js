import apiClient from "@/lib/api-client"

/**
 * Service pour interagir avec l'API des utilisateurs
 */
const usersService = {
  // Récupérer tous les utilisateurs
  getAllUsers: async () => {
    try {
      const response = await apiClient.get("users")
      return response.users
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },

  // Récupérer un utilisateur par ID
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`users/${id}`)
      return response.user
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw error
    }
  },

  // Mettre à jour les préférences d'un utilisateur
  updateUserPreferences: async (id, preferences) => {
    try {
      const response = await apiClient.put(`users/${id}/preferences`, preferences)
      return response.preferences
    } catch (error) {
      console.error(`Error updating preferences for user ${id}:`, error)
      throw error
    }
  },
}

export default usersService
