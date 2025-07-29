import useSWR from "swr";
import { AppRoutes } from "../../routes/approutes";
import { useEffect, useState } from "react";
import { CompanyProvider } from "../../context/routerContext";

const { VITE_API_URL } = import.meta.env;

export interface CurrentPathname {
  name: string;
}

interface RoutesProps {
  isLogged: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Layout: React.FC<RoutesProps> = () => {
  const [pathnameLocation, setCurrentPathname] = useState<CurrentPathname>({ name: '' });

  useEffect(() => {
    setCurrentPathname({ name: window.location.pathname });
  }, []);

  const { data, error, isLoading } = useSWR(`${VITE_API_URL}/api/companies/all`, fetcher);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data) {
      setCompanies(data);
      setLoading(false);
    }
  }, [data]);

  // Fix: Return null or a loading component
  if (loading) {
    console.log("Loading companies..."); // This line is fine for logging
    return null; // Return null while loading
  }

  // You might also want to handle the error state
  if (error) {
    console.error("Failed to load companies:", error);
    return <div>Error loading companies.</div>; // Or some error component
  }

  return (
    <CompanyProvider initialCompanies={companies}>
      <main className="w-full relative scroll-smooth">
        <AppRoutes pathnameLocation={pathnameLocation} companies={companies} />
      </main>
    </CompanyProvider>
  );
};

export default Layout;