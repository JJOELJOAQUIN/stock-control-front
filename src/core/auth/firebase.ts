import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Persistencia de SESIÓN (no LOCAL): la sesión vive mientras la pestaña/
// navegador esté abierto. Al cerrar el navegador, se borra — así no queda
// la sesión de una usuaria abierta para la siguiente que use la misma PC.
//
// Firebase por defecto usa browserLocalPersistence, que sobrevive días
// renovando el token solo; por eso la Dra volvía al otro día y seguía
// adentro. Con SESSION eso ya no pasa.
//
// Es una promesa que resuelve async; se dispara al importar el módulo, antes
// de cualquier login. Si falla (navegador sin storage), se loguea y sigue.
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("No se pudo configurar la persistencia de sesión:", error);
});

export { auth };