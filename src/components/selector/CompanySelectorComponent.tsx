// CompanySelectorComponent.tsx
import { useNavigate, useLocation } from 'react-router-dom'; // Importa useLocation
import { useCompany } from '../../context/routerContext';
import { useCallback } from 'react';

export interface Company {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  _count: {
    users: number;
    equipments: number;
    licenses: number;
    documents: number;
    maintenances: number;
  };
}

const CompanySelectorComponent: React.FC = () => {
  const { selectedCompany, handleCompanyChange, companies } = useCompany();
  const navigate = useNavigate();
  const location = useLocation(); // Usa useLocation para obtener la ruta actual

  const handleChangeAndNavigate = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    handleCompanyChange(event);
    const newCompanyCode = event.target.value;
    console.log("New Company Code selected:", newCompanyCode);
    const currentPath = location.pathname;
    const pathSegments = currentPath.split('/');

    if (pathSegments.length >= 2) {
      pathSegments[1] = newCompanyCode;
      const newPath = pathSegments.join('/');
      navigate(newPath);
    } else {
      navigate(`/${newCompanyCode}/dashboard/all`);
    }
  }, [handleCompanyChange, navigate, location.pathname]);

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
        EMPRESA ACTIVA
      </div>
      <div className="relative">
        <select
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChangeAndNavigate}
          value={selectedCompany ? selectedCompany.code : ''}
        >
          {companies && companies.length > 0 ? (
            companies.map((company) => (
              <option key={company?.id} value={company?.code}>
                {company?.name}
              </option>
            ))
          ) : (
            <option value="">No companies available</option>
          )}
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
  );
}

export default CompanySelectorComponent;