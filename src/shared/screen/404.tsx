import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Silk from "@/features/login/ui/components/Silk";

export default function NotFound404() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      {/* Columna izquierda */}
      <div className="w-1/2 flex justify-center">
        <Card className="w-full max-w-md border border-border shadow-lg bg-card ">
          <CardContent className="py-10 flex flex-col items-center text-center space-y-6">
            <div className="">
              <img
                src="/audifarm_logo.png"
                alt="Logo"
                className="max-w-64 mx-auto mb-4"
              />
            </div>

            <h1 className="text-4xl font-bold text-foreground">404</h1>
            <p className="text-muted-foreground text-sm">
              No pudimos encontrar la página solicitada.
            </p>

            <Button
              className="mt-4 w-full cursor-pointer bg-[linear-gradient(90deg,#da291c_3.17%,#b52217_100%)]"
              onClick={() => navigate("/inicio")}
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha */}
      <div className="w-1/2 h-full">
        <Silk color="#E20613" speed={3} noiseIntensity={1}>
          <img
            src="/audifarm_logo_full_white.svg"
            className="max-w-lg "
            alt="logo"
          />
        </Silk>
      </div>
    </div>
  );
}
