import { useEffect, useState } from "react";
import { getMainRoutesForRole, getUserRoles } from "../../routes/routesConfig";
import { UserProfile } from "../../context/userProfileContext";
import Images from "../../assets";
import { LogOut, Menu, User, X } from "lucide-react";
import LanguageSwitcher from "../buttons/languageSwitcher";
import useUser from "../../hook/useUser";

interface CurrentPathname {
  name: string;
}

interface AdminNavbarProps {
  currentPathname: CurrentPathname;
  isLogged: boolean;
  profile: UserProfile | null;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({
  currentPathname,
  profile,
}) => {
  const { logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userRoles = profile?.roles ? getUserRoles(profile) : ["user"];
  const filteredNavLinks: { href: string; name: string; icon?: React.ReactNode }[] =
    userRoles.flatMap((role: string) =>
      getMainRoutesForRole(
        role as "user" | "super_admin" | "admin" | "moderator"
      ).map((route: any) => ({
        href: typeof route === "string" ? route : route.href,
        name: typeof route === "string" ? route : route.name,
        icon: typeof route === "string"
          ? undefined
          : route.icon
            ? <route.icon />
            : undefined,
      }))
    ) || [];
  useEffect(() => {
    const navbar = document.getElementById("navbar");

    const handleScroll = () => {
      if (window.scrollY > 0) {
        navbar?.classList.add("scrolled");
      } else {
        navbar?.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);

    const openButton = document?.getElementById("open-menu");
    const side = document?.getElementById("sidebar");
    const hiddenrelative = document?.getElementById("hidden-relative");

    if (!openButton) return;
    const openMenu = () => {
      document.body.classList.add("overflow-hidden");
      side?.classList.remove("invisible", "translate-x-full", "hidden");
      hiddenrelative?.classList.remove("relative");
    };
    openButton.addEventListener("click", openMenu);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      openButton.removeEventListener("click", openMenu);
    };
  }, []);
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"; // Bloquea el scroll del body
    } else {
      document.body.style.overflow = ""; // Restaura el scroll del body
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = ""; // Limpieza al desmontar
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]); // Se ejecuta cada vez que isMenuOpen cambia

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav
      id="navbar"
      className={`w-full flex justify-center h-12 md:h-16 z-20 mb-2 ${
        currentPathname.name === "/"
          ? ""
          : "bg-gradient-to-r from-white via-white/80 to-white/90 border-b-2 border-black/20"
      }`}
    >
      <div className="max-w-7xl mx-auto main-content w-full px-6 md:px-5 flex justify-between h-12 md:h-16 items-center *:text-black">
        <div className="flex *:px-4 items-center h-full">
          <div className="flex items-center space-x-2">
            <img
              src={Images?.logo || "#"}
              alt="logo"
              width={50}
              height={50}
              className="p-1"
            />
          </div>
          {filteredNavLinks.length > 0 ? (
            filteredNavLinks.map((link, index) => (
              <div key={index}>
                <a
                  href={link.href}
                  className="hidden md:block hover:text-yellow-700 text-sm font-bold h-full duration-500 select-none uppercase tracking-wider"
                >
                  {link.name}
                </a>
              </div>
            ))
          ) : (
            <span className="text-lg text-gray-500">
              No tienes acceso a ninguna ruta
            </span>
          )}
        </div>

        <div className=" md:flex justify-center">
          <LanguageSwitcher className={"hidden"} />
          <div className=" flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded={isMenuOpen ? "true" : "false"}
            >
              <span className="sr-only">
                {isMenuOpen ? "Cerrar menú principal" : "Abrir menú principal"}
              </span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        {/* slide bar */}
        <div
          className={`fixed inset-0 h-screen bg-black/50 z-40 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={closeMenu}
          aria-hidden={!isMenuOpen}
        ></div>
        <div
          className={`fixed top-0 right-0 h-screen w-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:w-1/4
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal"
        >
          <div className="flex justify-between p-4">
            <div className="flex items-center space-x-2">
              <img
                src={Images?.logo || "#"}
                alt="logo"
                width={50}
                height={50}
                className="border-r-2 pr-2"
              />
              <span className="text-yellow-700 font-bold tracking-wider">
                Flow
              </span>
            </div>
            <button
              onClick={closeMenu}
              className="text-gray-700 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100"
              aria-label="Cerrar menú"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="px-4 pb-3 space-y-1">

            {filteredNavLinks.length > 0 ? (
              filteredNavLinks.map((link, index) => (
                <div key={index} className="px-2 py-2 space-x-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer">
                  {link.icon}
                  <a
                    href={link.href}
                    className="hidden md:block hover:text-yellow-700 text-sm font-bold h-full duration-500 select-none uppercase tracking-wider"
                  >
                    {link.name}
                  </a>
                </div>

              ))
            ) : (
              <span className="text-lg text-gray-500">
                No tienes acceso a ninguna ruta
              </span>
            )}
            <hr/>
            <div className="px-2 py-2 space-x-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer">
              <User className="h-4 w-4 text-gray-600" />
              <span className="font-sm text-sm">{profile?.username || 'user'}</span>
            </div>
            
            <button className="w-full px-2 py-2 space-x-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={() => { logout()}}>
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>

            <div className="block px-0 py-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
