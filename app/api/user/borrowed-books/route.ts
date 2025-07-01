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
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("library")
    const borrowRecords = db.collection("borrowRecords")

    // Get user's active borrow records with book details
    const borrowedBooks = await borrowRecords
      .aggregate([
        {
          $match: {
            userId: decoded.userId,
            status: "borrowed",
          },
        },
        {
          $addFields: {
            bookObjectId: { $toObjectId: "$bookId" },
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
          $unwind: "$book",
        },
        {
          $addFields: {
            isOverdue: {
              $lt: ["$dueDate", new Date()],
            },
            daysUntilDue: {
              $divide: [{ $subtract: ["$dueDate", new Date()] }, 1000 * 60 * 60 * 24],
            },
          },
        },
        {
          $sort: { borrowDate: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(borrowedBooks)
  } catch (error) {
    console.error("Get borrowed books error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
