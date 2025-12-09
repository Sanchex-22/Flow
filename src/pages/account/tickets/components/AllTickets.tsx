"use client"

import { useEffect, useState } from "react"
import { Ticket } from "../../../../utils/ticketFull"
import { CreateTicketModal } from "./create-ticket-modal"
import { DeleteConfirmationModal } from "./deleteModal"
import * as XLSX from 'xlsx';
import { useCompany } from "../../../../context/routerContext"

const EXCEL_COLUMNS = [
    { key: "id", header: "# Ticket" },
    { key: "title", header: "Título" },
    { key: "description", header: "Descripción" },
    { key: "status", header: "Estado" },
    { key: "priority", header: "Prioridad" },
    { key: "createdAt", header: "Fecha Creación" },
]

export default function Home() {
  const { selectedCompany } = useCompany();
  
  const [activeTab, setActiveTab] = useState("Todos")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId] = useState<string>("")
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };
    
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Cargar tickets de la compañía
  useEffect(() => {
    if (!selectedCompany?.id) {
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/companies/tickets/${selectedCompany.id}/all`
        )
            
        if (!res.ok) {
          throw new Error(`Error al cargar tickets: ${res.status}`)
        }

        let fetchedTickets = await res.json()
        
        // Manejar respuesta con estructura "ticket" o array directo
        if (fetchedTickets.ticket) {
          fetchedTickets = Array.isArray(fetchedTickets.ticket) ? fetchedTickets.ticket : [fetchedTickets.ticket];
        }
        
        // Si la respuesta es un objeto con propiedad "ok", extraer los datos
        if (fetchedTickets.data) {
          fetchedTickets = fetchedTickets.data;
        }
        
        // Asegurar que es un array
        if (!Array.isArray(fetchedTickets)) {
          fetchedTickets = [];
        }
            
        fetchedTickets = fetchedTickets.map((ticket: any) => ({
          ...ticket,
          createdAt: new Date(ticket.createdAt as unknown as string),
          updatedAt: new Date(ticket.updatedAt as unknown as string),
        }))

        setTickets(fetchedTickets)
        setLoading(false);
      } catch (error) {
        console.error("❌ Error al cargar los tickets:", error)
        showNotification("Error al cargar tickets.", 'error');
        setLoading(false);
      }
    }
        
    fetchTickets()
  }, [selectedCompany?.id])

  // Cargar usuarios de la compañía
  useEffect(() => {
    if (!selectedCompany?.id) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/companies/${selectedCompany.id}`
        )
        
        if (!res.ok) {
          console.warn("No se pudieron cargar los usuarios");
          return;
        }
        
        const data = await res.json()
        // Si la respuesta incluye users, usarla; si no, usar array vacío
        if (data.users) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
      }
    }

    fetchUsers()
  }, [selectedCompany?.id])

  const handleCreateTicket = async (newTicketData: Omit<Ticket, "id" | "createdAt" | "updatedAt">) => {
    if (!selectedCompany?.id) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/companies/tickets/${selectedCompany.id}/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newTicketData),
        }
      )

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Error al crear ticket:", errorText)
        showNotification(`Error: ${errorText.substring(0, 50)}...`, 'error');
        return
      }

      let savedTicket = await res.json()
      
      // Manejar respuesta con estructura "ticket"
      if (savedTicket.ticket) {
        savedTicket = savedTicket.ticket;
      }

      savedTicket = {
        ...savedTicket,
        createdAt: new Date(savedTicket.createdAt as unknown as string),
        updatedAt: new Date(savedTicket.updatedAt as unknown as string),
      };

      setTickets([savedTicket, ...tickets])

      const ticketId = savedTicket.ticketNumber ? `#${savedTicket.ticketNumber}` : savedTicket.id;
      const notificationMessage = `Ticket ${ticketId} - "${savedTicket.title}" creado con éxito.`;
      showNotification(notificationMessage, 'success');
      setIsCreateModalOpen(false);

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
    if (!selectedTicket || !selectedCompany?.id) return
    setIsDeleting(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/companies/tickets/${selectedCompany.id}/${selectedTicket.id}`,
        {
          method: "DELETE",
        }
      )

      if (!res.ok) {
        throw new Error("Error al eliminar ticket")
      }

      setTickets(tickets.filter((t) => t.id !== selectedTicket.id))
      showNotification(`Ticket #${selectedTicket.ticketNumber || selectedTicket.id} eliminado.`, 'success');
      setIsDeleting(false)
      closeDeleteModal()
    } catch (error) {
      console.error("Error eliminando ticket:", error)
      showNotification("Error al eliminar el ticket.", 'error');
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-600 text-yellow-100"
      case "pending":
        return "bg-purple-600 text-purple-100"
      case "approved":
        return "bg-green-600 text-green-100"
      case "rejected":
        return "bg-red-600 text-red-100"
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
      case "trivial":
        return "bg-gray-600 text-gray-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "closed":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-400">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        )
      case "open":
      case "pending":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-yellow-400">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        )
      case "rejected":
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
    if (activeTab === "Pendientes") return ["open", "pending"].includes(ticket.status)
    if (activeTab === "Completados") return ["approved", "closed"].includes(ticket.status)
    return true
  })

  const totalTickets = tickets.length
  const pendientes = tickets.filter((t) => ["open", "pending"].includes(t.status)).length
  const completados = tickets.filter((t) => ["approved", "closed"].includes(t.status)).length

  const exportToExcel = () => {
    if (tickets.length === 0) {
      showNotification("No hay tickets para exportar.", 'error');
      return;
    }

    try {
        const dataToExport = tickets.map(ticket => {
            const row: { [key: string]: any } = {};
            EXCEL_COLUMNS.forEach(col => {
                let value = (ticket as any)[col.key];
                if (col.key === 'createdAt' || col.key === 'updatedAt') {
                    value = value instanceof Date ? value.toLocaleDateString() : value;
                }
                row[col.header] = value || '';
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
        XLSX.writeFile(workbook, "tickets_exportados.xlsx");
        showNotification("Tickets exportados con éxito.", 'success');
    } catch (error) {
        console.error("Error al exportar a Excel:", error);
        showNotification("Error al exportar tickets a Excel.", 'error');
    }
  };

  if (!selectedCompany?.id) {
    return <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-gray-400">Selecciona una compañía para ver los tickets</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
        
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Tickets - {selectedCompany?.name}</h1>
          <p className="text-gray-400">Gestiona los tickets de soporte, vacaciones y permisos</p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exportar Excel</span>
          </button>
          
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <span className="text-gray-400 text-sm">Total Tickets</span>
          <div className="text-3xl font-bold mb-1">{totalTickets}</div>
          <div className="text-sm text-gray-400">Registrados</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <span className="text-gray-400 text-sm">Pendientes</span>
          <div className="text-3xl font-bold mb-1">{pendientes}</div>
          <div className="text-sm text-gray-400">Requieren atención</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <span className="text-gray-400 text-sm">Completados</span>
          <div className="text-3xl font-bold mb-1">{completados}</div>
          <div className="text-sm text-gray-400">Finalizados</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
          {["Todos", "Pendientes", "Completados"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold mb-2">Tickets</h2>
          <p className="text-gray-400 text-sm">Lista completa de tickets</p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <p>Cargando tickets...</p>
            </div>
          ) : filteredTickets?.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No hay tickets disponibles</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-750">
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-sm font-medium text-gray-300">#</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Título</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Prioridad</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Fecha</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4 text-sm font-medium">{ticket.ticketNumber || ticket.id.slice(0, 8)}</td>
                    <td className="p-4">
                      <div className="font-medium text-sm">{ticket.title}</div>
                      <div className="text-xs text-gray-400">{ticket.description?.substring(0, 40)}...</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(ticket.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{ticket.createdAt?.toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => window.location.href = `${ticket.id}`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-150"
                          title="Editar ticket"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(ticket)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-150"
                          title="Eliminar ticket"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTicket={handleCreateTicket}
        currentUserId={currentUserId}
        users={users}
        companyId={selectedCompany?.id || ""}
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