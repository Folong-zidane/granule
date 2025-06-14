import { NextResponse } from "next/server"
import { activitiesDb } from "@/lib/mock-db"

// GET /api/activities - Récupérer toutes les activités
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let activities
    if (userId) {
      activities = await activitiesDb.getByUser(userId)
    } else {
      activities = await activitiesDb.getAll()
    }

    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ error: "Failed to fetch activities", message: error.message }, { status: 500 })
  }
}

// POST /api/activities - Créer une nouvelle activité
export async function POST(request) {
  try {
    const data = await request.json()

    // Validation des données
    if (!data.action || !data.documentId || !data.documentTitle) {
      return NextResponse.json({ error: "Action, documentId, and documentTitle are required" }, { status: 400 })
    }

    const newActivity = await activitiesDb.create(data)

    return NextResponse.json({ activity: newActivity }, { status: 201 })
  } catch (error) {
    console.error("Error creating activity:", error)
    return NextResponse.json({ error: "Failed to create activity", message: error.message }, { status: 500 })
  }
}
