import clientPromise from "./mongodb"
import bcrypt from "bcryptjs"

const ADMIN_USER = {
  name: "Administrator",
  email: "admin@admin.com",
  password: "admin123",
  role: "admin",
  borrowedBooks: [],
  createdAt: new Date(),
}

const DEMO_BOOKS = [
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    category: "Fiction",
    description: "A gripping tale of racial injustice and childhood innocence in the American South.",
    totalCopies: 5,
    availableCopies: 5,
    createdAt: new Date(),
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "978-0-452-28423-4",
    category: "Fiction",
    description: "A dystopian social science fiction novel about totalitarian control.",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "978-0-14-143951-8",
    category: "Romance",
    description: "A romantic novel about manners, upbringing, morality, and marriage.",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date(),
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    category: "Fiction",
    description: "A classic American novel set in the Jazz Age.",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    isbn: "978-0-06-231609-7",
    category: "Non-Fiction",
    description: "A brief history of humankind from the Stone Age to the present.",
    totalCopies: 6,
    availableCopies: 6,
    createdAt: new Date(),
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "978-0-316-76948-0",
    category: "Fiction",
    description: "A controversial novel about teenage rebellion and alienation.",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date(),
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    isbn: "978-1-4516-4853-9",
    category: "Biography",
    description: "The exclusive biography of Apple's co-founder.",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    isbn: "978-0-307-47427-5",
    category: "Mystery",
    description: "A mystery thriller involving secret societies and religious history.",
    totalCopies: 5,
    availableCopies: 5,
    createdAt: new Date(),
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "978-0-553-38016-3",
    category: "Science",
    description: "A landmark volume in science writing by one of the great minds of our time.",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date(),
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    isbn: "978-0-06-231500-7",
    category: "Fiction",
    description: "A philosophical book about following your dreams.",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0-13-235088-4",
    category: "Technology",
    description: "A handbook of agile software craftsmanship.",
    totalCopies: 5,
    availableCopies: 5,
    createdAt: new Date(),
  },
  {
    title: "The Girl with the Dragon Tattoo",
    author: "Stieg Larsson",
    isbn: "978-0-307-45454-3",
    category: "Mystery",
    description: "A psychological thriller about a journalist and a hacker.",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    isbn: "978-1-5247-6313-8",
    category: "Biography",
    description: "An intimate, powerful memoir by the former First Lady.",
    totalCopies: 6,
    availableCopies: 6,
    createdAt: new Date(),
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "978-0-547-92822-7",
    category: "Fiction",
    description: "A fantasy adventure about a hobbit's unexpected journey.",
    totalCopies: 5,
    availableCopies: 5,
    createdAt: new Date(),
  },
  {
    title: "Educated",
    author: "Tara Westover",
    isbn: "978-0-399-59050-4",
    category: "Biography",
    description: "A memoir about education, family, and the struggle for self-invention.",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    isbn: "978-0-307-88789-4",
    category: "Technology",
    description: "How today's entrepreneurs use continuous innovation to create successful businesses.",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date(),
  },
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    isbn: "978-0-307-58836-4",
    category: "Mystery",
    description: "A psychological thriller about a marriage gone terribly wrong.",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "The Fault in Our Stars",
    author: "John Green",
    isbn: "978-0-14-242417-9",
    category: "Romance",
    description: "A love story about two teenagers who meet in a cancer support group.",
    totalCopies: 5,
    availableCopies: 5,
    createdAt: new Date(),
  },
  {
    title: "Sapiens: A Graphic History",
    author: "Yuval Noah Harari",
    isbn: "978-0-06-305159-1",
    category: "History",
    description: "The groundbreaking book reimagined as a graphic novel.",
    totalCopies: 3,
    availableCopies: 3,
    createdAt: new Date(),
  },
  {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    isbn: "978-1-982-13719-1",
    category: "Non-Fiction",
    description: "Powerful lessons in personal change and effectiveness.",
    totalCopies: 4,
    availableCopies: 4,
    createdAt: new Date(),
  },
]

export async function initializeDatabase() {
  try {
    const client = await clientPromise
    const db = client.db("library")

    // Check if data already exists
    const existingBooks = await db.collection("books").countDocuments()
    const existingAdmin = await db.collection("users").findOne({ email: "admin@admin.com" })

    if (existingBooks > 0 && existingAdmin) {
      console.log("Database already initialized")
      return { success: true, message: "Database already initialized" }
    }

    // Clear existing data
    await db.collection("users").deleteMany({})
    await db.collection("books").deleteMany({})
    await db.collection("borrowRecords").deleteMany({})

    // Create admin user
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 12)
    await db.collection("users").insertOne({
      ...ADMIN_USER,
      password: hashedPassword,
    })

    // Insert demo books
    await db.collection("books").insertMany(DEMO_BOOKS)

    console.log("Database initialized successfully")
    return {
      success: true,
      message: "Database initialized successfully",
      booksAdded: DEMO_BOOKS.length,
    }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error: "Failed to initialize database" }
  }
}

export async function createTestBorrowRecords() {
  try {
    const client = await clientPromise
    const db = client.db("library")

    // Get a test user (you'll need to create one first)
    const users = await db.collection("users").find({ role: "user" }).limit(1).toArray()
    const books = await db.collection("books").find({}).limit(3).toArray()

    if (users.length > 0 && books.length > 0) {
      const testRecords = [
        {
          userId: users[0]._id.toString(),
          bookId: books[0]._id.toString(),
          borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago (overdue)
          dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
          status: "borrowed",
        },
        {
          userId: users[0]._id.toString(),
          bookId: books[1]._id.toString(),
          borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
          status: "borrowed",
        },
      ]

      await db.collection("borrowRecords").insertMany(testRecords)

      // Update book availability
      await db.collection("books").updateOne({ _id: books[0]._id }, { $inc: { availableCopies: -1 } })
      await db.collection("books").updateOne({ _id: books[1]._id }, { $inc: { availableCopies: -1 } })
    }
  } catch (error) {
    console.error("Error creating test borrow records:", error)
  }
}
