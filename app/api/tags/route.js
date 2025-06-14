import { NextResponse } from "next/server"
import { tagsDb } from "@/lib/mock-db"

// GET /api/tags - Récupérer tous les tags
export async function GET() {
  try {
    const tags = await tagsDb.getAll()

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ error: "Failed to fetch tags", message: error.message }, { status: 500 })
  }
}

// POST /api/tags - Créer un nouveau tag
export async function POST(request) {
  try {
    const data = await request.json()

    // Validation des données
    if (!data.name || !data.color) {
      return NextResponse.json({ error: "Name and color are required" }, { status: 400 })
    }

    const newTag = await tagsDb.create(data)

    return NextResponse.json({ tag: newTag }, { status: 201 })
  } catch (error) {
    console.error("Error creating tag:", error)
    return NextResponse.json({ error: "Failed to create tag", message: error.message }, { status: 500 })
  }
}
