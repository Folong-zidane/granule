import { NextResponse } from "next/server"
import { documentsDb } from "@/lib/mock-db"

// GET /api/documents - Récupérer tous les documents
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    let documents
    if (query) {
      documents = await documentsDb.search(query)
    } else {
      documents = await documentsDb.getAll()
    }

    return NextResponse.json({ documents })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents", message: error.message }, { status: 500 })
  }
}

// POST /api/documents - Créer un nouveau document
export async function POST(request) {
  try {
    const data = await request.json()

    // Validation des données
    if (!data.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const newDocument = await documentsDb.create(data)

    return NextResponse.json({ document: newDocument }, { status: 201 })
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ error: "Failed to create document", message: error.message }, { status: 500 })
  }
}
