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

type Roles = string[];

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [_, loading] = useAuthState(auth);

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    checkingAuth: true,
    roles: [],
  });

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          checkingAuth: false,
          roles: [],
        });
        return;
      }

      setAuthState({
        isAuthenticated: true,
        user: firebaseUser,
        checkingAuth: false,
        roles: [],
      });
    });

    return () => unsub();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setAuthState((s) => ({ ...s, checkingAuth: true }));
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
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