import { useState } from "react";
import TableWrapper from "@/shared/components/ui/table-wrapper";
import { SearchInput } from "@/shared/components/ui/search-input";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import StatCard from "@/shared/components/ui/charts/stat-card/stat-card";
import { Layers, History, TrendingUp } from "lucide-react";
import { ChartPieLabelList } from "@/shared/components/stats-bar-chart";





const mockRows = [
    { Producto: "Prod A", Cantidad: 120, Monto: 45000 },
    { Producto: "Prod B", Cantidad: 80, Monto: 25000 },
    { Producto: "Prod C", Cantidad: 50, Monto: 15000 },
];



const CommercialAnalysisClient = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [date, setDate] = useState<Date | undefined>(new Date());

    const filteredRows = mockRows.filter((r) =>
        r.Producto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
     
            <div className="flex flex-wrap justify-between gap-4 w-full">
        
                <div className="flex flex-col gap-4 flex-1 min-w-[60%]">
                    <SearchInput onSearch={setSearchTerm} />

                    <div className="flex flex-wrap gap-0">
                        <StatCard title="Total Productos" value={filteredRows.length.toString()} icon={<Layers />} />
                        <StatCard title="Cantidad Total" value={`${filteredRows.reduce((a, b) => a + b.Cantidad, 0)}`} icon={<History />} />
                        <StatCard title="Monto Total" value={`$${filteredRows.reduce((a, b) => a + b.Monto, 0)}`} icon={<TrendingUp />} />
                    </div>
                </div>

 
                <div className="flex flex-col items-center gap-4 w-[260px]">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                Elegir fecha
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                            />
                        </PopoverContent>
                    </Popover>

                    <div className="w-full">
                        <ChartPieLabelList />
                    </div> 
                </div>
            </div>





            <TableWrapper
                columns={[
                    { field: "Producto", headerName: "Producto" },
                    { field: "Cantidad", headerName: "Cantidad" },
                    { field: "Monto", headerName: "Monto" },
                ]}
                rows={filteredRows}
                totalCount={filteredRows.length}
            />
        </div>
    );
};

export default CommercialAnalysisClient;
