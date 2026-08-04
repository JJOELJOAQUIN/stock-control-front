import { useEffect, useRef } from "react";

/**
 * Desloguea al usuario tras un período sin interacción. Cubre el caso de la
 * PC compartida del consultorio: la Dra deja la sesión abierta y se va; a las
 * 2 horas sin tocar nada, la app la saca sola, así la siguiente persona no
 * entra con la sesión de otra.
 *
 * Se apoya en el logout que ya existe (useAuth().logout), que limpia el
 * estado y el caché de RTK Query. Sólo agrega el temporizador.
 *
 * El timer se reinicia con cualquier señal de actividad (mouse, teclado,
 * touch, scroll). Un throttle con ref evita reprogramar el timeout en cada
 * pixel de movimiento del mouse.
 */

const DEFAULT_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 horas

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
];

export function useInactivityLogout(
  isAuthenticated: boolean,
  onTimeout: () => void,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
) {
  // Guardamos onTimeout en un ref para no re-registrar los listeners cada vez
  // que el padre re-renderiza y pasa una función nueva.
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetRef = useRef<number>(0);

  useEffect(() => {
    // Sólo corre con sesión activa. Si no hay sesión, no hay nada que expirar.
    if (!isAuthenticated) return;

    const clear = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    const arm = () => {
      clear();
      timerRef.current = setTimeout(() => {
        onTimeoutRef.current();
      }, timeoutMs);
    };

    // Throttle: como mucho reprograma una vez por segundo, no en cada evento.
    const onActivity = () => {
      const now = Date.now();
      if (now - lastResetRef.current < 1000) return;
      lastResetRef.current = now;
      arm();
    };

    arm(); // arranca el reloj al montar / al loguearse
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity));

    return () => {
      clear();
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
    };
  }, [isAuthenticated, timeoutMs]);
}