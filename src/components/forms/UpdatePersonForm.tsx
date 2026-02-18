"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"
import { useTheme } from "../../context/themeContext"
import { useCompany } from "../../context/routerContext"

const { VITE_API_URL } = import.meta.env;

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

export default function UpdatePersonForm({ userID, personId, departments, selectedCompany: propSelectedCompany }: Props) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { selectedCompany: contextCompany } = useCompany();
  
  const selectedCompany = propSelectedCompany || contextCompany;
  const currentPersonId = userID || personId;
  const isEditMode = Boolean(currentPersonId);

  const { data: personData, error: personError } = useSWR<PersonData>(
    currentPersonId ? `${VITE_API_URL}/api/persons/${currentPersonId}` : null,
    fetcher
  );

  const { data: users } = useSWR<User[]>(
    `${VITE_API_URL}/api/users/full/${selectedCompany?.id}`,
    fetcher
  );

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    }
    if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Email inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      const payload = {
        userId: formData.userId || null,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactEmail: formData.contactEmail || null,
        phoneNumber: formData.phoneNumber || null,
        departmentId: formData.departmentId || null,
        position: formData.position || null,
        status: formData.status,
      };

      const endpoint = isEditMode
        ? `${VITE_API_URL}/api/persons/edit/${currentPersonId}`
        : `${VITE_API_URL}/api/persons/create`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
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
        throw new Error(data.error || "Error al guardar la persona");
      }

      setSubmitError("");
      setTimeout(() => {
        navigate(`/${selectedCompany?.code}/persons/all`);
      }, 1000);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSubmitError(error.message || "Error al guardar la persona");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CLASES DINÁMICAS (LIGHT/DARK MODE) ---
  const bgClasses = isDarkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";

  const textClasses = isDarkMode
    ? "text-white"
    : "text-gray-900";

  const labelClasses = isDarkMode
    ? "text-gray-300"
    : "text-gray-700";

  const inputClasses = isDarkMode
    ? "w-full bg-gray-700 border border-gray-600 text-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    : "w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const inputDisabledClasses = isDarkMode
    ? "w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
    : "w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-gray-600 cursor-not-allowed";

  const errorTextClasses = isDarkMode
    ? "text-red-400 text-sm mt-1"
    : "text-red-500 text-sm mt-1";

  const buttonClasses = "px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

  const primaryButtonClasses = isDarkMode
    ? `${buttonClasses} bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800`
    : `${buttonClasses} bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300`;

  const secondaryButtonClasses = isDarkMode
    ? `${buttonClasses} bg-gray-600 hover:bg-gray-700`
    : `${buttonClasses} bg-gray-400 hover:bg-gray-500`;

  const errorBgClasses = isDarkMode
    ? "bg-red-600/80"
    : "bg-red-500/80";

  if (personError) {
    return (
      <div className={`border rounded-lg p-6 ${isDarkMode ? "bg-red-900/30 border-red-600 text-red-300" : "bg-red-50 border-red-200 text-red-600"}`}>
        <p>Error al cargar los datos de la persona</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 rounded-lg p-8 border ${bgClasses}`}>
      {/* --- Error Message --- */}
      {submitError && (
        <div className={`p-4 rounded-lg text-white font-medium text-sm ${errorBgClasses}`}>
          {submitError}
        </div>
      )}

      {/* --- Header --- */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${textClasses}`}>
          {isEditMode ? "Editar Persona" : "Registrar Nueva Persona"}
        </h2>
        <p className={isDarkMode ? "text-gray-400 text-sm" : "text-gray-600 text-sm"}>
          {isEditMode ? `Editando persona ID: ${currentPersonId}` : "Complete los datos de la persona"}
        </p>
      </div>

      {/* --- Form Fields --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usuario (Opcional) */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>
            Usuario {isEditMode ? "(Opcional)" : "(Opcional)"}
          </label>
          <select
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className={`${inputClasses} ${errors.userId ? "border-red-500" : ""}`}
          >
            <option value="">Seleccionar usuario (opcional)</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
          <p className={isDarkMode ? "text-xs text-gray-400 mt-1" : "text-xs text-gray-500 mt-1"}>
            Puede asignar o cambiar el usuario en cualquier momento
          </p>
          {errors.userId && <p className={errorTextClasses}>{errors.userId}</p>}
        </div>

        {/* Nombre */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>
            Nombre *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`${inputClasses} ${errors.firstName ? "border-red-500" : ""}`}
            placeholder="Juan"
          />
          {errors.firstName && <p className={errorTextClasses}>{errors.firstName}</p>}
        </div>

        {/* Apellido */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>
            Apellido *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`${inputClasses} ${errors.lastName ? "border-red-500" : ""}`}
            placeholder="Pérez"
          />
          {errors.lastName && <p className={errorTextClasses}>{errors.lastName}</p>}
        </div>

        {/* Email Contacto */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>
            Email de Contacto
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className={`${inputClasses} ${errors.contactEmail ? "border-red-500" : ""}`}
            placeholder="contacto@ejemplo.com"
          />
          {errors.contactEmail && <p className={errorTextClasses}>{errors.contactEmail}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>
            Teléfono
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={inputClasses}
            placeholder="+507 1234-5678"
          />
        </div>

        {/* Departamento */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>
            Departamento
          </label>
          <select
            name="departmentId"
            value={formData.departmentId}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Seleccionar departamento</option>
            {departments?.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Posición */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>
            Posición
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Desarrollador"
          />
        </div>

        {/* Estado */}
        <div>
          <label className={`block text-sm font-medium ${labelClasses} mb-2`}>
            Estado
          </label>
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

        {/* User Code (readonly en Edit) */}
        {isEditMode && personData?.userCode && (
          <div>
            <label className={`block text-sm font-medium ${labelClasses} mb-2`}>
              Código de Persona
            </label>
            <input
              type="text"
              disabled
              value={personData.userCode}
              className={inputDisabledClasses}
            />
            <p className={isDarkMode ? "text-xs text-gray-400 mt-1" : "text-xs text-gray-500 mt-1"}>
              Código asignado automáticamente
            </p>
          </div>
        )}
      </div>

      {/* --- Buttons --- */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => navigate(`/${selectedCompany?.code}/persons/all`)}
          className={secondaryButtonClasses}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={primaryButtonClasses}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Guardando..."
            : isEditMode
            ? "Actualizar Persona"
            : "Crear Persona"}
        </button>
      </div>
    </form>
  );
}