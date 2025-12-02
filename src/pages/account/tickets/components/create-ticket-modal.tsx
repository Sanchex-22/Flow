"use client";

import { useState } from "react";
// Asegúrate de tener 'lucide-react' instalado o reemplaza por tus propios iconos.
import { X, Plus } from "lucide-react"; 

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (ticket: any) => void;
  currentUserId: string;
  users: any[];
}

export function CreateTicketModal({
  isOpen,
  onClose,
  onCreateTicket,
  currentUserId,
  users
}: CreateTicketModalProps) {
  // 1. MODIFICACIÓN DEL ESTADO INICIAL ⚙️
  const [form, setForm] = useState({
    title: "",
    description: "",
    img: "",
    comment: "",
    type: "ticket", // Valores del Enum TicketType (minúsculas)
    priority: "medium", // Valores del Enum TicketPriority (minúsculas)
    status: "open", // Valores del Enum TicketStatus (minúsculas)
    startDate: "",
    endDate: "",
    // ELIMINADOS: requestDays, approvedDays
    reviewed: false,
    view: false,
    sendToId: "",
  });

  if (!isOpen) return null;

  const updateField = (key: string, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 2. MODIFICACIÓN DEL PAYLOAD DE ENVÍO (handleSubmit) 📦
    const payload = {
      title: form.title,
      description: form.description,
      img: form.img || null,
      comment: form.comment || null,
      type: form.type,
      priority: form.priority,
      status: form.status,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      // ELIMINADOS: requestDays y approvedDays del payload
      reviewed: form.reviewed, // Enviando como booleano (Prisma lo maneja)
      view: form.view,
      sendById: currentUserId,
      sendToId: form.sendToId || null,
    };
    
    console.log("Creating ticket with payload:", payload);
    onCreateTicket(payload);
    onClose();
  };

  const inputClass = "w-full rounded-md border border-gray-400 bg-white text-black px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
        {/* ... Encabezado del Modal ... */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-black">Crear Ticket</h2>
              <p className="text-sm text-gray-600">Ingresa los datos del ticket</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-gray-200 rounded-full p-2 transition">
            <X className="h-5 w-5 text-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Título */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">Título *</label>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">Descripción *</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={`${inputClass} resize-none`}
              required
            />
          </div>

          {/* Imagen URL */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">Imagen (URL)</label>
            <input
              value={form.img}
              onChange={(e) => updateField("img", e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </div>

          {/* Comentario */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">Comentario</label>
            <input
              value={form.comment}
              onChange={(e) => updateField("comment", e.target.value)}
              className={inputClass}
              placeholder="Comentario opcional"
            />
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">Tipo *</label>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className={inputClass}
            >
              <option value="ticket">Ticket</option>
              <option value="vacations">Vacaciones</option>
              <option value="permission">Permiso</option>
            </select>
          </div>

          {/* Prioridad / Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-black">Prioridad *</label>
              <select
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
                className={inputClass}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-black">Estado *</label>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className={inputClass}
              >
                {/* 3. MODIFICACIÓN DEL SELECT DE ESTADO (JSX) 👇 */}
                <option value="open">Abierto</option>
                <option value="pending">Pendiente</option>
                <option value="in_process">En proceso</option>
                <option value="approved">Aprobado</option> 
                <option value="rejected">Rechazado</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option> 
              </select>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-black">Fecha inicio</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-black">Fecha final</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* 🛑 ELIMINACIÓN DE CAMPOS OBSOLETOS 👇 */}
          {/* Se eliminan los div de "Días solicitados" y "Días aprobados" */}
          
          {/* Asignar a */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">Asignar a</label>
            <select
              value={form.sendToId}
              onChange={(e) => updateField("sendToId", e.target.value)}
              className={inputClass}
            >
              <option value="">Sin asignar</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          {/* Revisado + Visto */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-black">
              <input
                type="checkbox"
                checked={form.reviewed}
                onChange={(e) => updateField("reviewed", e.target.checked)}
              />
              Revisado
            </label>
            <label className="flex items-center gap-2 text-black">
              <input
                type="checkbox"
                checked={form.view}
                onChange={(e) => updateField("view", e.target.checked)}
              />
              Visto
            </label>
          </div>

          {/* ... Botones de acción ... */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-400 text-black px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Crear Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}