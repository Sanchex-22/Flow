// CompanyContext.jsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 1. Define the Company interface
interface Company {
  id: number; // Assuming id is a number, adjust if it's a string (e.g., string)
  name: string;
  code: string;
  // Add any other properties your company object might have
}

// 2. Define the type for the context value
interface CompanyContextType {
  selectedCompany: Company | null;
  setSelectedCompany: React.Dispatch<React.SetStateAction<Company | null>>;
  companies: Company[];
  handleCompanyChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

// Create the context with a default null value, typed as CompanyContextType or null
export const CompanyContext = createContext<CompanyContextType | null>(null);

// 3. Define the props for the CompanyProvider
interface CompanyProviderProps {
  children: ReactNode; // 'ReactNode' covers anything React can render
  initialCompanies: Company[]; // 'initialCompanies' is an array of 'Company' objects
}

// Create a provider component
export const CompanyProvider = ({ children, initialCompanies }: CompanyProviderProps) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(() => {
    // Try to get the company from localStorage on initial load
    const savedCompany = localStorage.getItem('selectedCompany');
    try {
      return savedCompany ? JSON.parse(savedCompany) : null;
    } catch (error) {
      console.error("Error parsing saved company from localStorage:", error);
      return null; // Return null if parsing fails
    }
  });

  // Ensure companies state is typed as an array of Company objects
  const [companies, setCompanies] = useState<Company[]>(initialCompanies || []);

  // Update localStorage whenever selectedCompany changes
  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
    } else {
      localStorage.removeItem('selectedCompany');
    }
  }, [selectedCompany]);

  // If companies are loaded asynchronously, you might update them here
  useEffect(() => {
    // Only set a default if initialCompanies are available and no company is selected yet
    if (initialCompanies && initialCompanies.length > 0 && !selectedCompany) {
      // Set the first company as default if nothing is selected yet
      setSelectedCompany(initialCompanies[0]);
    }
  }, [initialCompanies, selectedCompany]); // Depend on initialCompanies to react to changes

  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const companyCode = event.target.value;
    const company = companies.find(c => c.code === companyCode);
    setSelectedCompany(company || null); // Ensure it's Company or null
  };

  // The value prop is now correctly typed as CompanyContextType
  return (
    <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany, companies, handleCompanyChange }}>
      {children}
    </CompanyContext.Provider>
  );
};

// Custom hook for easier consumption
export const useCompany = () => {
  // Ensure the context is typed correctly when consumed
  const context = useContext(CompanyContext);
  if (!context) {
    // This error will be thrown if useCompany is called outside of a CompanyProvider
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
