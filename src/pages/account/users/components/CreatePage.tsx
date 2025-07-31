// CreateUserPage.tsx
"use client"

import useSWR from "swr";
import { useParams } from "react-router-dom"; // ← aquí
import UpdateUser from "../../../../components/forms/UpdateUser";
import { Company, useCompany } from "../../../../context/routerContext";

const { VITE_API_URL } = import.meta.env;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface Departments {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

const CreateUserPage: React.FC = () => {
  const { id: userID } = useParams<{ id: string }>(); // ← aquí obtienes el param desde la URL

  const renderPage = userID ? "Editar Usuario" : "Crear Usuario";
  document.title = renderPage;

  const { selectedCompany }: { selectedCompany: Company | null } = useCompany();

  const { data, error } = useSWR(
    selectedCompany ? `${VITE_API_URL}/api/companies/${selectedCompany.code}/departments` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryInterval: 5000,
      errorRetryCount: 10,
    }
  );

  if (error || !data) return "Error loading data";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">{renderPage}</h1>
            <p className="text-gray-400">
              Complete la información para {userID ? "editar" : "registrar"} un usuario en el sistema
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              <span>Cancelar</span>
            </button>
          </div>
        </div>

        <UpdateUser
          userID={userID} // ← pásalo aquí si tu formulario lo necesita
          departments={data}
          selectedCompany={selectedCompany}
        />
      </div>
    </div>
  );
};

export default CreateUserPage;
