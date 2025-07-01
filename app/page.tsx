import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Shield, Search, Star, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <BookOpen className="h-20 w-20 text-primary" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Library Management System
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            A comprehensive solution for managing library resources, user accounts, and book lending operations.
            Experience seamless book discovery and management with our modern interface.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3"
              asChild
            >
              <Link href="/auth/login">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 bg-transparent" asChild>
              <Link href="/auth/register">Create Account</Link>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid gap-6 md:grid-cols-3 mb-20">
          <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">20+</div>
              <div className="text-blue-800 font-medium">Demo Books</div>
              <div className="text-sm text-blue-600 mt-1">Ready to explore</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">8</div>
              <div className="text-green-800 font-medium">Categories</div>
              <div className="text-sm text-green-600 mt-1">Diverse collection</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-purple-800 font-medium">Access</div>
              <div className="text-sm text-purple-600 mt-1">Always available</div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-20">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Smart Book Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Add, edit, and organize your library's book collection with detailed information, categories, and
                real-time availability tracking.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive user account management with borrowing history, due date tracking, and automated
                notifications.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Powerful admin interface with analytics, reporting, and complete control over library operations and
                user management.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Advanced Search</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Intelligent search and filtering capabilities with category browsing, popularity tracking, and
                personalized recommendations.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Demo Credentials */}
        <Card className="mb-20 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Clock className="h-5 w-5" />
              Ready to Explore
            </CardTitle>
            <CardDescription className="text-center">
              The system comes pre-loaded with demo data for immediate testing
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-white rounded-lg border">
                <div className="font-semibold text-sm text-gray-600 mb-1">Admin Access</div>
                <div className="font-mono text-sm">admin@admin.com / admin123</div>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <div className="font-semibold text-sm text-gray-600 mb-1">User Access</div>
                <div className="text-sm">Register as new user</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Demo data includes 20 books across 8 categories, automatically loaded on first visit
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl mb-2">Ready to Get Started?</CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Join our library management system today and experience modern library operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8 py-3" asChild>
                <Link href="/auth/register">Register Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
                asChild
              >
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
