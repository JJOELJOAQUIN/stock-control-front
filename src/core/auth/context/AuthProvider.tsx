import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
  type User,
} from "firebase/auth";
import { store } from "@/core/store/store";
import { baseApi } from "@/core/api/baseApi";

console.log("AUTH MODE:", import.meta.env.VITE_AUTH_MODE);
console.log("API URL:", import.meta.env.VITE_API_URL);

type Roles = string[];

type AppRole = "ADMIN" | "USER" | "COSMETOLOGA" | "PENDING";

interface BackendUser {
  id: string;
  firebaseUid: string;
  email: string;
  role: AppRole;
  enabled: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  checkingAuth: boolean;
  roles: Roles;
}

interface AuthContextType {
  authState: AuthState;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Bypass de autenticación en local: cuando VITE_AUTH_MODE === "dev", el front
// NO pasa por Firebase y consulta directo /api/auth/me, que el filtro dev del
// backend (DevAdminAuthenticationFilter) autentica como dev-admin.
const DEV_AUTH = import.meta.env.VITE_AUTH_MODE === "dev";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [_, loading] = useAuthState(auth);

  // Cache de RTK Query vs. cambio de usuario. El logout navega con
  // react-router (sin recargar la página), así que el store de Redux
  // sobrevive al cambio de sesión: si entra Gise después de Pili, sus
  // queries tienen la misma cache key y RTK le sirve al instante los datos
  // del usuario anterior — la caja entera de Pili en la pantalla de Gise,
  // aunque el backend haya filtrado bien. Por eso, cuando cambia el uid
  // autenticado, se tira TODO el caché de la API.
  //
  // El guard por uid es necesario porque onIdTokenChanged también dispara
  // en cada refresh de token (~1 hora) con el mismo usuario, y ahí resetear
  // sería tirar el caché al pedo.
  const lastUidRef = useRef<string | null | undefined>(undefined);

  const resetApiCacheOnUserChange = (uid: string | null) => {
    if (lastUidRef.current !== uid) {
      lastUidRef.current = uid;
      store.dispatch(baseApi.util.resetApiState());
    }
  };

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    checkingAuth: true,
    roles: [],
  });

  useEffect(() => {
    // ── Rama DEV: saltea Firebase, resuelve el usuario desde el backend. ──
    if (DEV_AUTH) {
      (async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/me`
          );
          if (!response.ok) throw new Error("dev /me failed");

          const backendUser: BackendUser = await response.json();

          setAuthState({
            isAuthenticated: true,
            user: null, // no hay User de Firebase en dev
            checkingAuth: false,
            roles: [backendUser.role],
          });
        } catch (error) {
          console.error("Dev auth error:", error);
          setAuthState({
            isAuthenticated: false,
            user: null,
            checkingAuth: false,
            roles: [],
          });
        }
      })();
      return; // no registramos el listener de Firebase en dev
    }

    // ── Rama PRODUCCIÓN: flujo original con Firebase (sin cambios). ──
    const unsub = onIdTokenChanged(auth, async (firebaseUser) => {
      resetApiCacheOnUserChange(firebaseUser?.uid ?? null);

      if (!firebaseUser) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          checkingAuth: false,
          roles: [],
        });
        return;
      }

      try {
        const token = await firebaseUser.getIdToken(true);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch authenticated user");
        }

        const backendUser: BackendUser = await response.json();

        setAuthState({
          isAuthenticated: true,
          user: firebaseUser,
          checkingAuth: false,
          roles: [backendUser.role],
        });
      } catch (error) {
        console.error(error);

        setAuthState({
          isAuthenticated: false,
          user: null,
          checkingAuth: false,
          roles: [],
        });
      }
    });

    return () => unsub();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    if (DEV_AUTH) {
      // En dev el login por formulario no aplica; ya estás autenticado.
      return;
    }
    setAuthState((s) => ({ ...s, checkingAuth: true }));
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (DEV_AUTH) {
      resetApiCacheOnUserChange(null);
      setAuthState({
        isAuthenticated: false,
        user: null,
        checkingAuth: false,
        roles: [],
      });
      return;
    }
    await signOut(auth);
    setAuthState({
      isAuthenticated: false,
      user: null,
      checkingAuth: false,
      roles: [],
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        loginWithEmail,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return ctx;
};