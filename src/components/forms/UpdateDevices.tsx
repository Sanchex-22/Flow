"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Company } from "../../context/routerContext"
import { useTheme } from "../../context/themeContext"
import { useNavigate } from "react-router-dom"
import CameraScannerModal from "../modals/Camerascannermodal"

interface Departments {
    id: string
    name: string
}

interface Person {
    id: string
    fullName: string | null
    firstName: string | null
    lastName: string | null
    position: string | null
    contactEmail: string | null
}

const { VITE_API_URL } = import.meta.env

export interface CreateEquipmentData {
    type: string;
    brand: string;
    model: string;
    serialNumber: string;
    // ❌ plateNumber removido - se genera automáticamente en backend
    location?: string;
    status?: string;
    acquisitionDate?: string;
    warrantyDetails?: string;
    qrCode?: string;
    invoiceUrl?: string;
    cost?: number;
    companyId: string;
    assignedToPersonId?: string;
    endUser?: string;
    operatingSystem?: string;
}

interface Equipment {
    id: string;
    type: string;
    brand: string;
    model: string;
    serialNumber: string;
    plateNumber?: string; // ✅ Lo mostramos pero no lo editamos
    location?: string;
    status: string;
    acquisitionDate?: string;
    warrantyDetails?: string;
    qrCode?: string;
    invoiceUrl?: string;
    cost?: number;
    companyId: string;
    assignedToPersonId?: string;
    endUser?: string;
    operatingSystem?: string;
}

interface Props {
    persons?: Person[] | null;
    departments?: Departments[] | null;
    selectedCompany?: Company | null;
    deviceID?: string | null;
    equipment?: Equipment;
}

type NotificationType = "success" | "error";

interface Notification {
    type: NotificationType;
    message: string;
    show: boolean;
}

interface FormErrors {
    type?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    location?: string;
    status?: string;
    acquisitionDate?: string;
    warrantyDetails?: string;
    qrCode?: string;
    invoiceUrl?: string;
    cost?: string;
    companyId?: string;
    assignedToPersonId?: string;
    endUser?: string;
    operatingSystem?: string;
}

const UpdateDevices: React.FC<Props> = ({ persons, departments, selectedCompany, deviceID }) => {
    const isEditMode = !!deviceID;
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    // --- Estados del scanner ---
    const [showScanner, setShowScanner] = useState(false);
    const [generatedPlateNumber, setGeneratedPlateNumber] = useState<string | null>(null);

    // --- Clases dinámicas reutilizables ---
    const pageBg = isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
    const cardBg = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const labelClass = isDarkMode ? "text-gray-300" : "text-gray-700";
    const inputClass = isDarkMode
        ? "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        : "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const inputErrorClass = isDarkMode
        ? "w-full px-4 py-2 bg-gray-700 border border-red-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        : "w-full px-4 py-2 bg-gray-50 border border-red-500 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500";
    const selectClass = isDarkMode
        ? "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
        : "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 appearance-none cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10";
    const selectErrorClass = isDarkMode
        ? "w-full px-4 py-2 bg-gray-700 border border-red-500 rounded-lg text-white appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
        : "w-full px-4 py-2 bg-gray-50 border border-red-500 rounded-lg text-gray-900 appearance-none cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 pr-10";
    const readOnlyClass = isDarkMode
        ? "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed opacity-60"
        : "w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed opacity-60";
    const subTextClass = isDarkMode ? "text-gray-400" : "text-gray-500";
    const cancelBtnClass = isDarkMode
        ? "px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        : "px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors";

    const [formData, setFormData] = useState<CreateEquipmentData>({
        type: "",
        brand: "",
        model: "",
        serialNumber: "",
        // ❌ plateNumber removido
        location: "",
        status: "ACTIVE",
        acquisitionDate: "",
        warrantyDetails: "",
        qrCode: "",
        invoiceUrl: "",
        cost: undefined,
        companyId: selectedCompany?.id || "",
        assignedToPersonId: "",
        endUser: "",
        operatingSystem: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [uploadingInvoice, setUploadingInvoice] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [notification, setNotification] = useState<Notification>({ type: "success", message: "", show: false });
    const [invoicePreview, setInvoicePreview] = useState<string | null>(null);

    const equipmentTypes = [
        { value: "Laptop", label: "Laptop" },
        { value: "Desktop", label: "Computadora de Escritorio" },
        { value: "Servidor", label: "Servidor" },
        { value: "Monitor", label: "Monitor" },
        { value: "Impresora", label: "Impresora" },
        { value: "Router", label: "Router" },
        { value: "Switch", label: "Switch" },
        { value: "Tablet", label: "Tablet" },
        { value: "Smartphone", label: "Smartphone" },
        { value: "Otro", label: "Otro" },
    ];

    const equipmentStatus = [
        { value: "ACTIVE", label: "Activo" },
        { value: "IN_MAINTENANCE", label: "En Reparación o Mantenimiento" },
        { value: "STORAGE", label: "En Almacén" },
        { value: "DISPOSED", label: "Desechado" },
        { value: "ASSIGNED", label: "Asignado" },
        { value: "DAMAGED", label: "Dañado" },
    ];

    useEffect(() => {
        if (isEditMode && deviceID) {
            const fetchEquipment = async () => {
                try {
                    const response = await fetch(`${VITE_API_URL}/api/devices/${deviceID}`);
                    if (!response.ok) throw new Error("Error al cargar el equipo");
                    const data = await response.json();
                    
                    console.log("📌 Equipo cargado:", data);
                    console.log("🔍 Plate Number:", data.plateNumber);
                    console.log("📍 Location:", data.location);
                    
                    setFormData({
                        type: data.type || "",
                        brand: data.brand || "",
                        model: data.model || "",
                        serialNumber: data.serialNumber || "",
                        location: data.location || "", // ✅ Location puede ser ID o string
                        status: data.status || "ACTIVE",
                        acquisitionDate: data.acquisitionDate ? data.acquisitionDate.split('T')[0] : "",
                        warrantyDetails: data.warrantyDetails || "",
                        qrCode: data.qrCode || "",
                        invoiceUrl: data.invoiceUrl || "",
                        cost: data.cost ?? undefined,
                        companyId: data.companyId || selectedCompany?.id || "",
                        assignedToPersonId: data.assignedToPersonId || "",
                        endUser: data.endUser || "",
                        operatingSystem: data.operatingSystem || "",
                    });
                    
                    // ✅ Guardar el plateNumber generado para mostrarlo read-only
                    if (data.plateNumber) {
                        console.log("✅ Plate Number capturado:", data.plateNumber);
                        setGeneratedPlateNumber(data.plateNumber);
                    } else {
                        console.warn("⚠️ No se encontró plateNumber en la respuesta");
                    }
                    
                    if (data.invoiceUrl) setInvoicePreview(data.invoiceUrl);
                } catch (error: any) {
                    console.error("❌ Error al cargar el equipo:", error);
                    showNotification("error", "Error al cargar los datos del equipo");
                }
            };
            fetchEquipment();
        }
    }, [deviceID, isEditMode, selectedCompany?.id]);

    const showNotification = (type: NotificationType, message: string) => {
        setNotification({ type, message, show: true });
    };

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    const handleInputChange = (field: keyof CreateEquipmentData, value: string) => {
        if (field === "cost") {
            const numericValue = parseFloat(value);
            setFormData((prev) => ({ ...prev, cost: !isNaN(numericValue) ? numericValue : undefined }));
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleInvoiceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!isEditMode) {
            showNotification("error", "Debes crear primero el equipo antes de subir la factura");
            return;
        }
        try {
            setUploadingInvoice(true);
            const formDataUpload = new FormData();
            formDataUpload.append("invoice", file);
            const response = await fetch(`${VITE_API_URL}/api/devices/${deviceID}/upload-invoice`, {
                method: "POST",
                body: formDataUpload,
            });
            if (!response.ok) throw new Error("Error al subir la factura");
            const data = await response.json();
            setFormData((prev) => ({ ...prev, invoiceUrl: data.invoiceUrl }));
            setInvoicePreview(data.invoiceUrl);
            showNotification("success", "Factura subida exitosamente");
        } catch (err: any) {
            showNotification("error", err.message || "Error al subir la factura");
        } finally {
            setUploadingInvoice(false);
        }
    };

    // ✅ Handler para recibir serial escaneado
    const handleScanSuccess = (scannedSerial: string) => {
        setFormData((prev) => ({ ...prev, serialNumber: scannedSerial }));
        if (errors.serialNumber) {
            setErrors((prev) => ({ ...prev, serialNumber: undefined }));
        }
        showNotification("success", `Serial escaneado: ${scannedSerial}`);
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.type.trim()) newErrors.type = "El tipo de equipo es requerido";
        if (!formData.brand.trim()) newErrors.brand = "La marca es requerida";
        if (!formData.model.trim()) newErrors.model = "El modelo es requerido";
        if (!formData.serialNumber.trim()) newErrors.serialNumber = "El número de serie es requerido";
        if (!formData.companyId) newErrors.companyId = "La empresa es requerida";
        if (formData.cost !== undefined && (isNaN(formData.cost) || formData.cost < 0)) {
            newErrors.cost = "El costo debe ser un número positivo válido";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        const endpoint = isEditMode
            ? `${VITE_API_URL}/api/devices/${deviceID}`
            : `${VITE_API_URL}/api/devices/create`;
        const method = isEditMode ? "PUT" : "POST";
        try {
            const apiPayload = {
                type: formData.type,
                brand: formData.brand,
                model: formData.model,
                serialNumber: formData.serialNumber,
                companyId: formData.companyId,
                // ❌ plateNumber NO se envía - se genera automáticamente en backend
                ...(formData.assignedToPersonId && { assignedToPersonId: formData.assignedToPersonId }),
                ...(formData.location?.trim() && { location: formData.location }),
                ...(formData.status?.trim() && { status: formData.status }),
                ...(formData.acquisitionDate?.trim() && { acquisitionDate: formData.acquisitionDate }),
                ...(formData.warrantyDetails?.trim() && { warrantyDetails: formData.warrantyDetails }),
                ...(formData.qrCode?.trim() && { qrCode: formData.qrCode }),
                ...(formData.invoiceUrl?.trim() && { invoiceUrl: formData.invoiceUrl }),
                ...(formData.endUser?.trim() && { endUser: formData.endUser }),
                ...(formData.operatingSystem?.trim() && { operatingSystem: formData.operatingSystem }),
                ...(formData.cost !== undefined && { cost: formData.cost }),
            };
            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiPayload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error al ${isEditMode ? 'actualizar' : 'crear'} el equipo`);
            }
            const responseData = await response.json();
            
            // ✅ Si es creación, guardar el plateNumber generado
            if (!isEditMode && responseData.plateNumber) {
                setGeneratedPlateNumber(responseData.plateNumber);
            }

            showNotification("success", `Equipo ${isEditMode ? 'actualizado' : 'creado'} exitosamente.`);
            if (!isEditMode) {
                setFormData({
                    type: "", brand: "", model: "", serialNumber: "",
                    location: "", status: "ACTIVE", acquisitionDate: "", warrantyDetails: "",
                    qrCode: "", invoiceUrl: "", cost: undefined, companyId: selectedCompany?.id || "",
                    assignedToPersonId: "", endUser: "", operatingSystem: "",
                });
                setInvoicePreview(null);
                setGeneratedPlateNumber(null);
                
                // ✅ Redirigir a la página anterior después de 1.5 segundos
                setTimeout(() => {
                    navigate(-1);
                }, 1500);
            } else {
                // Si es edición, redirigir después de 2 segundos
                setTimeout(() => {
                    navigate(`/${selectedCompany?.code}/devices/all`);
                }, 2000);
            }
        } catch (error: any) {
            showNotification("error", error.message || `Error inesperado al ${isEditMode ? 'actualizar' : 'crear'} el equipo`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`transition-colors ${pageBg}`}>
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Sección Básica */}
                <div className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">{isEditMode ? 'Actualizar Equipo' : 'Información del Nuevo Equipo'}</h2>
                        <p className={`text-sm ${subTextClass}`}>
                            {isEditMode ? `Editando el dispositivo ID: ${deviceID}` : 'Datos básicos del equipo tecnológico'}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                                Tipo de Equipo <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleInputChange("type", e.target.value)}
                                className={errors.type ? selectErrorClass : selectClass}
                            >
                                <option value="">Seleccionar tipo...</option>
                                {equipmentTypes.map((type) => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                                Marca <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => handleInputChange("brand", e.target.value)}
                                className={errors.brand ? inputErrorClass : inputClass}
                                placeholder="Dell, HP, Lenovo, etc."
                            />
                            {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                                Modelo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => handleInputChange("model", e.target.value)}
                                className={errors.model ? inputErrorClass : inputClass}
                                placeholder="Latitude 5520, ThinkPad X1, etc."
                            />
                            {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                                Empresa <span className="text-red-500">*</span>
                            </label>
                            <input
                                disabled
                                type="text"
                                className={`${inputClass} opacity-60 cursor-not-allowed`}
                                value={selectedCompany?.name || ""}
                                placeholder="Seleccionar empresa"
                            />
                            {errors.companyId && <p className="text-red-500 text-xs mt-1">{errors.companyId}</p>}
                        </div>
                    </div>
                </div>

                {/* Identificación y QR */}
                <div className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
                    <h2 className="text-xl font-bold mb-6">Identificación y QR</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                                Número de Serie <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.serialNumber}
                                    onChange={(e) => handleInputChange("serialNumber", e.target.value.toUpperCase())}
                                    className={errors.serialNumber ? inputErrorClass : inputClass}
                                    placeholder="ABC123456789"
                                />
                                {/* ✅ Botón de escáner */}
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className={`px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${
                                        isDarkMode
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                    }`}
                                    title="Escanear código de barras"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </button>
                            </div>
                            {errors.serialNumber && <p className="text-red-500 text-xs mt-1">{errors.serialNumber}</p>}
                            <p className={`text-xs mt-1 ${subTextClass}`}>
                                📷 Usa el botón de cámara para escanear el código de barras
                            </p>
                        </div>
                        
                        {/* ✅ NÚMERO DE PLACA - AHORA READ-ONLY */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Número de Placa</label>
                            <input
                                type="text"
                                value={generatedPlateNumber || ""}
                                disabled
                                className={readOnlyClass}
                                placeholder="Se genera automáticamente"
                            />
                            <p className={`text-xs mt-1 ${subTextClass}`}>
                                ✅ Se genera automáticamente al crear el equipo
                            </p>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Código QR</label>
                            <input
                                type="text"
                                value={formData.qrCode}
                                onChange={(e) => handleInputChange("qrCode", e.target.value)}
                                className={inputClass}
                                placeholder="Código QR (opcional)"
                            />
                        </div>
                    </div>
                </div>

                {/* Factura */}
                <div className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
                    <h2 className="text-xl font-bold mb-6">Factura</h2>
                    {!isEditMode ? (
                        <div className={`border rounded-lg p-4 text-sm ${isDarkMode ? "bg-yellow-900/30 border-yellow-700 text-yellow-200" : "bg-yellow-50 border-yellow-300 text-yellow-800"}`}>
                            ⚠️ Debes crear primero el equipo para poder subir la factura
                        </div>
                    ) : (
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                                Subir Factura (PDF, Imagen, Documento)
                            </label>
                            <div className="flex items-center gap-4">
                                {invoicePreview && (
                                    <a href={invoicePreview} target="_blank" rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-400 text-sm underline">
                                        📄 Ver Factura
                                    </a>
                                )}
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                    onChange={handleInvoiceChange}
                                    disabled={uploadingInvoice}
                                    className={`flex-1 ${inputClass} disabled:opacity-50`}
                                />
                                {uploadingInvoice && <span className="text-yellow-500 text-sm">Subiendo...</span>}
                            </div>
                            <p className={`text-xs mt-2 ${subTextClass}`}>Máximo 50MB. Formatos: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX</p>
                        </div>
                    )}
                </div>

                {/* Información Adicional */}
                <div className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
                    <h2 className="text-xl font-bold mb-6">Información Adicional</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Costo</label>
                            <div className="relative">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextClass}`}>$</span>
                                <input
                                    type="number"
                                    value={formData.cost !== undefined ? formData.cost : ""}
                                    onChange={(e) => handleInputChange("cost", e.target.value)}
                                    className={`pl-7 pr-4 py-2 ${errors.cost ? inputErrorClass : inputClass}`}
                                    placeholder="0.00 (opcional)"
                                    step="0.01"
                                />
                            </div>
                            {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost}</p>}
                        </div>

                        {/* ✅ UBICACIÓN - AHORA SELECTOR DE DEPARTAMENTOS */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
                                Ubicación (Departamento)
                            </label>
                            <select
                                value={formData.location}
                                onChange={(e) => handleInputChange("location", e.target.value)}
                                className={errors.location ? selectErrorClass : selectClass}
                            >
                                <option value="">Sin ubicación asignada</option>
                                {Array.isArray(departments) && departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            <p className={`text-xs mt-1 ${subTextClass}`}>
                                Selecciona el departamento donde se ubicará el equipo
                            </p>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Estado del Equipo</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange("status", e.target.value)}
                                className={selectClass}
                            >
                                {equipmentStatus.map((status) => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Fecha de Adquisición</label>
                            <input
                                type="date"
                                value={formData.acquisitionDate}
                                onChange={(e) => handleInputChange("acquisitionDate", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Detalles de la Garantía</label>
                            <input
                                type="text"
                                value={formData.warrantyDetails}
                                onChange={(e) => handleInputChange("warrantyDetails", e.target.value)}
                                className={inputClass}
                                placeholder="Ej: Vence el 31/12/2025"
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Sistema Operativo</label>
                            <input
                                type="text"
                                value={formData.operatingSystem}
                                onChange={(e) => handleInputChange("operatingSystem", e.target.value)}
                                className={inputClass}
                                placeholder="Ej: Windows 11, macOS Ventura"
                            />
                        </div>
                    </div>
                </div>

                {/* Asignación */}
                <div className={`rounded-lg p-6 border transition-colors ${cardBg}`}>
                    <h2 className="text-xl font-bold mb-6">Asignación</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Persona Asignada</label>
                            <select
                                value={formData.assignedToPersonId}
                                onChange={(e) => handleInputChange("assignedToPersonId", e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Sin asignar (opcional)</option>
                                {Array.isArray(persons) && persons.map((person) => (
                                    <option key={person.id} value={person.id}>
                                        {person.fullName || `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim()}
                                        {person.position ? ` — ${person.position}` : ""}
                                    </option>
                                ))}
                            </select>
                            <p className={`text-xs mt-1 ${subTextClass}`}>
                                Puedes dejar este campo vacío si el equipo no está asignado a ninguna persona
                            </p>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Usuario Final</label>
                            <input
                                type="text"
                                value={formData.endUser}
                                onChange={(e) => handleInputChange("endUser", e.target.value)}
                                className={inputClass}
                                placeholder="Nombre del usuario final (opcional)"
                            />
                            <p className={`text-xs mt-1 ${subTextClass}`}>
                                Nombre del usuario que utiliza el equipo actualmente
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        className={cancelBtnClass}
                        onClick={() => navigate(`/${selectedCompany?.code}/devices/all`)}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || uploadingInvoice}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>{isEditMode ? 'Actualizando...' : 'Creando...'}</span>
                            </>
                        ) : (
                            <span>{isEditMode ? 'Actualizar Equipo' : 'Crear Equipo'}</span>
                        )}
                    </button>
                </div>
            </form>

            {/* ✅ Modal del scanner */}
            <CameraScannerModal
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onScanSuccess={handleScanSuccess}
                deviceBrand={formData.brand}
            />

            {/* Notificación */}
            {notification.show && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 transition-all duration-300 ease-in-out">
                    <div className={`rounded-lg p-4 shadow-lg border ${
                        notification.type === "success"
                            ? isDarkMode ? "bg-green-800 border-green-600 text-green-100" : "bg-green-50 border-green-300 text-green-800"
                            : isDarkMode ? "bg-red-800 border-red-600 text-red-100" : "bg-red-50 border-red-300 text-red-800"
                    }`}>
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {notification.type === "success" ? (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                )}
                            </div>
                            <p className="flex-1 text-sm font-medium">{notification.message}</p>
                            <button
                                onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
                                className="flex-shrink-0 hover:opacity-75 transition-opacity"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateDevices;