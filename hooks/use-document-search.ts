"use client"

import { useState, useCallback } from "react"
import { useDocuments, type Document } from "@/contexts/documents-context"

type SearchOptions = {
  initialQuery?: string
  limit?: number
  sortBy?: "title" | "lastModified" | "relevance"
  sortDirection?: "asc" | "desc"
  filterByTags?: string[]
}

export function useDocumentSearch(options: SearchOptions = {}) {
  const { initialQuery = "", limit, sortBy = "lastModified", sortDirection = "desc", filterByTags = [] } = options

  const { searchDocuments, allDocuments, tags } = useDocuments()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Document[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Fonction de recherche
  const search = useCallback(
    (searchQuery: string = query) => {
      setIsSearching(true)

      // Rechercher les documents
      let searchResults = searchQuery ? searchDocuments(searchQuery) : [...allDocuments]

      // Filtrer par tags si nécessaire
      if (filterByTags.length > 0) {
        searchResults = searchResults.filter((doc) => doc.tags.some((tag) => filterByTags.includes(tag.id)))
      }

      // Trier les résultats
      searchResults.sort((a, b) => {
        if (sortBy === "title") {
          return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
        } else if (sortBy === "lastModified") {
          return sortDirection === "asc"
            ? a.lastModified.getTime() - b.lastModified.getTime()
            : b.lastModified.getTime() - a.lastModified.getTime()
        }

        // Par défaut, trier par pertinence (pour l'instant, c'est juste l'ordre de recherche)
        return 0
      })

      // Limiter le nombre de résultats si nécessaire
      if (limit && limit > 0) {
        searchResults = searchResults.slice(0, limit)
      }

      setResults(searchResults)
      setIsSearching(false)

      return searchResults
    },
    [query, allDocuments, searchDocuments, filterByTags, sortBy, sortDirection, limit],
  )

  // Effectuer une recherche lorsque la requête change
  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery)
      search(newQuery)
    },
    [search],
  )

  // Recherche initiale
  useCallback(() => {
    if (initialQuery) {
      search(initialQuery)
    }
  }, [initialQuery, search])

  return {
    query,
    results,
    isSearching,
    search,
    handleSearch,
    setQuery,
  }
}
