import { Banner } from "@/shared/components/ui/banner";
import {
  AfiliadosFilter,
  useAfiliadosFilters,
} from "../../components/filter-tracking/afiliates-filters";
import { useAfiliados } from "../../services/useAfiliados";
import { Button } from "@/shared/components/ui/button";
import { ListFilter } from "lucide-react";
import { useEffect } from "react";
import CollapsibleTableWrapper from "@/shared/components/ui/collapsible-table-wrapper";
import ExpandedAfiliate from "../../components/expanded-afiliate/expanded-afiliate";

type Afiliado = {
  nombre_afiliado: string;
  apellido_afiliado: string;
  nombre_sn: string;
  nro_afiliado: string;
  cliente: string;
};

const columns = [
  {
    field: "nombre_sn",
    headerName: "Cliente",
  },
  {
    field: "nombre_afiliado",
    headerName: "Nombre",
  },
  {
    field: "apellido_afiliado",
    headerName: "Apellido",
  },
  {
    field: "nro_afiliado",
    headerName: "N° de AFiliado",
  },
  {
    field: "cliente",
    headerName: "Cliente",
  },
];

export default function AfiliadosPage() {
  const { open, openModal, closeModal, activeFields, handleApply, filters } =
    useAfiliadosFilters();
  const {
    fetchAfiliados,
    data,
    isLoading,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = useAfiliados();

  useEffect(() => {
    fetchAfiliados({
      ...filters,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    });
  }, [filters, rowsPerPage, page]);

  return (
    <>
      {/* MODAL DE FILTROS */}
      <Banner
        title="Seguimiento de Pedidos"
        description="Pedidos recibidos y pendientes de gestión inicial."
      >
        <Button
          onClick={() => openModal()}
          className="cursor-pointer"
          type="button"
          variant="outline"
        >
          <ListFilter />
        </Button>
      </Banner>

      <AfiliadosFilter
        open={open} // ✔ esto sí
        onClose={closeModal} // ✔ esto es correcto
        onApply={handleApply} // ✔ acá va la función que dispara fetch
        activeFields={activeFields}
      />

      <CollapsibleTableWrapper<Afiliado>
        columns={columns}
        rows={data?.affiliates ?? []}
        totalCount={data?.affiliate_count ?? 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onRowClick={(row) => console.log(row)}
        expandedContent={(row) => <ExpandedAfiliate id={row.nro_afiliado} />}
        rowTooltip="Click para abrir"
        isLoading={isLoading}
      />
    </>
  );
}
