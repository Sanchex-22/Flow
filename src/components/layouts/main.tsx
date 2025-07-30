import useSWR from "swr";
import { AppRoutes } from "../../routes/approutes";
import { useEffect, useState } from "react";
import { CompanyProvider, useCompany } from "../../context/routerContext";

const { VITE_API_URL } = import.meta.env;

export interface CurrentPathname {
  name: string;
}

interface RoutesProps {
  isLogged: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fallbackCompanies = [
  {
    id: "na",
    name: "N/A",
    address: "N/A",
    phone: "N/A",
    email: "N/A",
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const Layout: React.FC<RoutesProps> = () => {
  const [pathnameLocation, setCurrentPathname] = useState<CurrentPathname>({ name: '' });
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setCurrentPathname({ name: window.location.pathname });
  }, []);

  const {
    data,
    error,
    isValidating,
  } = useSWR(`${VITE_API_URL}/api/companies/all`, fetcher, {
    fallbackData: fallbackCompanies,
    revalidateOnFocus: true,
    shouldRetryOnError: true,
    errorRetryInterval: 5000, // Reintenta cada 5 segundos
    errorRetryCount: 10,      // Máximo 10 intentos (puedes quitarlo para infinito)
  });

  useEffect(() => {
    if (error) {
      console.error("Error al cargar compañías:", error);
      setShowError(true);
    } else if (data && data[0]?.id !== "na") {
      setShowError(false); // Oculta el error si ya hay datos reales
    }
  }, [error, data]);

  const companies = data || fallbackCompanies;

  return (
    <CompanyProvider initialCompanies={companies}>
      <main className="w-full relative scroll-smooth">
        {showError && (
          <div className="fixed top-5 right-5 bg-yellow-300 text-black p-4 rounded shadow-lg z-50">
            ⚠️ No se pudieron cargar las compañías. Usando datos por defecto. Reintentando...
          </div>
        )}
        <AppRoutes pathnameLocation={pathnameLocation} companies={companies} />
      </main>
    </CompanyProvider>
  );
};

export default Layout;
