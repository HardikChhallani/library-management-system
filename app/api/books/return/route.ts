import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
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
    const borrowRecords = db.collection("borrowRecords")
    const users = db.collection("users")

    // Find the active borrow record
    const borrowRecord = await borrowRecords.findOne({
      userId: decoded.userId,
      bookId,
      status: "borrowed",
    })

    if (!borrowRecord) {
      return NextResponse.json({ error: "No active borrow record found" }, { status: 400 })
    }

    // Update borrow record
    await borrowRecords.updateOne(
      { _id: borrowRecord._id },
      {
        $set: {
          returnDate: new Date(),
          status: "returned",
        },
      },
    )

    // Update book availability
    await books.updateOne({ _id: new ObjectId(bookId) }, { $inc: { availableCopies: 1 } })

    // Remove book from user's borrowed books
    await users.updateOne({ _id: new ObjectId(decoded.userId) }, { $pull: { borrowedBooks: bookId } })

    return NextResponse.json({ message: "Book returned successfully" })
  } catch (error) {
    console.error("Return book error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
