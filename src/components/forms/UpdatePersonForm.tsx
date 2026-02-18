"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"
import { useTheme } from "../../context/themeContext"
import { useCompany } from "../../context/routerContext"

const { VITE_API_URL } = import.meta.env;

// --- Interfaces ---
interface Department {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface PersonData {
  id: string;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  contactEmail: string | null;
  phoneNumber: string | null;
  departmentId: string | null;
  position: string | null;
  status: string;
  userCode: string;
  companyId: string;
  user: User | null;
  department: {
    id: string;
    name: string;
  } | null;
}

interface PersonFormData {
  userId: string;
  firstName: string;
  lastName: string;
  contactEmail: string;
  phoneNumber: string;
  departmentId: string;
  position: string;
  status: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface Props {
  userID?: string | null;
  personId?: string | null;
  departments: Department[];
  selectedCompany?: any;
}

// --- Fetcher para SWR ---
const fetcher = async (url: string) => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(url, { method: "GET", headers, credentials: "include" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export default function UpdatePersonForm({ userID, personId, departments, selectedCompany: propSelectedCompany }: Props) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { selectedCompany: contextCompany } = useCompany();
  
  const selectedCompany = propSelectedCompany || contextCompany;
  const currentPersonId = userID || personId;
  const isEditMode = Boolean(currentPersonId);

  // --- SWR Hooks ---
  const { data: personData, error: personError } = useSWR<PersonData>(
    currentPersonId ? `${VITE_API_URL}/api/persons/${currentPersonId}` : null,
    fetcher
  );

  const { data: users } = useSWR<User[]>(
    selectedCompany?.id ? `${VITE_API_URL}/api/users/full/${selectedCompany.id}` : null,
    fetcher
  );

  // --- State ---
  const [formData, setFormData] = useState<PersonFormData>({
    userId: "",
    firstName: "",
    lastName: "",
    contactEmail: "",
    phoneNumber: "",
    departmentId: "",
    position: "",
    status: "Activo",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Llenar formulario en modo edición
  useEffect(() => {
    if (personData && isEditMode) {
      setFormData({
        userId: personData.userId || "",
        firstName: personData.firstName || "",
        lastName: personData.lastName || "",
        contactEmail: personData.contactEmail || "",
        phoneNumber: personData.phoneNumber || "",
        departmentId: personData.departmentId || "",
        position: personData.position || "",
        status: personData.status || "Activo",
      });
    }
  }, [personData, isEditMode]);

  // --- Handlers ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "El nombre es requerido";
    if (!formData.lastName.trim()) newErrors.lastName = "El apellido es requerido";
    if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Email inválido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedCompany?.id) {
      setSubmitError("No se ha detectado una compañía activa.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      const payload = {
        userId: formData.userId || null,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        contactEmail: formData.contactEmail.trim() || null,
        phoneNumber: formData.phoneNumber.trim() || null,
        departmentId: formData.departmentId || null,
        companyId: selectedCompany.id, // Requerido por el controlador
        position: formData.position.trim() || null,
        status: formData.status,
      };

      const endpoint = isEditMode
        ? `${VITE_API_URL}/api/persons/edit/${currentPersonId}`
        : `${VITE_API_URL}/api/persons/create`;

      // Tu controlador usa PUT para editar y POST para crear
      const response = await fetch(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al guardar");

      navigate(`/${selectedCompany?.code}/persons/all`);
    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Estilos Dinámicos ---
  const bgClasses = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textClasses = isDarkMode ? "text-white" : "text-gray-900";
  const labelClasses = isDarkMode ? "text-gray-300" : "text-gray-700";
  const inputClasses = isDarkMode 
    ? "w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" 
    : "w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500";
  
  const primaryButton = "px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50";
  const secondaryButton = isDarkMode 
    ? "px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-all" 
    : "px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all";

  if (personError) return <div className="p-4 text-red-500">Error al cargar datos del perfil.</div>;

  return (
    <form onSubmit={handleSubmit} className={`max-w-4xl mx-auto space-y-6 rounded-xl p-8 border shadow-sm ${bgClasses}`}>
      
      {/* Header */}
      <div className="border-b border-gray-700 pb-4 mb-6">
        <h2 className={`text-2xl font-bold ${textClasses}`}>
          {isEditMode ? "Actualizar Perfil" : "Crear Nueva Persona"}
        </h2>
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Compañía: <span className="text-blue-500 font-semibold">{selectedCompany?.name}</span>
        </p>
      </div>

      {/* Error Global */}
      {submitError && (
        <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Usuario Vinculado */}
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>
            Vincular Usuario (Opcional)
          </label>
          <select
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">-- Sin usuario asignado --</option>
            {users?.map(u => (
              <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 italic">
            * Si el usuario no pertenece a la compañía, se vinculará automáticamente.
          </p>
        </div>

        {/* Nombre */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>Nombre *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`${inputClasses} ${errors.firstName ? "border-red-500" : ""}`}
            placeholder="Ej. Juan"
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>

        {/* Apellido */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>Apellido *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`${inputClasses} ${errors.lastName ? "border-red-500" : ""}`}
            placeholder="Ej. Pérez"
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>Email de Contacto</label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className={inputClasses}
            placeholder="juan.perez@ejemplo.com"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>Teléfono</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={inputClasses}
            placeholder="+507 6000-0000"
          />
        </div>

        {/* Departamento */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>Departamento</label>
          <select
            name="departmentId"
            value={formData.departmentId}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Seleccione un departamento</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Posición */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>Cargo / Posición</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Ej. Gerente de Ventas"
          />
        </div>

        {/* Estado */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>Estado</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        {/* User Code (Solo lectura en edición) */}
        {isEditMode && (
          <div>
            <label className={`block text-sm font-medium ${labelClasses} mb-2`}>Código de Sistema</label>
            <input
              type="text"
              value={personData?.userCode || ""}
              disabled
              className={`${inputClasses} opacity-60 cursor-not-allowed`}
            />
          </div>
        )}
      </div>

      {/* Footer / Acciones */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={secondaryButton}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={primaryButton}
        >
          {isSubmitting ? "Procesando..." : isEditMode ? "Actualizar Persona" : "Registrar Persona"}
        </button>
      </div>
    </form>
  );
}