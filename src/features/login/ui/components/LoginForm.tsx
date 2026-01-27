import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { Label } from "@radix-ui/react-label";

import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../../core/auth/context/AuthProvider";
import { toast } from "sonner";
import { Card, CardContent } from "../../../../shared/components/ui/card";
import { Input } from "../../../../shared/components/ui/input";
import { Button } from "../../../../shared/components/ui/button";

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);

      toast.success("¡Inicio de sesión exitoso!", {
        duration: 2500,
      });

      navigate("/inicio");
    } catch (err) {
      toast.error("Credenciales incorrectas", {
        duration: 2500,
      });
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Card
        className="
          h-screen w-full flex flex-col items-center justify-center
          bg-card dark:bg-card/90 shadow-lg border-none rounded-none
        "
      >
        <img
          src="/logo_rosarosa-01.PNG"
          alt="Logo"
          className="max-w-64 mx-auto mb-4"
        />

        <CardContent className="w-full max-w-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="bg-background border-border text-foreground pr-10"
                placeholder="tuemail@ejemplo.com"
                required
              />
            </div>

            {/* Password + Toggle */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Contraseña
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="bg-background border-border text-foreground pr-10"
                  placeholder="••••••••"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón */}
            <Button
              type="submit"
              className="
    w-full
    bg-button-gradient
    text-white
    font-medium
    transition-all
    hover:brightness-110
    active:scale-[0.98]
  "
            >
              Entrar
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
