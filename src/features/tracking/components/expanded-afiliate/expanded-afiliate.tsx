import { useEffect, useState } from "react";
import { useAfiliadoOrders } from "../../services/useAfiliadosOrders";

import { Badge } from "@/shared/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";


import useModal from "@/shared/hooks/use-modal";

import type { Order } from "../../models/afiliate";
import DeliveryNotes from "../order-tracker/DeliveryNote/delivery-notes";

interface Props {
  id: string;
}

function ExpandedAfiliate({ id }: Props) {
  const { fetchOrders, data, isLoading, isError } = useAfiliadoOrders();
  const { open, openModal, closeModal } = useModal();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders(id);
  }, [id]);

  const orders: Order[] = data?.orders ?? [];

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    openModal();
  };

  return (
    <div className="p-2 grid grid-cols-1 gap-4 text-sm">
      <h3 className="text-md font-bold text-center">Ordenes de venta</h3>

      <Table className="border">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">N° OV</TableHead>
            <TableHead className="font-semibold">N° Remito</TableHead>
            <TableHead className="font-semibold">Fecha OV</TableHead>
            <TableHead className="font-semibold">Fecha Remito</TableHead>
            <TableHead className="font-semibold">Parcial</TableHead>
            <TableHead className="font-semibold">Estado</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="py-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin inline-block text-muted-foreground" />
              </TableCell>
            </TableRow>
          )}

          {isError && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-6 text-center text-destructive flex items-center justify-center gap-2"
              >
                <AlertCircle className="h-5 w-5" />
                Error al obtener pedidos
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && orders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-6 text-center text-muted-foreground"
              >
                No hay pedidos disponibles
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !isError &&
            orders.map((order) => (
              <TableRow
                key={order.nro_ov}
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => handleRowClick(order)}
              >
                <TableCell className="font-mono text-sm">
                  {order.nro_ov}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {order.nro_remito}
                </TableCell>
                <TableCell>{order.fecha_ov?.slice(0, 10)}</TableCell>
                <TableCell>{order.fecha_remito?.slice(0, 10)}</TableCell>
                <TableCell>{order.arma_parcial}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.estado_pedido === "DISPENSADO"
                        ? "default"
                        : order.estado_pedido === "EN CURSO"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {order.estado_pedido}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* MODAL SI HAY UNA ORDEN SELECCIONADA */}
      {selectedOrder && (
        <DeliveryNotes
          nro_ov={selectedOrder.nro_ov ?? ""}
          open={open}
          openModal={openModal}
          closeModal={closeModal}
          
        />
      )}
    </div>
  );
}

export default ExpandedAfiliate;
