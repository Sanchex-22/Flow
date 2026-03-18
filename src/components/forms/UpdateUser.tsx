import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import Select from "react-select";
import { Company } from "../../context/routerContext";
import { useTheme } from "../../context/themeContext";

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

interface CompanyOption {
  value: string;
  label: string;
  code: string;
}

interface UpdateUserProps {
  userID?: string;
  departments: Department[];
  selectedCompany: Company | null;
}

const fetcher = async (url: string) => {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { method: "GET", headers, credentials: "include" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export default function UpdateUser({
  userID,
  departments,
  selectedCompany,
}: UpdateUserProps) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const isEditMode = Boolean(userID);

  const { data: userData, error: userError } = useSWR<UserData>(
    userID ? `${VITE_API_URL}/api/users/profile/${userID}` : null,
    fetcher
  );

  const { data: allCompanies } = useSWR<Array<{ id: string; name: string; code: string }>>(
    `${VITE_API_URL}/api/companies/all`,
    fetcher
  );

  const [fillPersonData, setFillPersonData] = useState(false);

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
    userCode: "",
  });

  const [selectedCompanies, setSelectedCompanies] = useState<CompanyOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  useEffect(() => {
    if (userData && isEditMode && allCompanies) {
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
        userCode: userData.person?.userCode || "",
      });

      if (userData.person) setFillPersonData(true);

      setSelectedCompanies(
        userData.companies.map((uc) => ({
          value: uc.company.id,
          label: uc.company.name,
          code: uc.company.code,
        }))
      );
    } else if (!isEditMode && selectedCompany) {
      setSelectedCompanies([
        {
          value: selectedCompany.id,
          label: selectedCompany.name,
          code: selectedCompany.code,
        },
      ]);
    }
  }, [userData, isEditMode, allCompanies, selectedCompany]);

  const companyOptions: CompanyOption[] =
    allCompanies?.map((c) => ({ value: c.id, label: c.name, code: c.code })) || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) newErrors.username = "El nombre de usuario es requerido";
    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email inválido";

    if (!isEditMode) {
      if (!formData.password) newErrors.password = "La contraseña es requerida";
      if (formData.password.length < 8)
        newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (formData.password && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

    if (fillPersonData) {
      if (!formData.firstName.trim()) newErrors.firstName = "El nombre es requerido";
      if (!formData.lastName.trim()) newErrors.lastName = "El apellido es requerido";
    }

    if (selectedCompanies.length === 0)
      newErrors.companies = "Debe seleccionar al menos una compañía";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      const payload: any = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        companyIds: selectedCompanies.map((c) => c.value),
      };

      if (formData.password) payload.password = formData.password;

      if (fillPersonData) {
        payload.createPerson = true;
        payload.updatePerson = true;
        payload.firstName = formData.firstName;
        payload.lastName = formData.lastName;
        payload.contactEmail = formData.contactEmail || formData.email;
        payload.phoneNumber = formData.phoneNumber;
        payload.departmentId = formData.departmentId || null;
        payload.position = formData.position;
        payload.status = formData.status;
        if (formData.userCode) payload.userCode = formData.userCode;
      } else {
        payload.createPerson = false;
        payload.updatePerson = false;
      }

      const url = isEditMode
        ? `${VITE_API_URL}/api/users/edit/${userID}`
        : `${VITE_API_URL}/api/users/create`;

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || `Error al ${isEditMode ? "actualizar" : "crear"} el usuario`
        );

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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Clases reutilizables según el tema ──────────────────────────────────────
  const card = isDarkMode
    ? "bg-[#2c2c2e] border-white/[0.08]"
    : "bg-white border-gray-200 shadow-sm";

  const cardTitle    = isDarkMode ? "text-white"     : "text-gray-900";
  const cardSubtitle = isDarkMode ? "text-white/50"  : "text-gray-500";
  const divider      = isDarkMode ? "border-white/[0.08]" : "border-gray-200";

  const inputBase = isDarkMode
    ? "bg-[#3a3a3c] border-white/[0.08] text-white placeholder-white/30 focus:border-blue-500/60 focus:ring-blue-500/20"
    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20";

  const selectBase = isDarkMode
    ? "bg-[#3a3a3c] border-white/[0.08] text-white focus:border-blue-500/60 focus:ring-blue-500/20"
    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20";

  const disabledInput = isDarkMode
    ? "bg-[#2c2c2e] border-white/[0.05] text-white/30 cursor-not-allowed"
    : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed";

  const cancelBtn = isDarkMode
    ? "bg-white/[0.06] hover:bg-white/10 text-white border border-white/[0.08]"
    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300";

  // React-Select dinámico
  const customStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: isDarkMode ? "#3a3a3c" : "#f9fafb",
      borderColor: errors.companies ? "#ef4444" : isDarkMode ? "rgba(255,255,255,0.08)" : "#d1d5db",
      minHeight: "42px",
      boxShadow: "none",
      borderRadius: "0.5rem",
      "&:hover": { borderColor: isDarkMode ? "rgba(255,255,255,0.15)" : "#9ca3af" },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDarkMode ? "#2c2c2e" : "#ffffff",
      border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#d1d5db"}`,
      borderRadius: "0.5rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused
        ? isDarkMode ? "rgba(255,255,255,0.06)" : "#f3f4f6"
        : "transparent",
      color: isDarkMode ? "#ffffff" : "#111827",
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: isDarkMode ? "rgba(59,130,246,0.25)" : "#dbeafe",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: isDarkMode ? "#93c5fd" : "#1d4ed8",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: isDarkMode ? "#93c5fd" : "#1d4ed8",
      "&:hover": {
        backgroundColor: isDarkMode ? "rgba(59,130,246,0.4)" : "#bfdbfe",
        color: isDarkMode ? "#ffffff" : "#1e40af",
      },
    }),
    input: (base: any) => ({ ...base, color: isDarkMode ? "#ffffff" : "#111827" }),
    placeholder: (base: any) => ({ ...base, color: isDarkMode ? "rgba(255,255,255,0.3)" : "#9ca3af" }),
    singleValue: (base: any) => ({ ...base, color: isDarkMode ? "#ffffff" : "#111827" }),
  };

  if (userError) {
    return (
      <div className="bg-red-900/30 border border-red-600 rounded-lg p-6 text-red-300">
        <p>Error al cargar los datos del usuario</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitError && (
        <div className={`rounded-xl p-4 border flex items-start gap-3 ${
          isDarkMode
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm font-medium">{submitError}</p>
        </div>
      )}

      {/* ── Información de Cuenta ── */}
      <div className={`rounded-xl p-5 sm:p-6 border transition-colors duration-200 ${card}`}>
        <div className="mb-5">
          <h2 className={`text-base sm:text-lg font-semibold ${cardTitle}`}>Información de Cuenta</h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${cardSubtitle}`}>Credenciales y permisos del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>
              Nombre de Usuario *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBase} ${errors.username ? "border-red-500" : ""}`}
              placeholder="usuario123"
            />
            {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBase} ${errors.email ? "border-red-500" : ""}`}
              placeholder="usuario@ejemplo.com"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>
              Contraseña {!isEditMode && "*"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBase} ${errors.password ? "border-red-500" : ""}`}
              placeholder={isEditMode ? "Dejar vacío para mantener la actual" : "••••••••"}
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>
              Confirmar Contraseña {!isEditMode && "*"}
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBase} ${errors.confirmPassword ? "border-red-500" : ""}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>Rol *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${selectBase}`}
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
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className={`ml-2 text-sm ${cardSubtitle}`}>Cuenta Activa</label>
          </div>
        </div>
      </div>

      {/* ── Toggle Información Personal ── */}
      <div className={`rounded-xl p-5 sm:p-6 border transition-colors duration-200 ${card}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold ${cardTitle}`}>Información Personal</h2>
            <p className={`text-sm mt-1 ${cardSubtitle}`}>
              {fillPersonData
                ? "Los datos personales serán guardados junto al usuario."
                : "Opcional — puedes completar estos datos ahora o más adelante."}
            </p>
          </div>

          {/* Toggle switch */}
          <button
            type="button"
            onClick={() => {
              setFillPersonData((prev) => !prev);
              if (fillPersonData) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.firstName;
                  delete next.lastName;
                  return next;
                });
              }
            }}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isDarkMode ? "focus:ring-offset-gray-800" : "focus:ring-offset-white"
            } ${fillPersonData ? "bg-blue-600" : isDarkMode ? "bg-gray-600" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                fillPersonData ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {fillPersonData && (
          <div className={`mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 ${divider}`}>
            <div>
              <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>Nombre *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBase} ${errors.firstName ? "border-red-500" : ""}`}
                placeholder="Juan"
              />
              {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>Apellido *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBase} ${errors.lastName ? "border-red-500" : ""}`}
                placeholder="Pérez"
              />
              {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>
                Email de Contacto
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBase}`}
                placeholder="contacto@ejemplo.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>Teléfono</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBase}`}
                placeholder="+507 1234-5678"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>Posición</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBase}`}
                placeholder="Desarrollador"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>
                Departamento
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${selectBase}`}
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
              <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${selectBase}`}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            {isEditMode && formData.userCode && (
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${cardSubtitle}`}>
                  Código de Usuario
                </label>
                <input
                  type="text"
                  name="userCode"
                  value={formData.userCode}
                  disabled
                  className={`w-full border rounded-lg px-4 py-2 cursor-not-allowed transition-colors ${disabledInput}`}
                />
                <p className={`text-xs mt-1 ${cardSubtitle}`}>
                  El código de usuario se asigna automáticamente y no puede ser modificado
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Compañías Asignadas ── */}
      <div className={`rounded-xl p-5 sm:p-6 border transition-colors duration-200 ${card}`}>
        <div className="mb-4">
          <h2 className={`text-base sm:text-lg font-semibold ${cardTitle}`}>Compañías Asignadas <span className="text-red-400">*</span></h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${cardSubtitle}`}>
            Seleccione una o más compañías a las que pertenecerá este usuario
          </p>
        </div>
        <Select
          isMulti
          options={companyOptions}
          value={selectedCompanies}
          onChange={(selected) => {
            setSelectedCompanies(selected as CompanyOption[]);
            if (errors.companies) setErrors((prev) => ({ ...prev, companies: "" }));
          }}
          styles={customStyles}
          placeholder="Seleccionar compañías..."
          noOptionsMessage={() => "No hay compañías disponibles"}
        />
        {errors.companies && (
          <p className="text-red-400 text-sm mt-2">{errors.companies}</p>
        )}
        {selectedCompanies.length > 0 && (
          <p className={`text-sm mt-3 ${cardSubtitle}`}>
            {selectedCompanies.length} compañía(s) seleccionada(s)
          </p>
        )}
      </div>

      {/* ── Botones ── */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate(`/${selectedCompany?.code}/users/all`)}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${cancelBtn}`}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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