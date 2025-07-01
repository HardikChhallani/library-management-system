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
    const books = db.collection("books")
    const borrowRecords = db.collection("borrowRecords")
    const users = db.collection("users")

    // Category-wise analytics
    const categoryAnalytics = await books
      .aggregate([
        {
          $group: {
            _id: "$category",
            totalBooks: { $sum: 1 },
            totalCopies: { $sum: "$totalCopies" },
            availableCopies: { $sum: "$availableCopies" },
            borrowedCopies: { $sum: { $subtract: ["$totalCopies", "$availableCopies"] } },
          },
        },
        {
          $addFields: {
            utilizationRate: {
              $cond: {
                if: { $eq: ["$totalCopies", 0] },
                then: 0,
                else: { $multiply: [{ $divide: ["$borrowedCopies", "$totalCopies"] }, 100] },
              },
            },
          },
        },
        { $sort: { totalBooks: -1 } },
      ])
      .toArray()

    // Monthly borrowing trends (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTrends = await borrowRecords
      .aggregate([
        {
          $match: {
            borrowDate: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$borrowDate" },
              month: { $month: "$borrowDate" },
            },
            borrowCount: { $sum: 1 },
            returnCount: {
              $sum: {
                $cond: [{ $eq: ["$status", "returned"] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ])
      .toArray()

    // Top borrowed books
    const topBorrowedBooks = await borrowRecords
      .aggregate([
        {
          $group: {
            _id: "$bookId",
            borrowCount: { $sum: 1 },
          },
        },
        {
          $addFields: {
            bookObjectId: { $toObjectId: "$_id" },
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
          $sort: { borrowCount: -1 },
        },
        {
          $limit: 10,
        },
      ])
      .toArray()

    // User activity statistics
    const userStats = await users
      .aggregate([
        {
          $match: { role: "user" },
        },
        {
          $lookup: {
            from: "borrowRecords",
            localField: "_id",
            foreignField: "userId",
            as: "borrowHistory",
          },
        },
        {
          $addFields: {
            totalBorrows: { $size: "$borrowHistory" },
            activeBorrows: {
              $size: {
                $filter: {
                  input: "$borrowHistory",
                  cond: { $eq: ["$$this.status", "borrowed"] },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: {
                $cond: [{ $gt: ["$activeBorrows", 0] }, 1, 0],
              },
            },
            avgBorrowsPerUser: { $avg: "$totalBorrows" },
          },
        },
      ])
      .toArray()

    // Daily activity for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyActivity = await borrowRecords
      .aggregate([
        {
          $match: {
            borrowDate: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$borrowDate",
              },
            },
            borrowCount: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray()

    // Overdue analysis
    const overdueAnalysis = await borrowRecords
      .aggregate([
        {
          $match: {
            status: "borrowed",
            dueDate: { $lt: new Date() },
          },
        },
        {
          $addFields: {
            daysOverdue: {
              $divide: [{ $subtract: [new Date(), "$dueDate"] }, 1000 * 60 * 60 * 24],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalOverdue: { $sum: 1 },
            avgDaysOverdue: { $avg: "$daysOverdue" },
            maxDaysOverdue: { $max: "$daysOverdue" },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      categoryAnalytics,
      monthlyTrends,
      topBorrowedBooks,
      userStats: userStats[0] || { totalUsers: 0, activeUsers: 0, avgBorrowsPerUser: 0 },
      dailyActivity,
      overdueAnalysis: overdueAnalysis[0] || { totalOverdue: 0, avgDaysOverdue: 0, maxDaysOverdue: 0 },
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
