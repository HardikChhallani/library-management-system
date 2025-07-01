import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Book } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")

    const client = await clientPromise
    const db = client.db("library")
    const books = db.collection<Book>("books")

    const query: any = {}

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { author: { $regex: search, $options: "i" } }]
    }

    if (category && category !== "all") {
      query.category = category
    }

    const booksList = await books.find(query).toArray()

    return NextResponse.json(booksList)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const bookData = await request.json()
    const { title, author, isbn, category, description, totalCopies, imageUrl } = bookData

    if (!title || !author || !isbn || !category || !totalCopies) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("library")
    const books = db.collection<Book>("books")

    const newBook: Omit<Book, "_id"> = {
      title,
      author,
      isbn,
      category,
      description: description || "",
      totalCopies: Number.parseInt(totalCopies),
      availableCopies: Number.parseInt(totalCopies),
      createdAt: new Date(),
    }

    const result = await books.insertOne(newBook)

    return NextResponse.json(
      {
        message: "Book added successfully",
        bookId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
