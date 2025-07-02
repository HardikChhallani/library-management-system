"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Search, Heart, Clock, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import type { Book } from "@/lib/models"

interface BorrowedBook {
  _id: string
  bookId: string
  borrowDate: string
  dueDate: string
  isOverdue: boolean
  daysUntilDue: number
  book: Book
}

export function UserDashboard() {
  const [books, setBooks] = useState<Book[]>([])
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [userBorrowedBookIds, setUserBorrowedBookIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [borrowedLoading, setBorrowedLoading] = useState(true)

  const categories = ["Fiction", "Non-Fiction", "Science", "Technology", "History", "Biography", "Mystery", "Romance"]

  useEffect(() => {
    fetchBooks()
    fetchBorrowedBooks()
  }, [searchTerm, selectedCategory])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory !== "all") params.append("category", selectedCategory)

      const response = await fetch(`/api/books?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBooks(data)
      }
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBorrowedBooks = async () => {
    try {
      setBorrowedLoading(true)
      const response = await fetch("/api/user/borrowed-books")
      if (response.ok) {
        const data = await response.json()
        setBorrowedBooks(data)
        setUserBorrowedBookIds(data.map((item: BorrowedBook) => item.bookId))
      }
    } catch (error) {
      console.error("Error fetching borrowed books:", error)
    } finally {
      setBorrowedLoading(false)
    }
  }

  const handleBorrowBook = async (bookId: string) => {
    try {
      const response = await fetch("/api/books/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      })

      if (response.ok) {
        fetchBooks()
        fetchBorrowedBooks()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to borrow book")
      }
    } catch (error) {
      console.error("Error borrowing book:", error)
      alert("Failed to borrow book")
    }
  }

  const handleReturnBook = async (bookId: string) => {
    try {
      const response = await fetch("/api/books/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      })

      if (response.ok) {
        fetchBooks()
        fetchBorrowedBooks()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to return book")
      }
    } catch (error) {
      console.error("Error returning book:", error)
      alert("Failed to return book")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysUntilDueText = (daysUntilDue: number, isOverdue: boolean) => {
    if (isOverdue) {
      return `${Math.abs(Math.floor(daysUntilDue))} days overdue`
    }
    const days = Math.floor(daysUntilDue)
    if (days === 0) return "Due today"
    if (days === 1) return "Due tomorrow"
    return `Due in ${days} days`
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularBooks = books
    .filter((book) => book.totalCopies - book.availableCopies > 0)
    .sort((a, b) => b.totalCopies - b.availableCopies - (a.totalCopies - a.availableCopies))
    .slice(0, 6)

  const newArrivals = books.slice(0, 6)

  const overdueCount = borrowedBooks.filter((book) => book.isOverdue).length
  const dueSoonCount = borrowedBooks.filter((book) => !book.isOverdue && book.daysUntilDue <= 3).length

  return (
    <div className="space-y-8">
      {/* Welcome Hero Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader className="pb-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold mb-2">Welcome to the Library</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Discover amazing books from our collection of {books.length} titles
              </CardDescription>
            </div>
            <BookOpen className="h-16 w-16 text-blue-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{books.length}</div>
              <div className="text-blue-200">Total Books</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{borrowedBooks.length}</div>
              <div className="text-blue-200">My Books</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{overdueCount}</div>
              <div className="text-blue-200">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dueSoonCount}</div>
              <div className="text-blue-200">Due Soon</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts for overdue and due soon books */}
      {overdueCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {overdueCount} overdue book{overdueCount > 1 ? "s" : ""}. Please return them as soon as possible.
          </AlertDescription>
        </Alert>
      )}

      {dueSoonCount > 0 && overdueCount === 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            You have {dueSoonCount} book{dueSoonCount > 1 ? "s" : ""} due within 3 days. Don't forget to return them!
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Books</TabsTrigger>
          <TabsTrigger value="my-books" className="relative">
            My Books
            {borrowedBooks.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {borrowedBooks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="new">New Arrivals</TabsTrigger>
        </TabsList>

        <TabsContent value="my-books" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Borrowed Books
              </CardTitle>
              <CardDescription>Manage your currently borrowed books and due dates</CardDescription>
            </CardHeader>
          </Card>

          {borrowedLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : borrowedBooks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No borrowed books</h3>
                <p className="text-muted-foreground mb-4">You have not borrowed any books yet.</p>
                <Button onClick={() => (document.querySelector('[value="browse"]') as HTMLElement | null)?.click()}>Browse Books</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {borrowedBooks.map((borrowedBook) => (
                <Card
                  key={borrowedBook._id}
                  className={`hover:shadow-lg transition-shadow ${
                    borrowedBook.isOverdue ? "border-red-200 bg-red-50" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-1">{borrowedBook.book.title}</CardTitle>
                        <CardDescription className="text-sm">by {borrowedBook.book.author}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          borrowedBook.isOverdue
                            ? "destructive"
                            : borrowedBook.daysUntilDue <= 3
                              ? "secondary"
                              : "default"
                        }
                      >
                        {borrowedBook.isOverdue ? "Overdue" : borrowedBook.daysUntilDue <= 3 ? "Due Soon" : "Active"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Borrowed:</span>
                        <span>{formatDate(borrowedBook.borrowDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className={borrowedBook.isOverdue ? "text-red-600 font-medium" : ""}>
                          {formatDate(borrowedBook.dueDate)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span
                          className={
                            borrowedBook.isOverdue
                              ? "text-red-600 font-medium"
                              : borrowedBook.daysUntilDue <= 3
                                ? "text-orange-600 font-medium"
                                : "text-green-600"
                          }
                        >
                          {getDaysUntilDueText(borrowedBook.daysUntilDue, borrowedBook.isOverdue)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Progress
                        value={borrowedBook.isOverdue ? 100 : Math.max(0, 100 - (borrowedBook.daysUntilDue / 14) * 100)}
                        className={`h-2 ${borrowedBook.isOverdue ? "[&>div]:bg-red-500" : ""}`}
                      />
                    </div>

                    <Button
                      onClick={() => handleReturnBook(borrowedBook.bookId)}
                      className="w-full"
                      variant={borrowedBook.isOverdue ? "destructive" : "default"}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Return Book
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          {/* Enhanced Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Your Next Great Read
              </CardTitle>
              <CardDescription>Search through our extensive collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search books by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Books Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <Card key={book._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-1">{book.title}</CardTitle>
                        <CardDescription className="text-sm">by {book.author}</CardDescription>
                      </div>
                      <Badge
                        variant={book.availableCopies > 0 ? "default" : "secondary"}
                        className={
                          book.availableCopies > 0
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {book.availableCopies > 0 ? "Available" : "Out of Stock"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <Badge variant="outline" className="text-xs">
                        {book.category}
                      </Badge>
                      <span className="text-muted-foreground">{book.availableCopies} available</span>
                    </div>

                    {book.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{book.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Availability</span>
                        <span>
                          {book.availableCopies}/{book.totalCopies}
                        </span>
                      </div>
                      <Progress value={(book.availableCopies / book.totalCopies) * 100} className="h-2" />
                    </div>

                    <Button
                      className="w-full"
                      disabled={book.availableCopies === 0 || userBorrowedBookIds.includes(book._id!)}
                      onClick={() => handleBorrowBook(book._id!)}
                      variant={book.availableCopies === 0 ? "secondary" : "default"}
                    >
                      {userBorrowedBookIds.includes(book._id!)
                        ? "✓ Already Borrowed"
                        : book.availableCopies === 0
                          ? "Out of Stock"
                          : "Borrow Book"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredBooks.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No books found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or browse different categories.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Most Popular Books
              </CardTitle>
              <CardDescription>Books that are currently in high demand</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {popularBooks.map((book, index) => (
              <Card key={book._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge variant="outline">{book.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{book.title}</CardTitle>
                      <CardDescription>by {book.author}</CardDescription>
                    </div>
                    <Heart className="h-4 w-4 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                    <div className="flex justify-between text-sm">
                      <span>Borrowed: {book.totalCopies - book.availableCopies}</span>
                      <span>Available: {book.availableCopies}</span>
                    </div>
                    <Button
                      className="w-full"
                      disabled={book.availableCopies === 0 || userBorrowedBookIds.includes(book._id!)}
                      onClick={() => handleBorrowBook(book._id!)}
                    >
                      {userBorrowedBookIds.includes(book._id!) ? "✓ Already Borrowed" : "Borrow Book"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                New Arrivals
              </CardTitle>
              <CardDescription>Recently added books to our collection</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newArrivals.map((book) => (
              <Card key={book._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-green-100 text-green-800 text-xs">New</Badge>
                        <Badge variant="outline">{book.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{book.title}</CardTitle>
                      <CardDescription>by {book.author}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                    <div className="flex justify-between text-sm">
                      <span>Total Copies: {book.totalCopies}</span>
                      <span>Available: {book.availableCopies}</span>
                    </div>
                    <Button
                      className="w-full"
                      disabled={book.availableCopies === 0 || userBorrowedBookIds.includes(book._id!)}
                      onClick={() => handleBorrowBook(book._id!)}
                    >
                      {userBorrowedBookIds.includes(book._id!) ? "✓ Already Borrowed" : "Borrow Book"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
