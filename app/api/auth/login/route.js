import { NextResponse } from "next/server"
import { usersDb } from "@/lib/mock-db"

// POST /api/auth/login - Authentifier un utilisateur
export async function POST(request) {
  try {
    const { email } = await request.json()

    // Validation des données
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    try {
      const user = await usersDb.getByEmail(email)

      // Dans une application réelle, nous vérifierions le mot de passe ici
      // Pour cette simulation, nous authentifions simplement par email

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

      return NextResponse.json({
        user: sanitizedUser,
        token: `mock-jwt-token-${user.id}`, // Token simulé
      })
    } catch (error) {
      // Utilisateur non trouvé
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Authentication failed", message: error.message }, { status: 500 })
  }
}
