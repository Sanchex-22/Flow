import { useEffect, useState } from "react";

export interface CurrentPathname {
  name: string;
}

/**
 * Devuelve el pathname completo y el pageName
 */
export const usePageName = () => {
  const [pathnameLocation, setPathnameLocation] =
    useState<CurrentPathname>({ name: "" });

  const [pageName, setPageName] = useState("");

  useEffect(() => {
    const pathname = window.location.pathname;

    setPathnameLocation({ name: pathname });
    setPageName(pathname.split("/")[2] || "");
  }, []);

  return {
    pathnameLocation,
    pageName,
  };
};
