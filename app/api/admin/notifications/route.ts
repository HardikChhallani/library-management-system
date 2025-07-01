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
    const books = db.collection("books")

    // Get overdue books count
    const overdueCount = await borrowRecords.countDocuments({
      status: "borrowed",
      dueDate: { $lt: new Date() },
    })

    // Get books due today
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dueTodayCount = await borrowRecords.countDocuments({
      status: "borrowed",
      dueDate: { $gte: today, $lt: tomorrow },
    })

    // Get books due in next 3 days
    const threeDaysFromNow = new Date(today)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    const dueSoonCount = await borrowRecords.countDocuments({
      status: "borrowed",
      dueDate: { $gte: today, $lt: threeDaysFromNow },
    })

    // Get low stock books (less than 2 available copies)
    const lowStockBooks = await books.countDocuments({
      availableCopies: { $lt: 2, $gt: 0 },
    })

    // Get out of stock books
    const outOfStockBooks = await books.countDocuments({
      availableCopies: 0,
    })

    // Get recent activity (books borrowed in last 24 hours)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const recentBorrows = await borrowRecords.countDocuments({
      borrowDate: { $gte: yesterday },
      status: "borrowed",
    })

    const notifications = []

    if (overdueCount > 0) {
      notifications.push({
        id: "overdue",
        type: "error",
        title: "Overdue Books",
        message: `${overdueCount} book${overdueCount > 1 ? "s are" : " is"} overdue and require immediate attention`,
        count: overdueCount,
        priority: "high",
      })
    }

    if (dueTodayCount > 0) {
      notifications.push({
        id: "due-today",
        type: "warning",
        title: "Books Due Today",
        message: `${dueTodayCount} book${dueTodayCount > 1 ? "s are" : " is"} due today`,
        count: dueTodayCount,
        priority: "medium",
      })
    }

    if (dueSoonCount > 0) {
      notifications.push({
        id: "due-soon",
        type: "info",
        title: "Books Due Soon",
        message: `${dueSoonCount} book${dueSoonCount > 1 ? "s are" : " is"} due within 3 days`,
        count: dueSoonCount,
        priority: "low",
      })
    }

    if (outOfStockBooks > 0) {
      notifications.push({
        id: "out-of-stock",
        type: "warning",
        title: "Out of Stock",
        message: `${outOfStockBooks} book${outOfStockBooks > 1 ? "s are" : " is"} completely out of stock`,
        count: outOfStockBooks,
        priority: "medium",
      })
    }

    if (lowStockBooks > 0) {
      notifications.push({
        id: "low-stock",
        type: "info",
        title: "Low Stock Alert",
        message: `${lowStockBooks} book${lowStockBooks > 1 ? "s have" : " has"} less than 2 copies available`,
        count: lowStockBooks,
        priority: "low",
      })
    }

    if (recentBorrows > 0) {
      notifications.push({
        id: "recent-activity",
        type: "success",
        title: "Recent Activity",
        message: `${recentBorrows} book${recentBorrows > 1 ? "s were" : " was"} borrowed in the last 24 hours`,
        count: recentBorrows,
        priority: "low",
      })
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
