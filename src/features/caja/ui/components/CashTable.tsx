import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { CashMovementResponse, PageResponse } from "../../types/cash.types";

/*
  Reemplazá este wrapper por tu TableWrapper real si ya lo tienen:
  import { TableWrapper } from "...";
*/

type Props = {
  data?: PageResponse<CashMovementResponse>;
  isLoading: boolean;
  page: number;
  setPage: (value: number) => void;
};

export function CashTable({ data, isLoading, page, setPage }: Props) {
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
    <section className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Bruto</TableHead>
              <TableHead className="text-right">Retención</TableHead>
              <TableHead className="text-right">Neto</TableHead>
              <TableHead className="text-right">Médica</TableHead>
              <TableHead className="text-right">Cosmetóloga</TableHead>
              <TableHead>Comentario</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.content?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      item.type === "OUT"
                        ? "bg-red-100 text-red-700 border-red-200"
                        : "bg-emerald-100 text-emerald-700 border-emerald-200"
                    }
                  >
                    {item.type}
                  </Badge>
                </TableCell>

                <TableCell>{item.source}</TableCell>
                <TableCell>{item.paymentMethod}</TableCell>

                <TableCell className="text-right">
                  ${Number(item.amount).toLocaleString()}
                </TableCell>

                <TableCell className="text-right">
                  ${Number(item.retention).toLocaleString()}
                </TableCell>

                <TableCell className="text-right font-semibold">
                  ${Number(item.netAmount).toLocaleString()}
                </TableCell>

                <TableCell className="text-right">
                  {item.doctorShare != null
                    ? `$${Number(item.doctorShare).toLocaleString()}`
                    : "-"}
                </TableCell>

                <TableCell className="text-right">
                  {item.cosmetologistShare != null
                    ? `$${Number(item.cosmetologistShare).toLocaleString()}`
                    : "-"}
                </TableCell>

                <TableCell>{item.comment || "-"}</TableCell>
              </TableRow>
            ))}

            {!data?.content?.length && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No hay movimientos de caja
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
    </section>
  );
}