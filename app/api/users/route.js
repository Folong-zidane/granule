import { NextResponse } from "next/server"
import { usersDb } from "@/lib/mock-db"

// GET /api/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await usersDb.getAll()

    // Masquer les informations sensibles
    const sanitizedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
      avatar: user.avatar,
    }))

    return NextResponse.json({ users: sanitizedUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users", message: error.message }, { status: 500 })
  }
}
