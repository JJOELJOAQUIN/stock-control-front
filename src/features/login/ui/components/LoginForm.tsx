import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { Label } from "@radix-ui/react-label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/core/auth/context/AuthProvider";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithEmail, loginWithGoogle } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await loginWithEmail(email, password);
      toast.success("¡Inicio de sesión exitoso!", { duration: 2500 });
      navigate("/inicio");
    } catch {
      toast.error("Credenciales incorrectas", { duration: 2500 });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success("Sesión iniciada con Google", { duration: 2500 });
      navigate("/inicio");
    } catch {
      toast.error("No se pudo iniciar sesión con Google", { duration: 2500 });
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Card className="h-screen w-full flex flex-col items-center justify-center bg-card dark:bg-card/90 shadow-lg border-none rounded-none">
        <img
          src="/logo_rosarosa-01.PNG"
          alt="Logo"
          className="max-w-64 mx-auto mb-6"
        />

        <CardContent className="w-full max-w-sm space-y-4">
          {/* GOOGLE */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            Continuar con Google
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            o ingresá con email
          </div>

          {/* EMAIL */}
          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tuemail@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-button-gradient text-white"
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
