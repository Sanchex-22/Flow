"use client"

type Subroutes = {
  name: string;
  href: string;
}

type DashboardProps = {
  subroutes: Subroutes [];
}

const Dashboard: React.FC<DashboardProps> = ({ subroutes }) => {
  return (
    <>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard IT - Empresa Principal S.A.</h1>
          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Generar Reporte
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Equipos */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Equipos</span>
              <div className="w-6 h-6">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full text-gray-400"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">247</div>
            <div className="text-sm text-gray-400">Equipos registrados en Empresa Principal S.A.</div>
            <div className="text-green-400 text-sm mt-2">↗ +12%</div>
          </div>

          {/* Mantenimientos Pendientes */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Mantenimientos Pendientes</span>
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
            <div className="text-3xl font-bold mb-1">8</div>
            <div className="text-sm text-gray-400">Requieren atención en Empresa Principal S.A.</div>
            <div className="text-red-400 text-sm mt-2">↘ -3%</div>
          </div>

          {/* Equipos Activos */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Equipos Activos</span>
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
            <div className="text-3xl font-bold mb-1">231</div>
            <div className="text-sm text-gray-400">En funcionamiento en Empresa Principal S.A.</div>
            <div className="text-green-400 text-sm mt-2">↗ +15%</div>
          </div>

          {/* Usuarios Activos */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Usuarios Activos</span>
              <div className="w-6 h-6">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full text-blue-400"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">156</div>
            <div className="text-sm text-gray-400">Empleados registrados en Empresa Principal S.A.</div>
            <div className="text-green-400 text-sm mt-2">↗ +8%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Inventario por Categoría */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-2">Inventario por Categoría</h2>
            <p className="text-gray-400 text-sm mb-6">Distribución de equipos por tipo</p>

            <div className="space-y-4">
              {/* Laptops */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    <span className="text-sm">Laptops</span>
                  </div>
                </div>
                <span className="text-sm font-medium">89</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "36%" }}></div>
              </div>

              {/* Desktops */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    <span className="text-sm">Desktops</span>
                  </div>
                </div>
                <span className="text-sm font-medium">45</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "18%" }}></div>
              </div>

              {/* Móviles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    <span className="text-sm">Móviles</span>
                  </div>
                </div>
                <span className="text-sm font-medium">67</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "27%" }}></div>
              </div>

              {/* Impresoras */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <polyline points="6,9 6,2 18,2 18,9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    <span className="text-sm">Impresoras</span>
                  </div>
                </div>
                <span className="text-sm font-medium">23</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: "9%" }}></div>
              </div>

              {/* Networking */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M9 12l2 2 4-4" />
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                      <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3" />
                      <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3" />
                    </svg>
                    <span className="text-sm">Networking</span>
                  </div>
                </div>
                <span className="text-sm font-medium">23</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "9%" }}></div>
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-2">Actividad Reciente</h2>
            <p className="text-gray-400 text-sm mb-6">Últimas acciones en el sistema</p>

            <div className="space-y-4">
              {/* Mantenimiento completado */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Mantenimiento completado - Laptop Dell Latitude 5520</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 mr-1">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    Hace 2 horas
                  </div>
                </div>
              </div>

              {/* Nuevo equipo agregado */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Nuevo equipo agregado - Monitor Samsung 27"</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 mr-1">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    Hace 4 horas
                  </div>
                </div>
              </div>

              {/* Impresora requiere mantenimiento */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <path d="M12 9v4" />
                    <path d="m12 17 .01 0" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Impresora HP LaserJet requiere mantenimiento</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 mr-1">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    Hace 6 horas
                  </div>
                </div>
              </div>

              {/* Laptop asignada */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Laptop asignada a Juan Pérez - Desarrollo</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 mr-1">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    Hace 1 día
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-2">Acciones Rápidas</h2>
          <p className="text-gray-400 text-sm mb-6">Accesos directos a las funciones más utilizadas</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Agregar Equipo */}
            <button className="bg-gray-700 hover:bg-gray-600 rounded-lg p-6 text-center transition-colors border border-gray-600">
              <div className="w-8 h-8 mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <span className="text-sm font-medium">Agregar Equipo</span>
            </button>

            {/* Programar Mantenimiento */}
            <button className="bg-gray-700 hover:bg-gray-600 rounded-lg p-6 text-center transition-colors border border-gray-600">
              <div className="w-8 h-8 mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="m12 17 .01 0" />
                </svg>
              </div>
              <span className="text-sm font-medium">Programar Mantenimiento</span>
            </button>

            {/* Asignar Equipo */}
            <button className="bg-gray-700 hover:bg-gray-600 rounded-lg p-6 text-center transition-colors border border-gray-600">
              <div className="w-8 h-8 mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Asignar Equipo</span>
            </button>

            {/* Ver Reportes */}
            <button className="bg-gray-700 hover:bg-gray-600 rounded-lg p-6 text-center transition-colors border border-gray-600">
              <div className="w-8 h-8 mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                </svg>
              </div>
              <span className="text-sm font-medium">Ver Reportes</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
export default Dashboard
