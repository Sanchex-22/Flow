"use client";

import { useState, useEffect, useRef } from "react";
import { useCompany } from "../../../context/routerContext";
import { PlusIcon } from "lucide-react";

interface Equipment {
  id: string;
  brand: string;
  model: string;
  type: string;
  plateNumber?: string | null;
  serialNumber: string;
  location?: string | null;
  assignedToUser?: {
    fullName?: string | null;
  } | null;
  status: string;
  cost?: number | null;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<Equipment[] | { message: string }>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [importing, setImporting] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newEquipment, setNewEquipment] = useState({
    brand: "",
    model: "",
    type: "",
    plateNumber: "",
    serialNumber: "",
    location: "",
    status: "Activo",
    cost: "",
  });

  const { selectedCompany } = useCompany();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "En Uso":
        return "bg-blue-600 text-blue-100";
      case "Mantenimiento":
        return "bg-yellow-600 text-yellow-100";
      case "Activo":
        return "bg-green-600 text-green-100";
      default:
        return "bg-gray-600 text-gray-100";
    }
  };

  const fetchInventory = async () => {
    if (!selectedCompany?.id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/inventory/${selectedCompany.id}/inventory/all`);
      if (!res.ok) throw new Error("Error al cargar inventario");
      const data = await res.json();
      setInventory(data);
    } catch (error) {
      console.error(error);
      setInventory({ message: "Error al cargar inventario" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCompany?.id]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCompany?.id) return;

    setImporting(true);

    try {
      const formData = new FormData();
      formData.append("csvFile", file);

      const res = await fetch(
        `http://localhost:3000/api/inventory/${selectedCompany.id}/inventory/import`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Error al importar CSV");
      }

      const data = await res.json();
      alert(`Importación exitosa. Filas insertadas: ${data.inserted}`);

      await fetchInventory();
    } catch (error) {
      alert(`Error en importación: ${error}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este equipo?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/inventory/${selectedCompany?.id}/inventory/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar equipo");

      alert("Equipo eliminado correctamente");
      await fetchInventory();
    } catch (error) {
      alert(`Error al eliminar: ${error}`);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEquipment) return;

    try {
      const res = await fetch(`http://localhost:3000/api/inventory/${selectedCompany?.id}/inventory/${editingEquipment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: editingEquipment.brand,
          model: editingEquipment.model,
          type: editingEquipment.type,
          plateNumber: editingEquipment.plateNumber,
          serialNumber: editingEquipment.serialNumber,
          location: editingEquipment.location,
          status: editingEquipment.status,
          cost: editingEquipment.cost,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar equipo");

      alert("Equipo actualizado correctamente");
      setShowEditModal(false);
      setEditingEquipment(null);
      await fetchInventory();
    } catch (error) {
      alert(`Error al actualizar: ${error}`);
    }
  };

  const handleAddEquipment = async () => {
    if (!selectedCompany?.id) return;

    try {
      const res = await fetch(`http://localhost:3000/api/inventory/${selectedCompany?.id}/inventory/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: newEquipment.brand,
          model: newEquipment.model,
          type: newEquipment.type,
          plateNumber: newEquipment.plateNumber,
          serialNumber: newEquipment.serialNumber,
          location: newEquipment.location,
          status: newEquipment.status,
          cost: Number(newEquipment.cost),
        }),
      });

      if (!res.ok) throw new Error("Error al crear el equipo");

      alert("Equipo creado correctamente");
      setShowAddModal(false);

      setNewEquipment({
        brand: "",
        model: "",
        type: "",
        plateNumber: "",
        serialNumber: "",
        location: "",
        status: "Activo",
        cost: "",
      });

      await fetchInventory();
    } catch (error) {
      alert(`Error al crear: ${error}`);
    }
  };

  if (loading) return <p>Cargando inventario...</p>;
  if (!selectedCompany?.id) return <p>No se encontró el código de empresa.</p>;

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex items-center gap-2">

        {/* BOTÓN AGREGAR EQUIPO */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Agregar Equipo</span>
        </button>

        <button
          onClick={handleImportClick}
          disabled={importing}
          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <span>{importing ? "Importando..." : "Importar CSV"}</span>
        </button>
      </div>

      <input
        name="csvFile"
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* INVENTARIO - TABLA */}
      {Array.isArray(inventory) && inventory.length > 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 mt-6">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold mb-2">Lista de Equipos</h2>
            <p className="text-gray-400 text-sm mb-6">
              {inventory.length} equipos encontrados para empresa {selectedCompany.id}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750">
                  <tr className="border-b border-gray-700">
                    <th className="p-4 text-gray-300">Marca/Modelo</th>
                    <th className="p-4 text-gray-300">Tipo</th>
                    <th className="p-4 text-gray-300">Placa/Serie</th>
                    <th className="p-4 text-gray-300">Ubicación</th>
                    <th className="p-4 text-gray-300">Encargado</th>
                    <th className="p-4 text-gray-300">Estado</th>
                    <th className="p-4 text-gray-300">Costo</th>
                    <th className="p-4 text-gray-300">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.map((equipo) => (
                    <tr key={equipo.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4">
                        <div className="font-medium">{equipo.brand}</div>
                        <div className="text-sm text-gray-400">{equipo.model}</div>
                      </td>
                      <td className="p-4">{equipo.type}</td>
                      <td className="p-4">
                        {equipo.plateNumber ?? "-"}
                        <div className="text-xs text-gray-400">{equipo.serialNumber}</div>
                      </td>
                      <td className="p-4">{equipo.location ?? "-"}</td>
                      <td className="p-4">{equipo.assignedToUser?.fullName ?? "-"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(equipo.status)}`}>
                          {equipo.status}
                        </span>
                      </td>
                      <td className="p-4">{equipo.cost ?? "-"}</td>

                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(equipo)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(equipo.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>
        </div>
      ) : (
        <p className="text-gray-400 mt-6">No hay equipos aún. Puedes agregar uno o importar un CSV.</p>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Agregar Nuevo Equipo</h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                placeholder="Marca"
                value={newEquipment.brand}
                onChange={(e) => setNewEquipment({ ...newEquipment, brand: e.target.value })}
              />
              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                placeholder="Modelo"
                value={newEquipment.model}
                onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
              />
              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                placeholder="Tipo"
                value={newEquipment.type}
                onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
              />
              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                placeholder="Número de Serie"
                value={newEquipment.serialNumber}
                onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
              />
              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                placeholder="Placa (opcional)"
                value={newEquipment.plateNumber}
                onChange={(e) => setNewEquipment({ ...newEquipment, plateNumber: e.target.value })}
              />
              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                placeholder="Ubicación"
                value={newEquipment.location}
                onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
              />
              <select
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                value={newEquipment.status}
                onChange={(e) => setNewEquipment({ ...newEquipment, status: e.target.value })}
              >
                <option value="Activo">Activo</option>
                <option value="En Uso">En Uso</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>

              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                placeholder="Costo"
                type="number"
                value={newEquipment.cost}
                onChange={(e) => setNewEquipment({ ...newEquipment, cost: e.target.value })}
              />
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={handleAddEquipment}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                Guardar Equipo
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Editar Equipo</h3>

            {/* CAMPOS EDITAR */}
            <div className="grid grid-cols-2 gap-4">

              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                value={editingEquipment.brand}
                onChange={(e) => setEditingEquipment({ ...editingEquipment, brand: e.target.value })}
              />
              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                value={editingEquipment.model}
                onChange={(e) => setEditingEquipment({ ...editingEquipment, model: e.target.value })}
              />

              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                value={editingEquipment.type}
                onChange={(e) => setEditingEquipment({ ...editingEquipment, type: e.target.value })}
              />
              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                value={editingEquipment.serialNumber}
                onChange={(e) => setEditingEquipment({ ...editingEquipment, serialNumber: e.target.value })}
              />

              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                value={editingEquipment.plateNumber || ""}
                onChange={(e) => setEditingEquipment({ ...editingEquipment, plateNumber: e.target.value })}
              />
              <input
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                value={editingEquipment.location || ""}
                onChange={(e) => setEditingEquipment({ ...editingEquipment, location: e.target.value })}
              />

              <select
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                value={editingEquipment.status}
                onChange={(e) => setEditingEquipment({ ...editingEquipment, status: e.target.value })}
              >
                <option value="Activo">Activo</option>
                <option value="En Uso">En Uso</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>

              <input
                type="number"
                className="bg-gray-700 border border-gray-600 p-2 rounded"
                value={editingEquipment.cost || ""}
                onChange={(e) => setEditingEquipment({ ...editingEquipment, cost: Number(e.target.value) })}
              />
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEquipment(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
