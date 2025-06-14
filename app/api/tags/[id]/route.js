import { NextResponse } from "next/server"
import { tagsDb } from "@/lib/mock-db"

// GET /api/tags/[id] - Récupérer un tag par ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    const tag = await tagsDb.getById(id)

    return NextResponse.json({ tag })
  } catch (error) {
    console.error(`Error fetching tag ${params.id}:`, error)

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: "Tag not found", message: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to fetch tag", message: error.message }, { status: 500 })
  }
}

// DELETE /api/tags/[id] - Supprimer un tag
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const deletedTag = await tagsDb.delete(id)

    return NextResponse.json({ tag: deletedTag })
  } catch (error) {
    console.error(`Error deleting tag ${params.id}:`, error)

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: "Tag not found", message: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to delete tag", message: error.message }, { status: 500 })
  }
}
