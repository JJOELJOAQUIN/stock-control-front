import { AlertTriangle, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { OpenVialAlert } from "../models/toxina";

type Props = {
  vials: OpenVialAlert[];
};

/**
 * Aviso de viales de toxina abiertos y por vencer (día 10 de 20). Cuelga del
 * endpoint GET /api/alerts/open-vials; el mensaje ya viene armado del backend
 * con fecha de vencimiento, unidades restantes y pacientes.
 */
export function OpenVialsCard({ vials }: Props) {
  if (vials.length === 0) return null;

  return (
    <Card className="border-amber-300 bg-amber-50/60 dark:border-amber-800/60 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-amber-900 dark:text-amber-200">
          <AlertTriangle className="size-4" />
          Viales abiertos por vencer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {vials.map((v, i) => (
          <div
            key={`${v.productId}-${i}`}
            className="flex items-start gap-2 rounded-md bg-amber-100/60 p-2 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
          >
            <Clock className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">{v.productName}</p>
              <p className="text-xs">{v.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}