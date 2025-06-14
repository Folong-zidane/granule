/**
 * Client API pour effectuer des requêtes vers notre API simulée
 */

// Fonction pour simuler un délai réseau et des erreurs aléatoires
const simulateRequest = async (endpoint, options = {}) => {
  // Simuler un délai réseau aléatoire entre 200ms et 800ms
  const delay = Math.floor(Math.random() * 600) + 200
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Simuler une erreur réseau aléatoire (5% de chance)
  if (Math.random() < 0.05) {
    throw new Error(`Erreur réseau simulée pour ${endpoint}`)
  }

  return options
}

// Client API avec méthodes pour chaque type de requête
const apiClient = {
  // Méthode GET
  get: async (endpoint, params = {}) => {
    const queryString = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : ""

    const options = await simulateRequest(`${endpoint}${queryString}`)

    try {
      const response = await fetch(`/api/${endpoint}${queryString}`, options)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Une erreur est survenue")
      }

      return await response.json()
    } catch (error) {
      console.error(`Erreur lors de la requête GET vers ${endpoint}:`, error)
      throw error
    }
  },

  // Méthode POST
  post: async (endpoint, data = {}) => {
    const options = await simulateRequest(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    try {
      const response = await fetch(`/api/${endpoint}`, options)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Une erreur est survenue")
      }

      return await response.json()
    } catch (error) {
      console.error(`Erreur lors de la requête POST vers ${endpoint}:`, error)
      throw error
    }
  },

  // Méthode PUT
  put: async (endpoint, data = {}) => {
    const options = await simulateRequest(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    try {
      const response = await fetch(`/api/${endpoint}`, options)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Une erreur est survenue")
      }

      return await response.json()
    } catch (error) {
      console.error(`Erreur lors de la requête PUT vers ${endpoint}:`, error)
      throw error
    }
  },

  // Méthode DELETE
  delete: async (endpoint) => {
    const options = await simulateRequest(endpoint, {
      method: "DELETE",
    })

    try {
      const response = await fetch(`/api/${endpoint}`, options)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Une erreur est survenue")
      }

      return await response.json()
    } catch (error) {
      console.error(`Erreur lors de la requête DELETE vers ${endpoint}:`, error)
      throw error
    }
  },
}

export default apiClient
