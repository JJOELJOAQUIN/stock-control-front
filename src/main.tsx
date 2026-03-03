import { createRoot } from "react-dom/client";
import "./index.css";


import { CookiesProvider } from "react-cookie";
import { AuthProvider } from "./core/auth/context/AuthProvider";
import { Provider } from "react-redux";
import { store } from "./core/store/store";

import App from "./App";
import { Toaster } from "sonner";
import { ThemeProvider } from "./core/context/theme-provider";
import { BusinessProvider } from "./core/context/business-context";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <CookiesProvider>
      <AuthProvider>
        <Provider store={store}>
          <BusinessProvider>
            <App />
          </BusinessProvider>
          <Toaster closeButton richColors position="top-right" />
        </Provider>
      </AuthProvider>
    </CookiesProvider>
  </ThemeProvider>
);
