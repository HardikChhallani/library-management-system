import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/seed-data"

export async function GET() {
  try {
    const result = await initializeDatabase()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Initialization failed" }, { status: 500 })
  }
}
