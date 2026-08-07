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
  const { loginWithEmail } = useAuth();

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

  return (
    <div className="w-full min-h-screen md:h-screen flex items-center justify-center p-4 md:p-0">
      <Card className="min-h-screen md:h-screen w-full flex flex-col items-center justify-center bg-card dark:bg-card/90 shadow-lg border-none rounded-none md:rounded-none">
        <img
          src="/logo_nuevo.png"
          alt="Logo"
          className="max-w-40 md:max-w-64 mx-auto mb-6"
        />

        <CardContent className="w-full max-w-sm space-y-4">
          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tuemail@ejemplo.com"
                required
                className="text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="text-foreground"
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
              className="w-full bg-[linear-gradient(90deg,#B2967D_0%,#8B6E5A_100%)] text-[#4A342A] shadow-md transition-all hover:brightness-95 dark:bg-[linear-gradient(90deg,#B2967D_0%,#8B6E5A_100%)] dark:text-[#4A342A] dark:hover:brightness-95"
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}