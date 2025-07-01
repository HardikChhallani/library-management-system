import { UserDashboard } from "@/components/user/user-dashboard"
import { Navbar } from "@/components/layout/navbar"

export default function UserDashboardPage() {
  // In a real app, you'd get user info from session/cookies
  const user = { name: "Library User", role: "user" }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <p className="text-muted-foreground">Browse and borrow books from our collection</p>
        </div>
        <UserDashboard />
      </div>
    </div>
  )
}
