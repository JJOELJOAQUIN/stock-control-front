// core/auth/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
  type User,
} from "firebase/auth";
import { useCookies } from "react-cookie";
import Cookies from "js-cookie";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  checkingAuth: boolean;
  role?: string;
}

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean; // loading inicial de firebase-hook
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_NAME = "jwt";
const COOKIE_PATH = "/";
const isProd =
  typeof window !== "undefined" && window.location.protocol === "https:";

function setJwtCookie(setCookie: any, token: string, expirationTime: string) {
  setCookie(COOKIE_NAME, token, {
    path: COOKIE_PATH,
    expires: new Date(expirationTime),
    secure: isProd,
    sameSite: "strict",
  });
}

function removeJwtCookie(removeCookie: any) {
  removeCookie(COOKIE_NAME, { path: COOKIE_PATH });
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [_, loading] = useAuthState(auth); // estado inicial de firebase
  const [, setCookie, removeCookie] = useCookies([COOKIE_NAME]);

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    checkingAuth: true, // arranca chequeando
  });

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        removeJwtCookie(removeCookie);
        setAuthState({
          isAuthenticated: false,
          user: null,
          checkingAuth: false,
          role: "",
        });
        return;
      }

      // todavía no tenemos claims → seguimos en checking
      setAuthState((prev) => ({ ...prev, checkingAuth: true }));

      const idTokenResult = await firebaseUser.getIdTokenResult(true);
      const { token, expirationTime, claims } = idTokenResult;

      setJwtCookie(setCookie, token, expirationTime);

      setAuthState({
        isAuthenticated: true,
        user: firebaseUser,
        checkingAuth: false, // ✅ listo, ya resolvió
        role: (claims.role as string | undefined)?.toUpperCase() || "",
      });
    });

    return () => unsub();
  }, [removeCookie, setCookie]);

  const login = async (email: string, password: string) => {
    setAuthState((s) => ({ ...s, checkingAuth: true }));
    await signInWithEmailAndPassword(auth, email, password);
    // no seteamos nada más, onIdTokenChanged se encarga
  };

  const logout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("jwt", { path: "/" });
      localStorage.setItem(
        "logoutReason",
        "Sesión vencida. Por favor iniciá sesión nuevamente."
      );
      setAuthState({
        isAuthenticated: false,
        user: null,
        checkingAuth: false,
        role: "",
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return ctx;
};
