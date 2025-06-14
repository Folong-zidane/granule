import apiClient from "@/lib/api-client"

/**
 * Service pour interagir avec l'API des activités
 */
const activitiesService = {
  // Récupérer toutes les activités
  getAllActivities: async () => {
    try {
      const response = await apiClient.get("activities")
      return response.activities
    } catch (error) {
      console.error("Error fetching activities:", error)
      throw error
    }
  },

  // Récupérer les activités d'un utilisateur
  getUserActivities: async (userId) => {
    try {
      const response = await apiClient.get("activities", { userId })
      return response.activities
    } catch (error) {
      console.error(`Error fetching activities for user ${userId}:`, error)
      throw error
    }
  },

  // Créer une nouvelle activité
  createActivity: async (activityData) => {
    try {
      const response = await apiClient.post("activities", activityData)
      return response.activity
    } catch (error) {
      console.error("Error creating activity:", error)
      throw error
    }
  },
}

export default activitiesService
