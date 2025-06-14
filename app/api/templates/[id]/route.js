import { NextResponse } from "next/server"
import { templatesDb } from "@/lib/mock-db"

// GET /api/templates/[id] - Récupérer un modèle par ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    const template = await templatesDb.getById(id)

    return NextResponse.json({ template })
  } catch (error) {
    console.error(`Error fetching template ${params.id}:`, error)

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: "Template not found", message: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to fetch template", message: error.message }, { status: 500 })
  }
}
