"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Users,
  Plus,
  Search,
  TrendingUp,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Bell,
} from "lucide-react"
import type { Book } from "@/lib/models"
import { NotificationPanel } from "./notification-panel"
import { AnalyticsCharts } from "./analytics-charts"

export function AdminDashboard() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    description: "",
    totalCopies: "",
  })
  const [overdueBooks, setOverdueBooks] = useState([])

  const categories = ["Fiction", "Non-Fiction", "Science", "Technology", "History", "Biography", "Mystery", "Romance"]

  useEffect(() => {
    fetchBooks()
    fetchOverdueBooks()
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

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      })

      if (response.ok) {
        setIsAddBookOpen(false)
        setNewBook({
          title: "",
          author: "",
          isbn: "",
          category: "",
          description: "",
          totalCopies: "",
        })
        fetchBooks()
      }
    } catch (error) {
      console.error("Error adding book:", error)
    }
  }

  const fetchOverdueBooks = async () => {
    try {
      const response = await fetch("/api/admin/overdue-books")
      if (response.ok) {
        const data = await response.json()
        setOverdueBooks(data)
      }
    } catch (error) {
      console.error("Error fetching overdue books:", error)
    }
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalBooks = books.length
  const totalCopies = books.reduce((sum, book) => sum + book.totalCopies, 0)
  const availableCopies = books.reduce((sum, book) => sum + book.availableCopies, 0)
  const borrowedBooks = totalCopies - availableCopies
  const utilizationRate = totalCopies > 0 ? (borrowedBooks / totalCopies) * 100 : 0

  const categoryStats = categories.map((category) => {
    const categoryBooks = books.filter((book) => book.category === category)
    return {
      name: category,
      count: categoryBooks.length,
      available: categoryBooks.reduce((sum, book) => sum + book.availableCopies, 0),
      total: categoryBooks.reduce((sum, book) => sum + book.totalCopies, 0),
    }
  })

  return (
    <div className="space-y-8">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="books">Books Management</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Books</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            Notifications
            <Bell className="h-3 w-3 ml-1" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Books</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{totalBooks}</div>
                <p className="text-xs text-blue-600 mt-1">
                  Across {new Set(books.map((book) => book.category)).size} categories
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Available Copies</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{availableCopies}</div>
                <p className="text-xs text-green-600 mt-1">Out of {totalCopies} total copies</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Borrowed Books</CardTitle>
                <Users className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{borrowedBooks}</div>
                <p className="text-xs text-orange-600 mt-1">{utilizationRate.toFixed(1)}% utilization rate</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Library Health</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {utilizationRate > 70 ? "High" : utilizationRate > 40 ? "Good" : "Low"}
                </div>
                <Progress value={utilizationRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Overdue Books</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">{overdueBooks.length}</div>
                <p className="text-xs text-red-600 mt-1">Require immediate attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Notifications Panel */}
          <NotificationPanel />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Book</DialogTitle>
                      <DialogDescription>Add a new book to the library collection.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddBook} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={newBook.title}
                            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="author">Author</Label>
                          <Input
                            id="author"
                            value={newBook.author}
                            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="isbn">ISBN</Label>
                          <Input
                            id="isbn"
                            value={newBook.isbn}
                            onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="copies">Total Copies</Label>
                          <Input
                            id="copies"
                            type="number"
                            min="1"
                            value={newBook.totalCopies}
                            onChange={(e) => setNewBook({ ...newBook, totalCopies: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newBook.category}
                          onValueChange={(value) => setNewBook({ ...newBook, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newBook.description}
                          onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Add Book
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="books" className="space-y-6">
          {/* Search and Filter Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Book Management</CardTitle>
              <CardDescription>Search, filter, and manage your library collection</CardDescription>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <Card key={book._id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{book.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">by {book.author}</CardDescription>
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
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Category:</span>
                        <p className="font-medium">{book.category}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Copies:</span>
                        <p className="font-medium">
                          {book.availableCopies}/{book.totalCopies}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground text-sm">ISBN:</span>
                      <p className="text-sm font-mono">{book.isbn}</p>
                    </div>
                    {book.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                    )}
                    <div className="pt-2">
                      <Progress
                        value={((book.totalCopies - book.availableCopies) / book.totalCopies) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {book.totalCopies - book.availableCopies} of {book.totalCopies} copies borrowed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Overdue Books Management
              </CardTitle>
              <CardDescription>Books that are past their due date and require attention</CardDescription>
            </CardHeader>
          </Card>

          {overdueBooks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Overdue Books</h3>
                <p className="text-muted-foreground">All books are returned on time. Great job!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {overdueBooks.map((record) => (
                <Card key={record._id} className="border-red-200 bg-red-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-red-900">{record.book.title}</CardTitle>
                        <CardDescription className="text-red-700">
                          by {record.book.author} • Borrowed by {record.user.name}
                        </CardDescription>
                      </div>
                      <Badge variant="destructive">{Math.floor(record.daysOverdue)} days overdue</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-red-800">Borrower:</span>
                        <p className="text-red-700">{record.user.name}</p>
                        <p className="text-red-600 text-xs">{record.user.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-red-800">Due Date:</span>
                        <p className="text-red-700">{new Date(record.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-red-800">Borrowed Date:</span>
                        <p className="text-red-700">{new Date(record.borrowDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Advanced Analytics & Insights
              </CardTitle>
              <CardDescription>Comprehensive analysis of library performance and usage patterns</CardDescription>
            </CardHeader>
          </Card>
          <AnalyticsCharts />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
