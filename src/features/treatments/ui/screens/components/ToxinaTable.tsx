import { ListX, Syringe, AlertTriangle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Empty } from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { sessionByNumber, type ToxinaSession, type ToxinaTreatment } from "../models/toxina";

type Props = {
  treatments: ToxinaTreatment[];
  isLoading: boolean;
  canRegister: boolean;
  onSecondSession: (treatment: ToxinaTreatment) => void;
};

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

function daysSince(iso?: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const ms = Date.now() - d.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Tabla de toxina: unidades y FECHA de cada sesión, más el aviso cuando pasan
 * 10 días de la 1ª sin haber hecho la 2ª (el vial vence a los 20; a los 10 ya
 * conviene agendar). El aviso se apaga solo cuando se carga la 2ª sesión.
 */
export function ToxinaTable({ treatments, isLoading, canRegister, onSecondSession }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Paciente</TableHead>
            <TableHead className="font-semibold">1ª sesión</TableHead>
            <TableHead className="font-semibold">2ª sesión</TableHead>
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
              const days = s1 && !s2 ? daysSince(s1.performedAt) : null;
              const overdue = days != null && days >= 10;

              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.patientName}</TableCell>

                  <TableCell>
                    <SessionCell session={s1} />
                    {overdue && (
                      <Badge
                        variant="outline"
                        className="mt-1 gap-1 border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      >
                        <AlertTriangle className="size-3" />
                        Pasaron {days} días — hacer 2ª sesión
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <SessionCell session={s2} />
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

function SessionCell({ session }: { session?: ToxinaSession }) {
  if (!session) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-col">
      <span className="font-medium">{session.unitsUsed} U</span>
      <span className="text-xs text-muted-foreground">{formatDate(session.performedAt)}</span>
    </div>
  );
}