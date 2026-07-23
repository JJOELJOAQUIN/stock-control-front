import {
  COSMETOLOGIA_PROCEDURES,
  MEDICA_PROCEDURES,
} from "@/features/caja/types/cash.types";
import { ProcedureIncomeCard } from "@/features/caja/ui/components/ProcedureIncomeCard";
import { useCashConsultorioPage } from "@/features/caja/hooks/useCashConsultorioPage";
import { useHasRole } from "@/features/auth/hooks/useRoles";

// Repartos por especialidad (los mismos que vivian en caja-consultorio).
const COSMETOLOGIA_SHARE = { doctor: 0.3, cosmetologist: 0.7 } as const;
const MEDICA_SHARE = { doctor: 1, cosmetologist: 0 } as const;

/**
 * Los cards de procedimientos, mudados de Caja a Tratamientos: el registro
 * sigue impactando caja igual que antes (mismo hook, mismo endpoint) —
 * solo cambio desde donde se abre.
 */
export default function ProcedimientosPage() {
  const { registerProcedureIncome, isCreating } = useCashConsultorioPage();

  // Misma matriz de visibilidad que tenia caja-consultorio.
  const showCosmetologia = useHasRole(["USER", "COSMETOLOGA"]);
  const showMedica = useHasRole(["ADMIN", "USER"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Procedimientos</h1>
        <p className="text-sm text-muted-foreground">
          Registro de procedimientos con su reparto. Impacta directo en caja.
        </p>
      </div>

      <div
        className={`grid grid-cols-1 items-stretch gap-6 ${
          showMedica && showCosmetologia ? "md:grid-cols-2" : ""
        }`}
      >
        {showMedica && (
          <ProcedureIncomeCard
            title="PROCEDIMIENTOS MEDICA"
            description="Registrar procedimientos medicos"
            procedures={MEDICA_PROCEDURES}
            doctorSharePercent={MEDICA_SHARE.doctor}
            cosmetologistSharePercent={MEDICA_SHARE.cosmetologist}
            isSubmitting={isCreating}
            variant="medica"
            onSubmit={registerProcedureIncome}
          />
        )}

        {showCosmetologia && (
          <ProcedureIncomeCard
            title="PROCEDIMIENTOS COSMETOLOGIA"
            description="Registrar procedimientos de cosmetologia"
            procedures={COSMETOLOGIA_PROCEDURES}
            doctorSharePercent={COSMETOLOGIA_SHARE.doctor}
            cosmetologistSharePercent={COSMETOLOGIA_SHARE.cosmetologist}
            isSubmitting={isCreating}
            variant="cosmetologia"
            onSubmit={registerProcedureIncome}
          />
        )}
      </div>
    </div>
  );
}