export interface User {
  _id?: string
  name: string
  email: string
  password: string
  role: "user" | "admin"
  borrowedBooks: string[]
  createdAt: Date
}

export interface Book {
  _id?: string
  title: string
  author: string
  isbn: string
  category: string
  description: string
  totalCopies: number
  availableCopies: number
  createdAt: Date
}

export interface BorrowRecord {
  _id?: string
  userId: string
  bookId: string
  borrowDate: Date
  dueDate: Date
  returnDate?: Date
  status: "borrowed" | "returned" | "overdue"
}
