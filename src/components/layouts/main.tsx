import { AppRoutes } from "../../routes/approutes";
import { useEffect, useState } from "react";
export interface CurrentPathname {
  name: string;
}

interface NavbarProps {
  isLogged: boolean;
}

const Layout: React.FC<NavbarProps> = () => {
  const [pathnameLocation, setCurrentPathname] = useState<CurrentPathname>({ name: '' });
  useEffect(() => {
    setCurrentPathname({ name: window.location.pathname });
  }, []);

  return (
    <main className="w-full relative scroll-smooth">
      <AppRoutes pathnameLocation={pathnameLocation}/>
    </main>
  );
}

export default Layout;
