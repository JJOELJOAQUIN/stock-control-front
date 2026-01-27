import { useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { smartLogout } from "../helper/smartLogout";

interface DecodedToken {
  exp: number;
}

export const useJwtWatcher = (
  navigate: (path: string, opts?: { replace?: boolean }) => void,
  setCheckingAuth?: (val: boolean) => void
) => {
  const validateToken = () => {
    const jwt = Cookies.get("jwt");
    if (!jwt) {
      setCheckingAuth?.(false);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(jwt);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        console.warn("Token expirado detectado.");
        smartLogout(navigate);
      } else {
        setCheckingAuth?.(false);
      }
    } catch (err) {
      console.error("Token inválido o manipulado:", err);
      smartLogout(navigate);
    }
  };

  useEffect(() => {
    validateToken();
    const interval = setInterval(validateToken, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        validateToken();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);
};
