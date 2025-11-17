"use client"

import type React from "react"
import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Ticket } from "../../../../utils/ticketFull"

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTicket: (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt">) => void
}

export function CreateTicketModal({ isOpen, onClose, onCreateTicket }: CreateTicketModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [tags, setTags] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newTicket: Omit<Ticket, "id" | "createdAt" | "updatedAt"> = {
      title,
      description,
      status: "open",
      priority,
      userId: "", // Se puede generar o asignar desde la API
      userName,
      userEmail,
      companyId: "", // Se puede generar o asignar desde la API
      companyName,
      assignedTo: assignedTo || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }

    onCreateTicket(newTicket)

    // Reset form
    setTitle("")
    setDescription("")
    setPriority("medium")
    setUserName("")
    setUserEmail("")
    setCompanyName("")
    setAssignedTo("")
    setTags("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-lg shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Crear Nuevo Ticket</h2>
              <p className="text-sm text-muted-foreground">Completa la información del ticket</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground block">
              Título del Ticket *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Error en el sistema de autenticación"
              required
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground block">
              Descripción *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el problema o solicitud en detalle..."
              required
              rows={4}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            />
          </div>

          {/* User Info Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* User Name */}
            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium text-foreground block">
                Nombre del Usuario *
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* User Email */}
            <div className="space-y-2">
              <label htmlFor="userEmail" className="text-sm font-medium text-foreground block">
                Email del Usuario *
              </label>
              <input
                id="userEmail"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Ej: juan@empresa.com"
                required
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          {/* Company and Priority Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Company Name */}
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium text-foreground block">
                Compañía *
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ej: Acme Corporation"
                required
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium text-foreground block">
                Prioridad *
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                required
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <label htmlFor="assignedTo" className="text-sm font-medium text-foreground block">
              Asignado a
            </label>
            <input
              id="assignedTo"
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Ej: Equipo de Backend"
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium text-foreground block">
              Etiquetas
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ej: bug, authentication, critical (separadas por comas)"
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            <p className="text-xs text-muted-foreground">Separa las etiquetas con comas</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-input rounded-md text-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title || !description || !userName || !userEmail || !companyName}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Crear Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
