import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

type Navigate = ReturnType<typeof useNavigate>;

export const logoutUser = async (navigate?: Navigate) => {
  try {
    await signOut(auth);
    Cookies.remove("jwt", { path: "/" });

    localStorage.setItem(
      "logoutReason",
      "Sesión vencida. Por favor iniciá sesión nuevamente."
    );

    if (navigate) {
      // Usado dentro de React components
      navigate("/", { replace: true });
    } else {
      // Usado fuera del router
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
