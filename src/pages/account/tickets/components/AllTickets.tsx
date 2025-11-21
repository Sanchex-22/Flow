"use client"

import { useEffect, useState } from "react"
import { Ticket } from "../../../../utils/ticketFull"
import { CreateTicketModal } from "./create-ticket-modal"
import { DeleteConfirmationModal } from "./deleteModal"
import { Notification } from "./notification"
// Asegúrate de que esta ruta sea correcta para tu componente de notificación

export default function Home() {
  const [activeTab, setActiveTab] = useState("Todos")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  // users list and current user id to satisfy CreateTicketModal props
  const [users, ] = useState<any[]>([])
  const [currentUserId, ] = useState<string>("")

  // 🌟 NUEVO ESTADO PARA NOTIFICACIONES
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // 🌟 FUNCIÓN DE UTILIDAD PARA MOSTRAR NOTIFICACIONES
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };
  
  // 🌟 useEffect para ocultar la notificación después de 3 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/all`) // Asume esta es la ruta GET ALL
        
        if (!res.ok) {
          throw new Error(`Error al cargar tickets: ${res.status}`)
        }

        let fetchedTickets = await res.json()
        
        // *Importante*: Conversión de fechas
        fetchedTickets = fetchedTickets.map((ticket: Ticket) => ({
          ...ticket,
          createdAt: new Date(ticket.createdAt as unknown as string),
          updatedAt: new Date(ticket.updatedAt as unknown as string),
        }))

        setTickets(fetchedTickets)
      } catch (error) {
        console.error("❌ Error al cargar los tickets:", error)
        showNotification("Error al cargar tickets.", 'error'); // Mostrar error de carga
      }
    }
    
    fetchTickets()
  }, [])

  const handleCreateTicket = async (newTicketData: Omit<Ticket, "id" | "createdAt" | "updatedAt">) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newTicketData),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Error al crear ticket:", errorText)
        showNotification(`Error: ${errorText.substring(0, 50)}...`, 'error');
        return
      }

      let savedTicket = await res.json()

      // 🌟 CORRECCIÓN 1: Asegurar que el ticket devuelto tiene las fechas como objetos Date
      savedTicket = {
        ...savedTicket,
        createdAt: new Date(savedTicket.createdAt as unknown as string),
        updatedAt: new Date(savedTicket.updatedAt as unknown as string),
      };

      // añadir al estado para reflejarlo inmediatamente en la UI
      setTickets([savedTicket, ...tickets])

      // 🌟 CORRECCIÓN 2: Usar las propiedades title e id para la notificación.
      const ticketId = savedTicket.id ? `#${savedTicket.id}` : '';
      const notificationMessage = `Ticket ${ticketId} - "${savedTicket.title}" creado con éxito.`;
      showNotification(notificationMessage, 'success');

    } catch (err) {
      console.error("Error de conexión:", err)
      showNotification("Error de conexión al servidor.", 'error');
    }
  }


  const openDeleteModal = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false)
      setSelectedTicket(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedTicket) return
    setIsDeleting(true)

    // Simular eliminación
    setTimeout(() => {
      setTickets(tickets.filter((t) => t.id !== selectedTicket.id))
      showNotification(`Ticket #${selectedTicket.id} eliminado.`, 'success'); // Notificación de eliminación
      setIsDeleting(false)
      closeDeleteModal()
    }, 1000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-600 text-green-100"
      case "in-progress":
        return "bg-blue-600 text-blue-100"
      case "open":
        return "bg-yellow-600 text-yellow-100"
      case "closed":
        return "bg-red-600 text-red-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-600 text-red-100"
      case "high":
        return "bg-orange-600 text-orange-100"
      case "medium":
        return "bg-yellow-600 text-yellow-100"
      case "low":
        return "bg-green-600 text-green-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-400">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        )
      case "in-progress":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-400">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        )
      case "open":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-yellow-400"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        )
      case "closed":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-400">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="m12 17 .01 0" />
          </svg>
        )
      default:
        return null
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === "Todos") return true
    if (activeTab === "Pendientes") return ticket.status === "open" || ticket.status === "in-progress"
    if (activeTab === "Completados") return ticket.status === "resolved" || ticket.status === "closed"
    return true
  })

  const totalTickets = tickets.length
  const pendientes = tickets.filter((t) => t.status === "open" || t.status === "in-progress").length
  const completados = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      
      {/* 🌟 AÑADIR COMPONENTE DE NOTIFICACIÓN AQUÍ */}
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Tickets</h1>
          <p className="text-gray-400">Gestiona los tickets de soporte, vacaciones y permisos</p>
        </div>
        <div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Crear Ticket</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Tickets</span>
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-gray-400"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              </div>
          </div>
          <div className="text-3xl font-bold mb-1">{totalTickets}</div>
          <div className="text-sm text-gray-400">Tickets registrados</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Pendientes / En Proceso</span>
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-yellow-400"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="m12 17 .01 0" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{pendientes}</div>
          <div className="text-sm text-gray-400">Requieren atención</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Resueltos</span>
            <div className="w-6 h-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-full h-full text-green-400"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{completados}</div>
          <div className="text-sm text-gray-400">Tickets finalizados</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
          {["Todos", "Pendientes", "Completados"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold mb-2">Todos los Tickets</h2>
          <p className="text-gray-400 text-sm">Lista completa de tickets registrados</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-sm font-medium text-gray-300"># Ticket</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Título</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Prioridad</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Usuario</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Compañía</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Asignado A</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Fecha Creación</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    No hay tickets disponibles. Crea uno nuevo para comenzar.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, index) => ( // 🌟 CORRECCIÓN 3 (Resistencia de Key): Usa index si ticket.id es undefined.
                  <tr key={ticket.id || index} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4 text-sm font-medium">{ticket?.id}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-sm">{ticket?.title}</div>
                        <div className="text-xs text-gray-400">{ticket?.description?.substring(0, 50)}...</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(ticket?.status)}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(ticket?.status)}`}
                        >
                          {ticket?.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(ticket?.priority)}`}
                      >
                        {ticket?.priority}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{ticket?.userName}</td>
                    <td className="p-4 text-sm">{ticket?.companyName}</td>
                    <td className="p-4 text-sm">{ticket?.assignedTo || "N/A"}</td>
                    <td className="p-4 text-sm">{ticket?.createdAt?.toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-150">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(ticket)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-150"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTicket={handleCreateTicket}
        currentUserId={currentUserId}
        users={users}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        ticket={selectedTicket}
        isDeleting={isDeleting}
      />
    </div>
  )
}