"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Company } from "../../context/routerContext"
import { UsuarioFull } from "../../utils/usuarioFull"

interface Departments {
  id: string
  name: string
}

const { VITE_API_URL } = import.meta.env

interface CreateUserData {
  username: string
  email: string
  password?: string
  role: string
  companyId: string
  firstName: string
  lastName: string
  contactEmail: string
  phoneNumber: string
  department: string
  position: string
  userCode?: string
}

interface Props {
  departments?: Departments[] | null
  selectedCompany?: Company | null
  userID?: string | null
}

type NotificationType = "success" | "error"

interface Notification {
  type: NotificationType
  message: string
  show: boolean
}

const UpdateUser: React.FC<Props> = ({ departments, selectedCompany, userID }) => {
  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    email: "",
    password: "",
    role: "USER",
    companyId: selectedCompany?.id || "",
    firstName: "",
    lastName: "",
    contactEmail: "",
    phoneNumber: "",
    department: "",
    position: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<CreateUserData>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [originalData, setOriginalData] = useState<CreateUserData | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  const [notification, setNotification] = useState<Notification>({
    type: "success",
    message: "",
    show: false,
  })

  const roles = [
    { value: "USER", label: "Usuario" },
    { value: "ADMIN", label: "Administrador" },
    { value: "SUPER_ADMIN", label: "Super Administrador" },
  ]

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({
      type,
      message,
      show: true,
    })
  }

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  // Fetch user data if userID is provided (edit mode)
  useEffect(() => {
    const fetchUserData = async () => {
      if (userID) {
        setIsLoading(true)
        setDataLoaded(false)
        try {
          const response = await fetch(`${VITE_API_URL}/api/users/profile/${userID}`)
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Error al cargar los datos del usuario.")
          }
          const userData: UsuarioFull = await response.json()
          console.log("Fetched user data:", userData)

          const newFormData: CreateUserData = {
            username: userData.username,
            email: userData.email,
            password: "",
            role: userData.role,
            userCode: userData?.person?.userCode || "",
            companyId: userData.companyId || "",
            firstName: userData.person.firstName,
            lastName: userData.person.lastName,
            contactEmail: userData.person.contactEmail || "",
            phoneNumber: userData.person.phoneNumber || "",
            department: userData.person.departmentId || "",
            position: userData.person.position,
          }

          setFormData(newFormData)
          setOriginalData({ ...newFormData })
          setDataLoaded(true)
        } catch (error: any) {
          console.error("Error fetching user data:", error)
          showNotification("error", error.message || "Error al cargar los datos del usuario.")
        } finally {
          setIsLoading(false)
        }
      } else {
        // Reset form if no userID (create mode)
        const resetData: CreateUserData = {
          username: "",
          email: "",
          password: "",
          role: "USER",
          companyId: selectedCompany?.id || "",
          firstName: "",
          lastName: "",
          contactEmail: "",
          phoneNumber: "",
          department: "",
          position: "",
        }
        setFormData(resetData)
        setOriginalData(null)
        setDataLoaded(true)
      }
    }

    fetchUserData()
  }, [userID, selectedCompany?.id])

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserData> = {}

    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido"
    }
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!formData.email.includes("@")) {
      newErrors.email = "El email debe ser válido"
    }

    // Password is required only for creation, or if explicitly provided for update
    if (!userID && !formData.password?.trim()) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido"
    }
    if (!formData.department.trim()) {
      newErrors.department = "El departamento es requerido"
    }
    if (!formData.position.trim()) {
      newErrors.position = "La posición es requerida"
    }
    if (!formData.companyId) {
      newErrors.companyId = "La empresa es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    const isEditing = !!userID
    const method = isEditing ? "PUT" : "POST"
    const endpoint = isEditing
      ? `${VITE_API_URL}/api/users/edit/${userID}`
      : `${VITE_API_URL}/api/users/create`

    try {
      const apiPayload: any = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        isActive: true,
        companyId: formData.companyId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactEmail: formData.contactEmail,
        phoneNumber: formData.phoneNumber,
        position: formData.position,
        status: "Activo",
        departmentId: formData.department,
        userCode: formData.userCode || "",
      }

      // Solo incluir password si es nuevo usuario o se proporciona para actualización
      if (!isEditing || (isEditing && formData.password?.trim())) {
        apiPayload.password = formData.password
      }

      console.log(
        `${isEditing ? "Actualizando" : "Creando"} usuario en la API:`,
        apiPayload
      )

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error ||
            `Error al ${isEditing ? "actualizar" : "crear"} el usuario`
        )
      }

      const responseData = await response.json()
      console.log("Response:", responseData)

      showNotification(
        "success",
        `Usuario ${responseData?.username} ${isEditing ? "actualizado" : "creado"} exitosamente`
      )

      // Si es edición, actualizar originalData
      if (isEditing) {
        setOriginalData({ ...formData })
      } else {
        // Si es creación, limpiar formulario
        setFormData({
          username: "",
          email: "",
          password: "",
          role: "USER",
          companyId: selectedCompany?.id || "",
          firstName: "",
          lastName: "",
          contactEmail: "",
          phoneNumber: "",
          department: "",
          position: "",
        })
      }
    } catch (error: any) {
      console.error(
        `Error al ${isEditing ? "actualizar" : "crear"} usuario:`,
        error
      )
      showNotification(
        "error",
        error.message ||
          `Error inesperado al ${isEditing ? "actualizar" : "crear"} el usuario`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (userID && originalData) {
      setFormData({ ...originalData })
      setErrors({})
    }
  }

  if (!dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin w-12 h-12 text-blue-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-400">Cargando datos...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative font-inter">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Account Information */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-blue-400"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Información de Cuenta</h2>
              <p className="text-gray-400 text-sm">Datos de acceso y configuración del usuario</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Nombre de Usuario *</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.username ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                }`}
                placeholder="juan.perez"
              />
              {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                }`}
                placeholder="juan.perez@example.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña {userID ? "(dejar en blanco para no cambiar)" : "*"}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 pr-10 ${
                    errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                  }`}
                  placeholder={userID ? "••••••••" : "Contraseña segura"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">Rol *</label>
              <div className="relative">
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4 text-gray-400"
                  >
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="companyId" className="block text-sm font-medium text-gray-300 mb-2">Empresa *</label>
              <input
                disabled={true}
                id="companyId"
                name="companyId"
                type="text"
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 pr-10 ${
                  errors.companyId ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                }`}
                placeholder={selectedCompany ? selectedCompany.name : "Seleccionar empresa"}
                value={selectedCompany?.name || ""}
              />
              {errors.companyId && <p className="text-red-400 text-sm mt-1">{errors.companyId}</p>}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-green-400"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Información Personal</h2>
              <p className="text-gray-400 text-sm">Datos personales y de contacto del usuario</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.firstName ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                }`}
                placeholder="Juan"
              />
              {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">Apellido *</label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.lastName ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                }`}
                placeholder="Pérez"
              />
              {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-2">Email de Contacto</label>
              <input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.contactEmail ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                }`}
                placeholder="juan.perez.contacto@example.com"
              />
              {errors.contactEmail && <p className="text-red-400 text-sm mt-1">{errors.contactEmail}</p>}
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.phoneNumber ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                }`}
                placeholder="+50761234567"
              />
              {errors.phoneNumber && <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-purple-400"
              >
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Información Profesional</h2>
              <p className="text-gray-400 text-sm">Datos laborales</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-2">Departamento *</label>
              <div className="relative">
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 pr-10 ${
                    errors.department ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                  }`}
                >
                  <option value="">Seleccionar departamento...</option>
                  {Array.isArray(departments) &&
                    departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4 text-gray-400"
                  >
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </div>
              </div>
              {errors.department && <p className="text-red-400 text-sm mt-1">{errors.department}</p>}
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-2">Posición *</label>
              <input
                id="position"
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.position ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
                }`}
                placeholder="Técnico de Soporte"
              />
              {errors.position && <p className="text-red-400 text-sm mt-1">{errors.position}</p>}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{userID ? "Actualizando Usuario..." : "Creando Usuario..."}</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>{userID ? "Actualizar Usuario" : "Crear Usuario"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 transition-all duration-300 ease-in-out ${
            notification.show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <div
            className={`rounded-lg p-4 shadow-lg border ${
              notification.type === "success"
                ? "bg-green-800 border-green-600 text-green-100"
                : "bg-red-800 border-red-600 text-red-100"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {notification.type === "success" ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
                className="flex-shrink-0 text-current hover:opacity-75 transition-opacity"
                aria-label="Cerrar notificación"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdateUser
