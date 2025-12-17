import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { Company } from "../selector/CompanySelectorComponent";

const { VITE_API_URL } = import.meta.env;

interface Department {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface UserCompany {
  userId: string;
  companyId: string;
  company: {
    id: string;
    code: string;
    name: string;
  };
}

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  companies: UserCompany[];
  person: {
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    contactEmail: string | null;
    phoneNumber: string | null;
    departmentId: string | null;
    position: string | null;
    status: string;
    userCode: string;
    department: {
      id: string;
      name: string;
    } | null;
  } | null;
}

interface UpdateUserProps {
  userID?: string;
  departments: Department[];
  selectedCompany: Company | null;
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method: "GET",
    headers,
    credentials: "include",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export default function UpdateUser({ userID, departments, selectedCompany }: UpdateUserProps) {
  const navigate = useNavigate();
  const isEditMode = Boolean(userID);

  // Fetch user data if editing
  const { data: userData, error: userError } = useSWR<UserData>(
    userID ? `${VITE_API_URL}/api/users/${userID}` : null,
    fetcher
  );

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
    firstName: "",
    lastName: "",
    contactEmail: "",
    phoneNumber: "",
    departmentId: "",
    position: "",
    status: "Activo",
    isActive: true,
    companyId: selectedCompany?.id || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Populate form when editing
  useEffect(() => {
    if (userData && isEditMode) {
      // Obtener el companyId de la compañía seleccionada o la primera disponible
      const currentCompany = userData.companies.find(
        (uc) => uc.company.code === selectedCompany?.code
      );
      const companyId = currentCompany?.companyId || userData.companies[0]?.companyId || "";

      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        password: "",
        confirmPassword: "",
        role: userData.role || "USER",
        firstName: userData.person?.firstName || "",
        lastName: userData.person?.lastName || "",
        contactEmail: userData.person?.contactEmail || "",
        phoneNumber: userData.person?.phoneNumber || "",
        departmentId: userData.person?.departmentId || "",
        position: userData.person?.position || "",
        status: userData.person?.status || "Activo",
        isActive: userData.isActive,
        companyId: companyId,
      });
    }
  }, [userData, isEditMode, selectedCompany]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) newErrors.username = "El nombre de usuario es requerido";
    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email inválido";
    
    if (!isEditMode) {
      if (!formData.password) newErrors.password = "La contraseña es requerida";
      if (formData.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    if (!formData.firstName.trim()) newErrors.firstName = "El nombre es requerido";
    if (!formData.lastName.trim()) newErrors.lastName = "El apellido es requerido";
    if (!formData.companyId) newErrors.companyId = "Debe seleccionar una compañía";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      const payload: any = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactEmail: formData.contactEmail || formData.email,
        phoneNumber: formData.phoneNumber,
        departmentId: formData.departmentId || null,
        position: formData.position,
        status: formData.status,
        isActive: formData.isActive,
        companyId: formData.companyId,
      };

      // Solo incluir password si se proporcionó uno
      if (formData.password) {
        payload.password = formData.password;
      }

      const url = isEditMode
        ? `${VITE_API_URL}/api/users/${userID}`
        : `${VITE_API_URL}/api/users`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la solicitud");
      }

      // Redirigir a la lista de usuarios
      navigate(`/${selectedCompany?.code}/users/all`);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSubmitError(error.message || "Error al guardar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (userError) {
    return (
      <div className="bg-red-900/30 border border-red-600 rounded-lg p-6 text-red-300">
        <p>Error al cargar los datos del usuario</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-red-300">
          {submitError}
        </div>
      )}

      {/* Información de Cuenta */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-6 text-white">Información de Cuenta</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de Usuario *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full bg-gray-700 border ${
                errors.username ? "border-red-500" : "border-gray-600"
              } rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="usuario123"
            />
            {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-gray-700 border ${
                errors.email ? "border-red-500" : "border-gray-600"
              } rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="usuario@ejemplo.com"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña {!isEditMode && "*"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full bg-gray-700 border ${
                errors.password ? "border-red-500" : "border-gray-600"
              } rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder={isEditMode ? "Dejar vacío para mantener la actual" : "••••••••"}
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Contraseña {!isEditMode && "*"}
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full bg-gray-700 border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-600"
              } rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rol *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
              <option value="MODERATOR">Moderador</option>
              <option value="SUPER_ADMIN">Super Administrador</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-300">Cuenta Activa</label>
          </div>
        </div>
      </div>

      {/* Información Personal */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-6 text-white">Información Personal</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full bg-gray-700 border ${
                errors.firstName ? "border-red-500" : "border-gray-600"
              } rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Juan"
            />
            {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Apellido *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full bg-gray-700 border ${
                errors.lastName ? "border-red-500" : "border-gray-600"
              } rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Pérez"
            />
            {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email de Contacto
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="contacto@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+507 1234-5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Posición</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Desarrollador"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Departamento
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar departamento</option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Información de Compañía */}
      {isEditMode && userData && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Compañías Asignadas</h2>
          <div className="space-y-2">
            {userData.companies.map((uc) => (
              <div
                key={uc.companyId}
                className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
              >
                <div>
                  <p className="text-white font-medium">{uc.company.name}</p>
                  <p className="text-gray-400 text-sm">{uc.company.code}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    uc.companyId === formData.companyId
                      ? "bg-blue-600 text-blue-100"
                      : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {uc.companyId === formData.companyId ? "Actual" : "Asignada"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate(`/${selectedCompany?.code}/users/all`)}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Guardando...</span>
            </>
          ) : (
            <span>{isEditMode ? "Actualizar Usuario" : "Crear Usuario"}</span>
          )}
        </button>
      </div>
    </form>
  );
}