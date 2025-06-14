import apiClient from "@/lib/api-client"

/**
 * Service pour gérer l'authentification
 */
const authService = {
  // Connecter un utilisateur
  login: async (email) => {
    try {
      const response = await apiClient.post("auth/login", { email })

      // Stocker le token dans le localStorage
      if (response.token) {
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("user", JSON.stringify(response.user))
      }

      return response
    } catch (error) {
      console.error("Error during login:", error)
      throw error
    }
  },

  // Déconnecter un utilisateur
  logout: () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  },

  // Vérifier si un utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem("auth_token")
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error("Error parsing user from localStorage:", error)
      return null
    }
  },

  // Récupérer le token d'authentification
  getToken: () => {
    return localStorage.getItem("auth_token")
  },
}

export default authService
