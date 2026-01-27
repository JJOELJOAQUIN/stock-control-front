import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import { useMemo } from "react";

export interface FirebaseTokenPayload {
  user_id: string;
  email: string;
  exp: number;
  iat: number;
  name?: string;
  role?: string;
}

export const useDecodedJwt = (): FirebaseTokenPayload | null => {
  const [cookies] = useCookies(["jwt"]);
  const token = cookies.jwt;

  const decoded = useMemo(() => {
    if (!token) return null;

    try {
      const payload = jwtDecode<FirebaseTokenPayload>(token);
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        console.warn("JWT expirado");
        return null;
      }
      return payload;
    } catch (error) {
      console.error("Error al decodificar JWT:", error);
      return null;
    }
  }, [token]);

  return decoded;
};


export const useUserName = (): string => {
  const decodedJwt = useDecodedJwt();

  const splitName = decodedJwt?.name?.split(" ") || [];
  const firstName = splitName[0] || "Usuario";

  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};
