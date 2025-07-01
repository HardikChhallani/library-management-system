import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { BorrowRecord } from "@/lib/models"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { bookId } = await request.json()
    if (!bookId) {
      return NextResponse.json({ error: "Book ID required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("library")
    const books = db.collection("books")
    const borrowRecords = db.collection<BorrowRecord>("borrowRecords")
    const users = db.collection("users")

    // Check if book is available
    const book = await books.findOne({ _id: new ObjectId(bookId) })
    if (!book || book.availableCopies <= 0) {
      return NextResponse.json({ error: "Book not available" }, { status: 400 })
    }

    // Check if user already borrowed this book
    const existingRecord = await borrowRecords.findOne({
      userId: decoded.userId,
      bookId,
      status: "borrowed",
    })

    if (existingRecord) {
      return NextResponse.json({ error: "You have already borrowed this book" }, { status: 400 })
    }

    // Create borrow record
    const borrowDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14) // 2 weeks loan period

    const borrowRecord: Omit<BorrowRecord, "_id"> = {
      userId: decoded.userId,
      bookId,
      borrowDate,
      dueDate,
      status: "borrowed",
    }

    await borrowRecords.insertOne(borrowRecord)

    // Update book availability
    await books.updateOne({ _id: new ObjectId(bookId) }, { $inc: { availableCopies: -1 } })

    // Update user's borrowed books
    await users.updateOne({ _id: new ObjectId(decoded.userId) }, { $push: { borrowedBooks: bookId } })

    return NextResponse.json({ message: "Book borrowed successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
