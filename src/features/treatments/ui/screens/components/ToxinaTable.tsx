import { ListX, Syringe } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Empty } from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { sessionByNumber, type ToxinaTreatment } from "../models/toxina";

type Props = {
  treatments: ToxinaTreatment[];
  isLoading: boolean;
  canRegister: boolean;
  onSecondSession: (treatment: ToxinaTreatment) => void;
};

/**
 * Tabla de toxina: sólo unidades por sesión y la acción de 2ª sesión.
 * Sin pendiente ni acción de pago (el cobro va en el alta o en la 2ª sesión).
 */
export function ToxinaTable({ treatments, isLoading, canRegister, onSecondSession }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Paciente</TableHead>
            <TableHead className="text-center font-semibold">1ª sesión (U)</TableHead>
            <TableHead className="text-center font-semibold">2ª sesión (U)</TableHead>
            {canRegister && <TableHead className="text-right font-semibold">Acción</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={`sk-${i}`}>
                <TableCell colSpan={canRegister ? 4 : 3}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && treatments.length === 0 && (
            <TableRow>
              <TableCell colSpan={canRegister ? 4 : 3}>
                <Empty>
                  <ListX className="size-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Todavía no registraste toxina</p>
                </Empty>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            treatments.map((t) => {
              const s1 = sessionByNumber(t, 1);
              const s2 = sessionByNumber(t, 2);
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.patientName}</TableCell>
                  <TableCell className="text-center">
                    {s1 ? s1.unitsUsed : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {s2 ? s2.unitsUsed : "—"}
                  </TableCell>
                  {canRegister && (
                    <TableCell className="text-right">
                      {!s2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => onSecondSession(t)}
                        >
                          <Syringe className="size-4" />
                          2ª sesión
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}