"use client";

import { useState } from "react";
import LoginForm from "../../components/forms/loginForm";
import Images from "../../assets";

function LoginPage() {
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return (
    <div className="h-[90dvh] flex items-center justify-center text-blue-50 p-4">
      <div className="w-full max-w-md p-8 space-y-4 bg-white border  rounded-lg shadow-xl overflow-hidden">

        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
            <img
              src={Images.logo || "/placeholder.svg"}
              alt="logo"
              width={70}
              height={70}
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-blue-600 text-center">
          Iniciar Sesión
        </h1>
        <p className="text-neutral-400 text-center">
          Accede con tus credenciales
        </p>
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
  );
}

export default LoginPage;
