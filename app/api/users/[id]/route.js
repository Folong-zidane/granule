import { NextResponse } from "next/server"
import { usersDb } from "@/lib/mock-db"

// GET /api/users/[id] - Récupérer un utilisateur par ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    const user = await usersDb.getById(id)

    // Masquer les informations sensibles
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
      avatar: user.avatar,
      preferences: user.preferences,
    }

    return NextResponse.json({ user: sanitizedUser })
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error)

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: "User not found", message: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to fetch user", message: error.message }, { status: 500 })
  }
}

// PUT /api/users/[id]/preferences - Mettre à jour les préférences d'un utilisateur
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()

    // Vérifier si la requête concerne les préférences
    if (request.url.includes("/preferences")) {
      const updatedUser = await usersDb.updatePreferences(id, data)

      return NextResponse.json({
        preferences: updatedUser.preferences,
      })
    }

    // Autres mises à jour non supportées pour l'instant
    return NextResponse.json({ error: "Unsupported update operation" }, { status: 400 })
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error)

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: "User not found", message: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to update user", message: error.message }, { status: 500 })
  }
}
