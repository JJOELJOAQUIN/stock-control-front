import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import Cookies from "js-cookie";

export const smartLogout = async (
  navigate?: (path: string, options?: { replace?: boolean }) => void
) => {
  try {
    await signOut(auth);
    Cookies.remove("jwt", { path: "/" });

    localStorage.setItem(
      "logoutReason",
      "Sesión vencida. Por favor iniciá sesión nuevamente."
    );

    if (typeof navigate === "function") {
      try {
        navigate("/", { replace: true }); // con opción de reemplazo
      } catch (err) {
        console.warn("Fallback a window.location.href (navigate falló):", err);
        window.location.href = "/";
      }
    } else {
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Error en smartLogout:", error);
  }
};
