"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, Users, BookOpen, Calendar, BarChart3 } from "lucide-react"

interface AnalyticsData {
  categoryAnalytics: any[]
  monthlyTrends: any[]
  topBorrowedBooks: any[]
  userStats: any
  dailyActivity: any[]
  overdueAnalysis: any
}

const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // yellow
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
]

export function AnalyticsCharts() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) {
    return <div>Failed to load analytics data</div>
  }

  const formatMonthlyData = analytics.monthlyTrends.map((item) => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
    borrows: item.borrowCount,
    returns: item.returnCount,
  }))

  const categoryChartData = analytics.categoryAnalytics.map((item) => ({
    category: item._id,
    books: item.totalBooks,
    utilization: Math.round(item.utilizationRate),
    borrowed: item.borrowedCopies,
    available: item.availableCopies,
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{analytics.userStats.activeUsers} active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Borrows/User</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.userStats.avgBorrowsPerUser.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Books per user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overdueAnalysis.totalOverdue}</div>
            <p className="text-xs text-muted-foreground">
              Avg {analytics.overdueAnalysis.avgDaysOverdue.toFixed(1)} days overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.dailyActivity.reduce((sum, day) => sum + day.borrowCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Borrows in last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Books and utilization by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="books" fill="#3b82f6" name="Total Books" />
                <Bar dataKey="borrowed" fill="#ef4444" name="Borrowed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Utilization Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Utilization</CardTitle>
            <CardDescription>Borrowing rate by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, utilization }) => `${category}: ${utilization}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="utilization"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Borrowing Trends</CardTitle>
            <CardDescription>Borrows and returns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="borrows" stroke="#3b82f6" name="Borrows" strokeWidth={2} />
                <Line type="monotone" dataKey="returns" stroke="#10b981" name="Returns" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity (Last 30 Days)</CardTitle>
            <CardDescription>Daily borrowing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="borrowCount" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Borrowed Books */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top 10 Most Borrowed Books
          </CardTitle>
          <CardDescription>Books with highest borrowing frequency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topBorrowedBooks.map((item, index) => (
              <div key={item._id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <h4 className="font-medium">{item.book.title}</h4>
                    <p className="text-sm text-muted-foreground">by {item.book.author}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{item.borrowCount}</div>
                  <div className="text-sm text-muted-foreground">borrows</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Details */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance Details</CardTitle>
          <CardDescription>Detailed breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analytics.categoryAnalytics.map((category, index) => (
              <div key={category._id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-lg">{category._id}</h4>
                  <Badge
                    variant={
                      category.utilizationRate > 70
                        ? "destructive"
                        : category.utilizationRate > 40
                          ? "default"
                          : "secondary"
                    }
                  >
                    {Math.round(category.utilizationRate)}% utilized
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Books:</span>
                    <div className="font-medium">{category.totalBooks}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Copies:</span>
                    <div className="font-medium">{category.totalCopies}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available:</span>
                    <div className="font-medium text-green-600">{category.availableCopies}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Borrowed:</span>
                    <div className="font-medium text-blue-600">{category.borrowedCopies}</div>
                  </div>
                </div>
                <Progress value={category.utilizationRate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
