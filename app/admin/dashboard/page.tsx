import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Navbar } from "@/components/layout/navbar"

export default function AdminDashboardPage() {
  // In a real app, you'd get user info from session/cookies
  const user = { name: "Admin User", role: "admin" }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your library's books and operations</p>
        </div>
        <AdminDashboard />
      </div>
    </div>
  )
}
