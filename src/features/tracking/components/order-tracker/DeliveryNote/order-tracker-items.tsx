import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Table } from "@/shared/components/ui/table";

import React from "react";


interface Item {
  item?: string;
  cantidad?: number | string;
  stock?: number | string | null;
  remito?: string | null;
  [key: string]: any;
}
interface OrderTrackerItemsProps {
  articulos: Item[];
  onItemClick?: (item: Item) => void;
}

const OrderTrackerItems: React.FC<OrderTrackerItemsProps> = ({
  articulos,
}) => {
  if (!articulos || articulos.length === 0) {
    return <p className="text-muted-foreground p-4">No hay artículos</p>;
  }

  const columns = ["item", "cantidad", "stock", "remito"];

  return (
    <div className="w-full rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((col) => (
              <TableHead key={col} className="font-semibold text-foreground">
                {col.charAt(0).toUpperCase() + col.slice(1)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {articulos.map((item, idx) => (
            <TableRow
              key={idx}
              className="hover:bg-muted/50 transition-colors"
            >
              {columns.map((col) => (
                <TableCell key={`${idx}-${col}`} className="text-foreground">
                  {item[col] || "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTrackerItems;
