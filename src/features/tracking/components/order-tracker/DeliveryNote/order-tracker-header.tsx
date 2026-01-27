import React from "react";

interface OrderTrackerHeaderProps {
  fecha_remito?: string;
  numero_remito?: number | string;
}

const OrderTrackerHeader: React.FC<OrderTrackerHeaderProps> = ({
  fecha_remito,
  numero_remito,
}) => {
  return (
    <div className="px-4">
      <div className="flex gap-4 my-2">
        <div className="flex-1 bg-muted p-4 rounded-md">
          <p>
            <strong>N° REMITO:</strong> {numero_remito || "-"}
          </p>
        </div>
        <div className="flex-1 bg-muted p-4 rounded-md">
          <p>
            <strong>FECHA REMITO:</strong> {fecha_remito || "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackerHeader;
