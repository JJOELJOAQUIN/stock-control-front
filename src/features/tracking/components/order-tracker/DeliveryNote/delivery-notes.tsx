

import type React from "react"
import { useEffect } from "react"
import OrderTrackerHeader from "./order-tracker-header"
import CustomizedSteppers from "./order-tracker-stepper"
import OrderTrackerItems from "./order-tracker-items"
import ModalWrapper from "@/shared/components/ui/modal-wrapper"
import { DetailsSkeleton, StepperSkeleton, ItemsTableSkeleton, HeaderSkeleton } from '../../../../../shared/components/ui/skeleton/order-tracker-skeleton';

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs"

import type { OrderDetail } from "@/features/tracking/models/afiliate"
import { useOrderDetails } from "@/features/tracking/services/useOrdersDetail"
import { useHorizontalScroll } from "@/shared/hooks/use-horizontal-scroll"

interface DeliveryNotesProps {
  nro_ov?: string
  open: boolean
  openModal: () => void
  closeModal: () => void
}

const DeliveryNotes: React.FC<DeliveryNotesProps> = ({ nro_ov = "", open, closeModal }) => {
  const { fetchOrderDetails, data, isLoading: isLoadingDetails } = useOrderDetails()

  const { ref: tabsScrollRef, scrollLeft, scrollRight } = useHorizontalScroll();


  useEffect(() => {
    if (nro_ov && open) fetchOrderDetails(nro_ov)
  }, [nro_ov, open])

  const rawDetails = data?.details
  const details: OrderDetail[] = Array.isArray(rawDetails) ? rawDetails : rawDetails ? [rawDetails] : []

  const mapItems = (detail: OrderDetail) => {
    if (!detail.items || detail.items.length === 0) return []

    return detail.items.map((i) => ({
      item: i.nombre ?? "-",
      cantidad: i.cantidad ?? "-",
      stock: detail.stock ?? "-",
      remito: detail.nro_remito ? String(detail.nro_remito) : "-",
    }))
  }

  return (
    <ModalWrapper open={open} onClose={closeModal} title="Detalle del Pedido" maxWidth="4xl">
      {isLoadingDetails && (
        <div className="space-y-6">
          <DetailsSkeleton />
          <div className="h-px bg-border" />
          <HeaderSkeleton />
          <StepperSkeleton />
          <ItemsTableSkeleton />
        </div>
      )}

      {!isLoadingDetails && details.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">No se encontraron detalles para este pedido</p>
        </div>
      )}

      {!isLoadingDetails && details.length > 0 && (
        <Tabs defaultValue="0" className="w-full">
          <div className="relative w-full">

            {/* Left Shadow */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent dark:from-background z-10" />

            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className="
    absolute left-0 
    top-1/2 -translate-y-[60%]

    z-20 
    p-1.5              
    rounded-full 
    bg-white 
    shadow-md 
    dark:bg-muted
  "
            >
              ‹
            </button>


            {/* TAB LIST SCROLLEABLE */}
            <TabsList
              ref={tabsScrollRef}
              className="
    flex 
    items-center         /* Centra verticalmente */
    h-9                  /* Alto uniforme */
    w-full 
    overflow-x-auto 
    whitespace-nowrap 
    gap-2 
    px-8 
    py-1
    border-b
    rounded-none
    bg-transparent
    scrollbar-none
  "
            >

              {details.map((d, i) => (
                <TabsTrigger
                  key={i}
                  value={String(i)}
                  className="
    rounded-md               /* ← bordes suaves */
    border-b-2 border-transparent
    data-[state=active]:border-[#da291c]
    bg-transparent 
    px-3 py-1 
    text-xs 
    whitespace-nowrap
  "
                >
                  Remito {d.nro_remito || "-"}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className="
    absolute right-0 
    top-1/2 -translate-y-[60%]
    z-20 
    p-1.5 
    rounded-full 
    bg-white 
    shadow-md 
    dark:bg-muted
  "
            >
              ›
            </button>


            {/* Right Shadow */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent dark:from-background z-10" />
          </div>

          {details.map((detail, i) => (
            <TabsContent key={i} value={String(i)} className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <p className="text-sm">
                    <strong>Número de Pedido:</strong> <span className="font-normal">{detail.pedido}</span>
                  </p>
                  <p className="text-sm">
                    <strong>Número de OV:</strong> <span className="font-normal">{detail.nro_ov}</span>
                  </p>
                  <p className="text-sm">
                    <strong>Fecha OV:</strong>{" "}
                    <span className="font-normal">
                      {detail.fecha_ov ? new Date(detail.fecha_ov).toLocaleDateString("es-AR") : "-"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <strong>Número de Afiliado:</strong> <span className="font-normal">{detail.cod_afiliado}</span>
                  </p>
                  <p className="text-sm">
                    <strong>Estado de Pedido:</strong>{" "}
                    <span className="font-normal">{detail.estado_pedido || "-"}</span>
                  </p>
                  <p className="text-sm">
                    <strong>Fecha Estimada:</strong>{" "}
                    <span className="font-normal">
                      {detail.fecha_est ? new Date(detail.fecha_est).toLocaleDateString("es-AR") : "-"}
                    </span>
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-md space-y-2">
                  <p className="text-sm">
                    <strong>Farmacia de Entrega:</strong>{" "}
                    <span className="font-normal">{detail.fcia_dispensa || "-"}</span>
                  </p>
                  <p className="text-sm">
                    <strong>Dirección Farmacia:</strong>{" "}
                    <span className="font-normal">{detail.dir_fcia_dispensa || "-"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <h3 className="font-bold text-sm whitespace-nowrap">
                  {detail.nro_remito ? "Remitido" : "Sin Remitir"}
                </h3>
                <div className="flex-1 h-px bg-border" />
              </div>

              <OrderTrackerHeader
                fecha_remito={detail.fecha_remito ? new Date(detail.fecha_remito).toLocaleDateString("es-AR") : "-"}
                numero_remito={detail.nro_remito ?? "-"}
              />

              {detail.nro_remito && <CustomizedSteppers estado={detail.estado_pedido ?? "-"} />}

              <OrderTrackerItems articulos={mapItems(detail)} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </ModalWrapper>
  )
}

export default DeliveryNotes
