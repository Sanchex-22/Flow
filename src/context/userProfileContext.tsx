// UserProfileContext.tsx
import React, { ReactNode, useState, useMemo } from 'react';
import { decodeTokenPublic } from '../utils/decode';
import { authServices } from '../actions/authentication';

// Interfaz para los metadatos decodificados
export type DecodedMetaData = {
  id: string;
  username?: string;
  email?: string;
  roles?: string;
}

// Perfil de usuario que manejará el contexto
export type UserProfile =  {
  id: string;
  username?: string;
  email?: string;
  roles?: string;
}

// Valor que maneja el contexto
export type UserProfileContextValue = {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

// Crear contexto con valor inicial undefined
const UserProfileContext = React.createContext<UserProfileContextValue | undefined>(undefined);

// Props del provider
export type UserProfileProviderProps = {
  children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  // Obtener el JWT desde localStorage (o donde esté guardado)
  const [jwt] = useState<string | null>(() => {
    const currentUser = authServices.getCurrentUser();
    return currentUser ? JSON.stringify(currentUser) : null;
  });
  const metaData = useMemo<DecodedMetaData | null>(() => {
    const decoded = decodeTokenPublic(jwt);
    if (decoded && typeof decoded === 'object' && 'id' in decoded) {
      return {
        id: (decoded as any).id,
        username: (decoded as any).username,
        email: (decoded as any).email,
        roles: (decoded as any).roles,
      };
    }
    return null;
  }, [jwt]);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (!metaData) return null;
    console.log("Decoded MetaData:", metaData.roles);
    return {
      id: metaData.id,
      username: metaData.username ?? 'n/a',
      email: metaData.email ?? 'n/a',
      roles: metaData.roles ?? 'user'
    };
  });
  return (
    <UserProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export default UserProfileContext;
