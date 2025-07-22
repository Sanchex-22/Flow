

import { useNavigate } from "react-router-dom";
import useUser from "../../hook/useUser";
import InputLabel from "./InputLabel";
import LoginSubmitButton from "./LoginSubmitButton";

interface LoginFormProps {
  pending: boolean;
  setPending: (value: boolean) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  error: Error | null;
  setError: (error: Error | null) => void;
}

export default function LoginForm({
  pending,
  setPending,
  showPassword,
  setShowPassword,
  error,
  setError,
}: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useUser()
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      setError(new Error("Todos los campos son obligatorios."));
      setPending(false);
      return;
    }

    try {
      await login({ email, password });
      navigate("/account/quotes");
    } catch (error) {
      setError(
        new Error(
          error instanceof Error ? error.message : "Error al iniciar sesión."
        )
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputLabel
        type="text"
        required
        placeholder="Add email here"
        id="email"
        name="email"
      />

      <div>
        <InputLabel
          type={showPassword ? "text" : "password"}
          required
          placeholder="Add password here"
          id="password"
          name="password"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
          className="mr-2"
        />
        <label className="text-gray-600">Mostrar contraseña</label>
      </div>

      {error && <p className="text-orange-500">{error.message}</p>}

      <div className="mt-4">
        <LoginSubmitButton
          pending={pending}
          modelExists={false}
          model="Login"
        />
      </div>
    </form>
  );
}
