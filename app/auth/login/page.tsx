import { LoginForm } from "@/components/auth/login-form"
import { Navbar } from "@/components/layout/navbar"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-12">
        <LoginForm />
      </div>
    </div>
  )
}
