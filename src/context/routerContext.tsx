import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 1. Define the Company interface (Mantener esto aquí o en un archivo de tipos compartido)
interface Company {
  id: number; // Asumiendo que id es un número, ajustar si es string
  name: string;
  code: string;
  // Agrega cualquier otra propiedad que tu objeto compañía pueda tener
}

// 2. Define el tipo para el valor del contexto
interface CompanyContextType {
  selectedCompany: Company | null;
  setSelectedCompany: React.Dispatch<React.SetStateAction<Company | null>>;
  companies: Company[]; // El array de compañías también está en el contexto
  handleCompanyChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

// Crea el contexto con un valor nulo por defecto
export const CompanyContext = createContext<CompanyContextType | null>(null);

// 3. Define las props para CompanyProvider
interface CompanyProviderProps {
  children: ReactNode; // 'ReactNode' cubre cualquier cosa que React pueda renderizar
  initialCompanies: Company[]; // 'initialCompanies' es un array de objetos 'Company'
}

// Crea un componente proveedor
export const CompanyProvider = ({ children, initialCompanies }: CompanyProviderProps) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(() => {
    // Intenta obtener la compañía de localStorage en la carga inicial
    const savedCompany = localStorage.getItem('selectedCompany');
    try {
      return savedCompany ? JSON.parse(savedCompany) : null;
    } catch (error) {
      console.error("Error parsing saved company from localStorage:", error);
      return null; // Retorna null si el parseo falla
    }
  });

  // Asegúrate de que el estado 'companies' sea un array de objetos Company
  const [companies, setCompanies] = useState<Company[]>(initialCompanies || []);

  // Actualiza localStorage cada vez que selectedCompany cambie
  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
    } else {
      localStorage.removeItem('selectedCompany');
    }
  }, [selectedCompany]);

  // Si las compañías se cargan asíncronamente, podrías actualizarlas aquí
  useEffect(() => {
    // Solo establece un valor por defecto si initialCompanies están disponibles y no hay compañía seleccionada
    if (initialCompanies && initialCompanies.length > 0 && !selectedCompany) {
      // Establece la primera compañía como predeterminada si no hay nada seleccionado
      setSelectedCompany(initialCompanies[0]);
    }
    // Si initialCompanies cambia (ej. carga asíncrona), actualiza el estado 'companies'
    if (initialCompanies && initialCompanies.length > 0 && companies !== initialCompanies) {
        setCompanies(initialCompanies);
    }
  }, [initialCompanies, selectedCompany, companies]); // Depende de initialCompanies para reaccionar a los cambios

  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const companyCode = event.target.value;
    const company = companies.find(c => c.code === companyCode);
    setSelectedCompany(company || null); // Asegura que sea Company o null
  };

  // El prop 'value' ahora está correctamente tipado como CompanyContextType
  return (
    <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany, companies, handleCompanyChange }}>
      {children}
    </CompanyContext.Provider>
  );
};

// Hook personalizado para un consumo más fácil
export const useCompany = () => {
  // Asegura que el contexto esté tipado correctamente al ser consumido
  const context = useContext(CompanyContext);
  if (!context) {
    // Este error se lanzará si useCompany se llama fuera de un CompanyProvider
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};