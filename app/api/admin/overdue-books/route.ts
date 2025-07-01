import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db("library")
    const borrowRecords = db.collection("borrowRecords")

    // Get overdue books with user and book details
    const overdueBooks = await borrowRecords
      .aggregate([
        {
          $match: {
            status: "borrowed",
            dueDate: { $lt: new Date() },
          },
        },
        {
          $addFields: {
            bookObjectId: { $toObjectId: "$bookId" },
            userObjectId: { $toObjectId: "$userId" },
          },
        },
        {
          $lookup: {
            from: "books",
            localField: "bookObjectId",
            foreignField: "_id",
            as: "book",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userObjectId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$book",
        },
        {
          $unwind: "$user",
        },
        {
          $addFields: {
            daysOverdue: {
              $divide: [{ $subtract: [new Date(), "$dueDate"] }, 1000 * 60 * 60 * 24],
            },
          },
        },
        {
          $sort: { dueDate: 1 },
        },
      ])
      .toArray()

    return NextResponse.json(overdueBooks)
  } catch (error) {
    console.error("Get overdue books error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
