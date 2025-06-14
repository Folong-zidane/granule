import { NextResponse } from "next/server"
import { documentsDb } from "@/lib/mock-db"

// GET /api/documents/[id] - Récupérer un document par ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    const document = await documentsDb.getById(id)

    return NextResponse.json({ document })
  } catch (error) {
    console.error(`Error fetching document ${params.id}:`, error)

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: "Document not found", message: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to fetch document", message: error.message }, { status: 500 })
  }
}

// PUT /api/documents/[id] - Mettre à jour un document
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    const updatedDocument = await documentsDb.update(id, data)

    return NextResponse.json({ document: updatedDocument })
  } catch (error) {
    console.error(`Error updating document ${params.id}:`, error)

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: "Document not found", message: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to update document", message: error.message }, { status: 500 })
  }
}

// DELETE /api/documents/[id] - Supprimer un document
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const deletedDocument = await documentsDb.delete(id)

    return NextResponse.json({ document: deletedDocument })
  } catch (error) {
    console.error(`Error deleting document ${params.id}:`, error)

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: "Document not found", message: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to delete document", message: error.message }, { status: 500 })
  }
}
