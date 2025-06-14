import { NextResponse } from "next/server"
import { templatesDb } from "@/lib/mock-db"

// GET /api/templates - Récupérer tous les modèles
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    let templates
    if (query) {
      templates = await templatesDb.search(query)
    } else {
      templates = await templatesDb.getAll()
    }

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates", message: error.message }, { status: 500 })
  }
}
