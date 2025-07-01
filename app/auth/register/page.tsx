import { RegisterForm } from "@/components/auth/register-form"
import { Navbar } from "@/components/layout/navbar"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-12">
        <RegisterForm />
      </div>
    </div>
  )
}
