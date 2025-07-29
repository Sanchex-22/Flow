
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../../context/routerContext';
function CompanySelectorComponent() {
  const { selectedCompany, companies, handleCompanyChange } = useCompany();
  const navigate = useNavigate();
  const handleChangeAndNavigate = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handleCompanyChange(event);
    const newCompanyCode = event.target.value;
    navigate(`/${newCompanyCode}/dashboard/all`);
  };

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
        EMPRESA ACTIVA
      </div>
      <div className="relative">
        <select
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChangeAndNavigate}
          value={selectedCompany ? selectedCompany.code : ''} // Use selectedCompany from context
        >
          {companies && companies.length > 0 ? (
            companies.map((company) => (
              <option key={company.id} value={company.code}>
                {company.name}
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