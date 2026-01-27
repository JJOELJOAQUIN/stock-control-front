import { Banner } from "@/shared/components/ui/banner";
import TableWrapper from "@/shared/components/ui/table-wrapper";
import { Layers, History, TrendingUp } from "lucide-react";

import type { Client } from "../../models/client";
import { SearchInput } from "@/shared/components/ui/search-input"
import { useGetOv } from "../../services/useGetOv";
import { formatARS } from "@/shared/lib/formatArs";
import StatCard from "@/shared/components/ui/charts/stat-card/stat-card";
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";

const Commercial = () => {
  const { id: user } = useParams();
  const [searchTerm, setSearchTerm] = useState("")
  const {
    formattedData,
    isLoading,
    isError,
    refetch,
    totalBase,
    totalAcumulado,
    totalMesAnterior,
  } = useGetOv(user ?? "");

  const filteredRows = useMemo(() => {
    if (!searchTerm) return formattedData

    const q = searchTerm.toLowerCase()

    return formattedData.filter((item: Client) => {
      const cli = item.Cliente?.toLowerCase() ?? ""
      return cli === q || cli.includes(q)
    })
  }, [formattedData, searchTerm])


  const columns = [
    { field: "Cliente", headerName: "Cliente" },

    {
      field: "acumMes",
      headerName: "Mes Acumulado",
      render: (value: number) => formatARS(value),
      sortable: true,
    },

    {
      field: "mesAnt",
      headerName: "Mes Anterior",
      render: (value: number) => formatARS(value),
      sortable: true,
    },

    {
      field: "base",
      headerName: "Mes Base",
      render: (value: number) => formatARS(value),
      sortable: true,
    },

    {
      field: "diferenciaAnt",
      headerName: "Dif. Acum vs Ant",
      sortable: true,
      render: (value: number) => (
        <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
          {formatARS(value)}
        </span>
      ),
    },

    {
      field: "diferenciaBase",
      headerName: "Dif. Acum vs Base",
      sortable: true,
      render: (value: number) => (
        <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
          {formatARS(value)}
        </span>
      ),
    },

    {
      field: "variacion",
      headerName: "% Mes Acum vs Base",
      sortable: true,
      render: (value: number) => (
        <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
          {value.toFixed(2)}%
        </span>
      ),
    },
    {
      field: "variacionAnterior",
      headerName: "% Mes Acum vs Ant",
      sortable: true,
      render: (value: number) => (
        <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
          {value.toFixed(2)}%
        </span>
      ),
    },
  ];

  return (
    <div>
      <Banner title={`Equipo ${user?.toUpperCase() ?? ""}`} description="Gestión de comerciales">

        <div className="ml-auto">
          <SearchInput onSearch={setSearchTerm} />
        </div>
      </Banner>
      <div className="flex gap-2 w-full">
        <StatCard
          icon={<Layers />}
          title="Mes base total"
          value={formatARS(totalBase)}
        />
        <StatCard
          icon={<History />}
          title="Total acumulado"
          value={formatARS(totalAcumulado)}
        />
        <StatCard
          icon={<TrendingUp />}
          title="Total mes anterior"
          value={formatARS(totalMesAnterior)}
        />
      </div>

      <TableWrapper<Client>
        columns={columns}
        rows={filteredRows}
        totalCount={filteredRows.length}
        enablePagination={false}
        onRowClick={(row) => console.log(row)}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />
    </div>
  );
};

export default Commercial;
