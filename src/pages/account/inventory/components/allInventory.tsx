"use client";

import { useState, useEffect, useRef } from "react";
import * as XLSX from 'xlsx';
import { useCompany } from "../../../../context/routerContext";
import { useTheme } from "../../../../context/themeContext";
import Loader from "../../../../components/loaders/loader";
import { usePageName } from "../../../../hook/usePageName";
import PagesHeader from "../../../../components/headers/pagesHeader";
import { useSearch } from "../../../../context/searchContext";
import Tabla from "../../../../components/tables/Table";
import { X } from "lucide-react";
import { CreateEquipmentData } from "../../devices/components/AllDevices";
import { useTranslation } from "react-i18next";


interface Department {
  id: string;
  name: string;
}

interface ImportResult {
  success: boolean;
  inserted: number;
  skipped: number;
  errors: number;
  totalRows: number;
  details: {
    insertedRecords: string[];
    skippedRecords: Array<{ row: number; serialNumber: string; reason: string }>;
    errorRecords: Array<{ row: number; serialNumber?: string; message: string }>;
  };
}

const { VITE_API_URL } = import.meta.env

export default function AllInventory() {
  const { search } = useSearch();
  const { selectedCompany } = useCompany();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  // --- Clases dinámicas reutilizables ---
  const pageBg = isDarkMode ? "bg-[#1c1c1e] text-white" : "bg-gray-100 text-gray-900";
  const cardBg = isDarkMode ? "bg-gray-800 border-white/[0.08]" : "bg-white border-gray-200";
  const cardBg750 = isDarkMode ? "bg-gray-750 border-white/[0.08]" : "bg-gray-50 border-gray-200";
  const innerBg = isDarkMode ? "bg-[#1c1c1e]" : "bg-gray-100";
  const labelClass = isDarkMode ? "text-gray-300" : "text-gray-700";
  const subTextClass = isDarkMode ? "text-gray-400" : "text-gray-500";
  const inputClass = isDarkMode
    ? "bg-gray-700 border border-gray-600 p-2 rounded text-white placeholder-gray-400"
    : "bg-gray-50 border border-gray-300 p-2 rounded text-gray-900 placeholder-gray-400";
  const selectClass = isDarkMode
    ? "bg-gray-700 border border-gray-600 p-2 rounded text-white"
    : "bg-gray-50 border border-gray-300 p-2 rounded text-gray-900";
  const cancelBtnClass = isDarkMode
    ? "px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium"
    : "px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-medium";
  const dividerClass = isDarkMode ? "border-white/[0.08]" : "border-gray-200";

  const [inventory, setInventory] = useState<CreateEquipmentData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [importing, setImporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportResultModal, setShowImportResultModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState<CreateEquipmentData | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("todos");
  const [selectedType, setSelectedType] = useState<string>("todos");
  const { pageName } = usePageName();
  const [newEquipment, setNewEquipment] = useState({
    brand: "", model: "", type: "",
    serialNumber: "", location: "", status: "Activo", cost: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Cargar departamentos
  const fetchDepartments = async () => {
    if (!selectedCompany?.code) return;
    try {
      const res = await fetch(`${VITE_API_URL}/api/companies/departments/by-code/${selectedCompany.code}`);
      if (!res.ok) throw new Error("Error al cargar departamentos");
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando departamentos:", error);
      setDepartments([]);
    }
  };

  // ✅ Función para obtener nombre de departamento por ID
  const getDepartmentName = (departmentId: string | null | undefined): string => {
    if (!departmentId) return "-";
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : departmentId;
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "En Uso": return isDarkMode ? "bg-blue-600 text-blue-100" : "bg-blue-100 text-blue-800";
      case "Mantenimiento": return isDarkMode ? "bg-yellow-600 text-yellow-100" : "bg-yellow-100 text-yellow-800";
      case "Activo": return isDarkMode ? "bg-green-600 text-green-100" : "bg-green-100 text-green-800";
      default: return isDarkMode ? "bg-gray-600 text-gray-100" : "bg-gray-200 text-gray-800";
    }
  };

  const fetchInventory = async () => {
    if (!selectedCompany?.id) { setLoading(false); return; }
    try {
      const res = await fetch(`${VITE_API_URL}/api/inventory/${selectedCompany.id}/inventory/all`);
      if (!res.ok) throw new Error("Error al cargar inventario");
      setInventory(await res.json());
    } catch (error) {
      console.error(error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchDepartments();
  }, [selectedCompany?.id, selectedCompany?.code]);

  const filteredInventory = Array.isArray(inventory)
    ? inventory.filter((item) => {
      if (search.trim() === "") return true;
      const term = search.toLowerCase();
      const matchesSearch = (
        item.brand.toLowerCase().includes(term) ||
        item.model.toLowerCase().includes(term) ||
        item.type.toLowerCase().includes(term) ||
        item.serialNumber.toLowerCase().includes(term) ||
        item.plateNumber?.toLowerCase().includes(term) ||
        item.location?.toLowerCase().includes(term) ||
        item.assignedToPerson?.fullName?.toLowerCase().includes(term)
      );
      // ✅ Filtro por departamento
      const matchesDepartment = selectedDepartment === "todos" || item.location === selectedDepartment;
      // ✅ Filtro por tipo
      const matchesType = selectedType === "todos" || item.type === selectedType;
      return matchesSearch && matchesDepartment && matchesType;
    })
    : [];

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCompany?.id) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("csvFile", file);
      const res = await fetch(`${VITE_API_URL}/api/inventory/${selectedCompany.id}/inventory/import`, { method: "POST", body: formData });
      const data: ImportResult = await res.json();
      setImportResult(data);
      setShowImportResultModal(true);
      await fetchInventory();
    } catch (error) {
      alert(`Error en importación: ${error}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ✅ Redirigir a página de editar
  const handleEdit = (item: CreateEquipmentData) => {
    window.location.href = `edit/${item.id}`;
  };

  const abrirModalEliminar = (equipment: CreateEquipmentData) => { setEquipmentToDelete(equipment); setShowDeleteModal(true); };
  const cerrarModalEliminar = () => { setShowDeleteModal(false); setEquipmentToDelete(null); };

  const handleDelete = async () => {
    if (!equipmentToDelete) return;
    try {
      const res = await fetch(`${VITE_API_URL}/api/inventory/${selectedCompany?.id}/inventory/${equipmentToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar equipo");
      alert(t("inventory.equipmentDeleted"));
      cerrarModalEliminar();
      await fetchInventory();
    } catch (error) { alert(`Error al eliminar: ${error}`); }
  };

  const handleAddEquipment = async () => {
    if (!selectedCompany?.id) return;
    try {
      const res = await fetch(`${VITE_API_URL}/api/inventory/${selectedCompany?.id}/inventory/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: newEquipment.brand, model: newEquipment.model, type: newEquipment.type,
          serialNumber: newEquipment.serialNumber,
          location: newEquipment.location, status: newEquipment.status, cost: Number(newEquipment.cost),
        }),
      });
      if (!res.ok) throw new Error("Error al crear el equipo");
      alert(t("inventory.equipmentCreated"));
      setShowAddModal(false);
      setNewEquipment({ brand: "", model: "", type: "", serialNumber: "", location: "", status: "Activo", cost: "" });
      await fetchInventory();
    } catch (error) { alert(`Error al crear: ${error}`); }
  };

  const downloadTemplate = () => {
    const templateData = [
      { 'Marca': 'Dell', 'Modelo': 'Latitude 5420', 'Tipo': 'Laptop', 'Numero de Serie': 'DL123456789', 'Numero de Placa': 'PLC-001', 'Ubicacion': 'Oficina Principal', 'Costos': '1200', 'Sistema Operativo': 'Windows 11', 'Usuario Final': 'Juan Pérez' },
      { 'Marca': 'HP', 'Modelo': 'ProDesk 600', 'Tipo': 'Desktop', 'Numero de Serie': 'HP987654321', 'Numero de Placa': 'PLC-002', 'Ubicacion': 'Sala de Servidores', 'Costos': '800', 'Sistema Operativo': 'Windows 10', 'Usuario Final': 'María García' },
      { 'Marca': 'Cisco', 'Modelo': 'Catalyst 2960', 'Tipo': 'Switch', 'Numero de Serie': 'CS456789123', 'Numero de Placa': 'PLC-003', 'Ubicacion': 'Rack Principal', 'Costos': '500', 'Sistema Operativo': 'IOS', 'Usuario Final': 'Departamento IT' }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Equipos');
    const columnWidths = Object.keys(templateData[0]).map(key => ({
      wch: Math.min(Math.max(key.length, ...templateData.map(row => String(row[key as keyof typeof row]).length)) + 2, 30)
    }));
    worksheet['!cols'] = columnWidths;
    XLSX.writeFile(workbook, 'template_importacion_equipos.xlsx');
  };

  const columnConfig = {
    [t("devices.brand") + "/" + t("devices.model")]: (item: CreateEquipmentData) => (
      <div>
        <div className="font-medium">{item.brand}</div>
        <div className={`text-sm ${subTextClass}`}>{item.model}</div>
      </div>
    ),
    [t("common.type")]: (item: CreateEquipmentData) => item.type,
    [t("devices.serialNumber")]: (item: CreateEquipmentData) => (
      <div>
        <div>{item.plateNumber ?? "-"}</div>
        <div className={`text-xs ${subTextClass}`}>{item.serialNumber}</div>
      </div>
    ),
    [t("devices.location")]: (item: CreateEquipmentData) => getDepartmentName(item.location),
    [t("devices.assignedTo")]: (item: CreateEquipmentData) => item.assignedToPerson?.fullName ?? "-",
    [t("common.status")]: (item: CreateEquipmentData) => (
      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(String(item?.status))}`}>
        {item.status}
      </span>
    ),
    [t("inventory.unitPrice")]: (item: CreateEquipmentData) => item.cost ?? "-",
  };
  const filteredEquipos = inventory.filter(equipo => {
    const searchTermLower = search.toLowerCase()
    const matchesSearch =
      equipo?.model?.toLowerCase()?.includes(searchTermLower) ||
      equipo?.brand?.toLowerCase()?.includes(searchTermLower) ||
      equipo?.type?.toLowerCase()?.includes(searchTermLower) ||
      equipo?.serialNumber?.toLowerCase()?.includes(searchTermLower) ||
      equipo?.assignedToPerson?.fullName?.toLowerCase()?.includes(searchTermLower) ||
      equipo?.plateNumber?.toLowerCase()?.includes(searchTermLower)

    const matchesType = selectedType === "todos" || equipo?.type === selectedType
    const matchesDepartment = selectedDepartment === "todos" || equipo?.location === selectedDepartment

    return matchesSearch && matchesType && matchesDepartment
  })
  const totalEquipos = filteredEquipos.length
  const enUso = filteredEquipos.filter(e => e.assignedToPersonId != null).length
  const disponibles = filteredEquipos.filter(e => !e.assignedToPersonId).length
  const activos = filteredEquipos.filter(e => e.status === "Activo").length
  const enMantenimiento = filteredEquipos.filter(e => e.status === "Mantenimiento").length
  const dañados = filteredEquipos.filter(e => e.status === "DAMAGED").length
  const totalCost = filteredEquipos.reduce((sum, e) => sum + (Number(e.cost) || 0), 0)

  const getGarantiasPorVencer = () => {
    const proximos30Dias = new Date(new Date().setDate(new Date().getDate() + 30))
    return filteredEquipos.filter(equipo => {
      if (!equipo.warrantyDetails) return false
      try {
        if (isNaN(new Date(equipo.warrantyDetails).getTime())) return false
        const fechaGarantia = new Date(equipo.warrantyDetails)
        return fechaGarantia <= proximos30Dias && fechaGarantia >= new Date()
      } catch (e) {
        return false
      }
    }).length
  }
  const garantiasPorVencer = getGarantiasPorVencer()

  const getUserStats = () => {
    const userMap = new Map<string, number>()
    filteredEquipos.forEach(e => {
      const user = e.assignedToPerson?.fullName || "Sin asignar"
      userMap.set(user, (userMap.get(user) || 0) + 1)
    })
    const sorted = Array.from(userMap.entries()).sort((a, b) => b[1] - a[1])
    return {
      max: sorted[0] || ["Sin datos", 0] as [string, number],
      min: sorted[sorted.length - 1] || ["Sin datos", 0] as [string, number]
    }
  }
  const userStats = getUserStats()

  const getDeptStats = () => {
    const deptMap = new Map<string, number>()
    filteredEquipos.forEach(e => {
      const dept = getDepartmentName(e.location)
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1)
    })
    const sorted = Array.from(deptMap.entries()).sort((a, b) => b[1] - a[1])
    return sorted.slice(0, 3)
  }
  const topDepts = getDeptStats()

  const getTypeStats = () => {
    const typeMap = new Map<string, number>()
    filteredEquipos.forEach(e => {
      const type = e.type || "Sin tipo"
      typeMap.set(type, (typeMap.get(type) || 0) + 1)
    })
    return Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1])
  }
  const typeStats = getTypeStats()

  if (loading) return <Loader />;
  if (!selectedCompany?.id) return <p className={subTextClass}>{t("inventory.noCompany")}</p>;

  return (
    <div className={`flex-1 transition-colors ${pageBg}`}>
      <PagesHeader
        title={t("inventory.title")}
        description={pageName ? `${pageName} in ${selectedCompany?.name}` : t("common.loading")}
        showCreate
        onDownloadTemplate={downloadTemplate}
        onImportCsv={handleImportClick}
      />

      <input name="csvFile" ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />

      {/* Modal Importando */}
      {importing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className={`rounded-lg p-8 shadow-2xl max-w-md w-full border transition-colors ${cardBg}`}>
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-16 w-16 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">{t("action.importing")}</h3>
              <p className={`text-center ${subTextClass}`}>{t("inventory.importingMessage")}</p>
              <div className={`mt-4 w-full rounded-full h-2 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                <div className="bg-blue-500 h-2 rounded-full animate-pulse w-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Resultado Importación */}
      {showImportResultModal && importResult && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 shadow-2xl max-w-3xl w-full border max-h-[90vh] overflow-y-auto transition-colors ${cardBg}`}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold">
                {importResult.success ? `✅ ${t("inventory.importComplete")}` : `⚠️ ${t("inventory.importWithErrors")}`}
              </h3>
              <button onClick={() => setShowImportResultModal(false)} className={`${subTextClass} hover:opacity-75`}>
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`rounded-lg p-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className={`text-sm ${subTextClass}`}>{t("inventory.totalRows")}</p>
                <p className="text-2xl font-bold">{importResult.totalRows}</p>
              </div>
              <div className={`rounded-lg p-4 border ${isDarkMode ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-300"}`}>
                <p className={`text-sm ${isDarkMode ? "text-green-400" : "text-green-700"}`}>{t("inventory.inserted")}</p>
                <p className={`text-2xl font-bold ${isDarkMode ? "text-green-300" : "text-green-700"}`}>{importResult.inserted}</p>
              </div>
              <div className={`rounded-lg p-4 border ${isDarkMode ? "bg-yellow-900/30 border-yellow-700" : "bg-yellow-50 border-yellow-300"}`}>
                <p className={`text-sm ${isDarkMode ? "text-yellow-400" : "text-yellow-700"}`}>{t("inventory.skipped")}</p>
                <p className={`text-2xl font-bold ${isDarkMode ? "text-yellow-300" : "text-yellow-700"}`}>{importResult.skipped}</p>
              </div>
              <div className={`rounded-lg p-4 border ${isDarkMode ? "bg-red-900/30 border-red-700" : "bg-red-50 border-red-300"}`}>
                <p className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-700"}`}>{t("inventory.errors")}</p>
                <p className={`text-2xl font-bold ${isDarkMode ? "text-red-300" : "text-red-700"}`}>{importResult.errors}</p>
              </div>
            </div>

            {importResult.details.skippedRecords.length > 0 && (
              <div className="mb-6">
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                  {t("inventory.skippedRecords")} ({importResult.details.skippedRecords.length})
                </h4>
                <div className={`rounded-lg p-4 max-h-60 overflow-y-auto ${innerBg}`}>
                  {importResult.details.skippedRecords.map((item, idx) => (
                    <div key={idx} className={`mb-3 pb-3 border-b last:border-0 ${dividerClass}`}>
                      <p className="font-medium">{t("inventory.row")} {item.row}</p>
                      <p className={`text-sm ${subTextClass}`}>Serial: {item.serialNumber}</p>
                      <p className={`text-sm ${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.details.errorRecords.length > 0 && (
              <div className="mb-6">
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                  {t("inventory.errorRecords")} ({importResult.details.errorRecords.length})
                </h4>
                <div className={`rounded-lg p-4 max-h-60 overflow-y-auto ${innerBg}`}>
                  {importResult.details.errorRecords.map((item, idx) => (
                    <div key={idx} className={`mb-3 pb-3 border-b last:border-0 ${dividerClass}`}>
                      <p className="font-medium">{t("inventory.row")} {item.row}</p>
                      {item.serialNumber && <p className={`text-sm ${subTextClass}`}>Serial: {item.serialNumber}</p>}
                      <p className={`text-sm ${isDarkMode ? "text-red-300" : "text-red-600"}`}>{item.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.details.insertedRecords.length > 0 && (
              <div className="mb-4">
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                  {t("inventory.insertedRecords")} ({importResult.details.insertedRecords.length})
                </h4>
                <div className={`rounded-lg p-4 max-h-40 overflow-y-auto ${innerBg}`}>
                  <div className="flex flex-wrap gap-2">
                    {importResult.details.insertedRecords.map((serial, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded text-sm border ${isDarkMode ? "bg-green-900/30 border-green-700 text-green-300" : "bg-green-50 border-green-300 text-green-700"}`}>
                        {serial}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button onClick={() => setShowImportResultModal(false)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium">
                {t("action.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {showDeleteModal && equipmentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-lg shadow-xl max-w-sm w-full mx-4 border transition-colors ${cardBg}`}>
            <div className={`flex items-center justify-between p-6 border-b ${dividerClass}`}>
              <h3 className="text-lg font-semibold">{t("common.confirmDelete")}</h3>
              <button onClick={cerrarModalEliminar} className={`${subTextClass} hover:opacity-75 transition-opacity`}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className={`mb-2 ${labelClass}`}>{t("inventory.deleteConfirm")}</p>
              <p className="font-semibold text-lg">{equipmentToDelete.brand} {equipmentToDelete.model}</p>
              <p className={`text-sm mt-2 ${subTextClass}`}>Serie: {equipmentToDelete.serialNumber}</p>
              <p className={`text-sm mt-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{t("common.cannotUndo")}</p>
            </div>
            <div className={`flex gap-3 p-6 border-t ${dividerClass} ${cardBg750}`}>
              <button onClick={cerrarModalEliminar} className={`flex-1 ${cancelBtnClass}`}>{t("action.cancel")}</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">
                {t("action.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs PRINCIPALES */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-3">
        <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</span>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalEquipos}</div>
        </div>
        <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("inventory.inUse")}</span>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{enUso}</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{totalEquipos > 0 ? ((enUso / totalEquipos) * 100).toFixed(0) : 0}%</div>
        </div>
        <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("inventory.available")}</span>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{disponibles}</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{totalEquipos > 0 ? ((disponibles / totalEquipos) * 100).toFixed(0) : 0}%</div>
        </div>
        <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("common.active")}</span>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-500' : 'text-green-700'}`}>{activos}</div>
        </div>
        <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("inventory.maintenance")}</span>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{enMantenimiento}</div>
        </div>
        <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("inventory.damaged")}</span>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{dañados}</div>
        </div>
        <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("inventory.warranties")}</span>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{garantiasPorVencer}</div>
        </div>
        <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("inventory.cost")}</span>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            ${(totalCost >= 1000000 ? (totalCost / 1000000).toFixed(1) + 'M' : (totalCost >= 1000 ? (totalCost / 1000).toFixed(1) + 'k' : totalCost.toFixed(0)))}
          </div>
        </div>
      </div>

      {/* ANÁLISIS POR USUARIO */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
        <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("inventory.mostEquipment")}</span>
          <div className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.max[0]}</div>
          <div className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{userStats.max[1]}</div>
        </div>
        <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("inventory.topDepts")}</span>
          {topDepts.slice(0, 3).map((dept, idx) => (
            <div key={idx} className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {dept[0]}: <span className="font-bold">{dept[1]}</span>
            </div>
          ))}
        </div>
        <div className={`rounded p-3 border transition-colors ${isDarkMode ? 'bg-gray-800 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("inventory.types")}</span>
          {typeStats.slice(0, 3).map((type, idx) => (
            <div key={idx} className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {type[0]}: <span className="font-bold">{type[1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Filtros por Tipo y Departamento */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap mb-3">
        {/* Filtro por Tipo */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
              ? 'bg-gray-800 border border-white/[0.08] text-white'
              : 'bg-white border border-gray-300 text-gray-900'
            }`}
        >
          <option value="todos">{t("inventory.allTypes")}</option>
          {Array.from(new Set(inventory.map(eq => eq.type).filter(Boolean))).sort().map(type => (
            <option key={type} value={type}>
              🖥️ {type}
            </option>
          ))}
        </select>

        {/* Filtro por Departamento */}
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
              ? 'bg-gray-800 border border-white/[0.08] text-white'
              : 'bg-white border border-gray-300 text-gray-900'
            }`}
        >
          <option value="todos">{t("inventory.allDepartments")}</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              📍 {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {filteredInventory.length > 0 ? (
        <Tabla
          datos={filteredInventory}
          titulo={`${pageName || "Inventario"} List`}
          columnasPersonalizadas={columnConfig}
          onEditar={handleEdit}
          onEliminar={abrirModalEliminar}
          mostrarAcciones={true}
        />
      ) : (
        <p className={`mt-6 ${subTextClass}`}>{t("inventory.noEquipment")}</p>
      )}

      {/* Modal Agregar Equipo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-2xl border transition-colors ${cardBg}`}>
            <h3 className="text-xl font-bold mb-4">{t("inventory.create")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <input className={inputClass} placeholder={t("devices.brand")} value={newEquipment.brand} onChange={(e) => setNewEquipment({ ...newEquipment, brand: e.target.value })} />
              <input className={inputClass} placeholder={t("devices.model")} value={newEquipment.model} onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })} />
              <input className={inputClass} placeholder={t("common.type")} value={newEquipment.type} onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })} />
              <input className={inputClass} placeholder={t("devices.serialNumber")} value={newEquipment.serialNumber} onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })} />
              <select className={selectClass} value={newEquipment.location} onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}>
                <option value="">{t("inventory.noLocation")}</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <select className={selectClass} value={newEquipment.status} onChange={(e) => setNewEquipment({ ...newEquipment, status: e.target.value })}>
                <option value="Activo">Activo</option>
                <option value="En Uso">En Uso</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
              <input className={inputClass} placeholder={t("inventory.cost")} type="number" value={newEquipment.cost} onChange={(e) => setNewEquipment({ ...newEquipment, cost: e.target.value })} />
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <button onClick={() => setShowAddModal(false)} className={cancelBtnClass}>{t("action.cancel")}</button>
              <button onClick={handleAddEquipment} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium">{t("action.save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}