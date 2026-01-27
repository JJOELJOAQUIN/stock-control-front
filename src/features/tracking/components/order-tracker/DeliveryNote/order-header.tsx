import { Card } from "@/shared/components/ui/card";
import React from "react";



interface OrderHeaderProps {
  orden: {
    id: string;
    NroAfiliado: string;
    afiliado: string;
    fcomu: string;
    estado_interno: string;
  };
  formatStateLabel?: (state: string) => string;
  getChipColor?: (state: string, isDark: boolean) => { label: string; bgColor: string; textColor: string };
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  orden,
  formatStateLabel,
  getChipColor,
}) => {
  const { id, NroAfiliado, afiliado, fcomu, estado_interno } = orden;

  const formattedState = formatStateLabel?.(estado_interno) || estado_interno;
  const chipStyle = getChipColor?.(formattedState, false) || {
    label: formattedState,
    bgColor: "bg-gray-200",
    textColor: "text-gray-900",
  };

  return (
    <div className="flex gap-0 mb-6">
      <Card className="flex-1 rounded-r-none">
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-foreground">Datos del Pedido</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="font-semibold text-foreground">Número de Autorización:</span>
              <span className="text-foreground">{id}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground">Fecha:</span>
              <span className="text-foreground">{fcomu}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground">Nombre Afiliado:</span>
              <span className="text-foreground">{afiliado}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground">Nro. Afiliado:</span>
              <span className="text-foreground">{NroAfiliado}</span>
            </div>
          </div>
        </div>
      </Card>

      <div
        className={`w-32 rounded-r-lg flex items-center justify-center p-4 ${chipStyle.bgColor}`}
        style={{
          backgroundColor: chipStyle.bgColor,
          color: chipStyle.textColor,
        }}
      >
        <span className="font-semibold text-center">{chipStyle.label}</span>
      </div>
    </div>
  );
};

export default OrderHeader;
