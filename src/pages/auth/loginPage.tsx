"use client"

import { useState } from "react"
import Images from "../../assets"
import LoginForm from "../../components/forms/loginForm"

function LoginPage() {
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
            <img src={Images.logo || "/placeholder.svg"} alt="logo" width={100} height={100} className="rounded-lg" />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold text-white">Iniciar Sesión</h1>
            <p className="text-gray-500 text-sm">Accede con tus credenciales</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <LoginForm
            pending={pending}
            setPending={setPending}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={error}
            setError={setError}
          />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
