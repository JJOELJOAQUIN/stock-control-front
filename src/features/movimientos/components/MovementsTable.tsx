import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import type { PageResponse, StockMovementItem } from "../ui/types/movements.types";


type Props = {
  data?: PageResponse<StockMovementItem>;
  isLoading: boolean;
  page: number;
  setPage: (value: number) => void;
};

export function MovementsTable({ data, isLoading, page, setPage }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Contexto</TableHead>
              <TableHead>Comentario</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.content?.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  {new Date(movement.createdAt).toLocaleString()}
                </TableCell>

                <TableCell>
                  <Badge variant={movement.type === "OUT" ? "destructive" : "default"}>
                    {movement.type}
                  </Badge>
                </TableCell>

                <TableCell>{movement.reasonType}</TableCell>

                <TableCell className="text-right font-semibold">
                  {movement.quantity}
                </TableCell>

                <TableCell>{movement.context}</TableCell>

                <TableCell>{movement.comment || "-"}</TableCell>
              </TableRow>
            ))}

            {!data?.content?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay movimientos para los filtros seleccionados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {data.number + 1} de {Math.max(data.totalPages, 1)} · {data.totalElements} resultados
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={data.first}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={data.last}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}