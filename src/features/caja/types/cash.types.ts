export type CashMovementType = "IN" | "OUT";

export type CashSource =
  | "PRODUCT_SALE"
  | "PROCEDURE"
  | "EXPENSE"
  | "PROVIDER_PAYMENT"
  | "ADJUSTMENT";

export type PaymentMethod = "CASH" | "TRANSFER" | "DEBIT" | "CREDIT";

export type CashContext = "LOCAL" | "CONSULTORIO";

export type CashMovementResponse = {
  id: string;
  type: CashMovementType;
  source: CashSource;
  paymentMethod: PaymentMethod;
  context: CashContext;
  amount: number;
  retention: number;
  netAmount: number;
  doctorShare?: number | null;
  cosmetologistShare?: number | null;
  comment?: string | null;
  detail?: string | null;
  referenceId?: string | null;
  createdAt: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type CreateCashMovementRequest = {
  type: CashMovementType;
  source: CashSource;
  paymentMethod: PaymentMethod;
  context: CashContext;
  amount: number;
  retentionPercent?: number | null;
  comment?: string;
  detail?: string | null;
  referenceId?: string | null;
  doctorSharePercent?: number | null;
  cosmetologistSharePercent?: number | null;
};

export type CashMovementFilters = {
  type?: CashMovementType;
  source?: CashSource;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
};

export type ProcedureOption = {
  code: string;
  label: string;
  amount: number;
};

export const COSMETOLOGIA_PROCEDURES: ProcedureOption[] = [
  {
    code: "DERMAPEN_DERMAPLANING",
    label: "DERMAPEN CON DERMAPLANING",
    amount: 54500,
  },
  {
    code: "DERMAPEN_DERMAPLANING_LIMPIEZA_PREMIUM",
    label: "DERMAPEN CON DERMAPLANING Y LIMPIEZA PREMIUM",
    amount: 61500,
  },
  {
    code: "LIMPIEZA_SIMPLE",
    label: "LIMPIEZA SIMPLE",
    amount: 33600,
  },
  {
    code: "LIMPIEZA_PREMIUM",
    label: "LIMPIEZA PREMIUM",
    amount: 37600,
  },
  {
    code: "LIMPIEZA_PREMIUM_HIDRATACION",
    label: "LIMPIEZA PREMIUM HIDRATACIÓN INTENSIVA",
    amount: 42900,
  },
  {
    code: "DERMAPLANING",
    label: "DERMAPLANING",
    amount: 35300,
  },
  {
    code: "DERMAPEN",
    label: "DERMAPEN",
    amount: 47500,
  },
  {
    code: "EXOSOMAS",
    label: "EXOSOMAS",
    amount: 65000,
  },
  {
    code: "HYDRA",
    label: "HYDRA LIPS",
    amount: 19000,
  },
  {
    code: "ESPALDA",
    label: "LIMPIEZA ESPALDA",
    amount: 45000,
  },
  {
    code: "PEELING_COSMETOLOGICO",
    label: "PEELING COSMETOLÓGICO",
    amount: 42300,
  },
  {
    code: "FRAX_FACE_COSMETOLOGICO",
    label: "FRAX FACE COSMETOLÓGICO",
    amount: 0,
  },
  {
    code: "FRAX_FACE_COSMETOLOGICO_EXOSOMAS",
    label: "FRAX FACE COSMETOLÓGICO + EXOSOMAS",
    amount: 0,
  },
];

export type CashDailySplitResponse = {
  date: string;
  context: CashContext;
  netIncome: number;
  doctorTotal: number;
  cosmetologistTotal: number;
};

export type CashCosmetologistSplitResponse = {
  date: string;
  context: CashContext;
  procedureCosmetologist: number;
  procedureDoctor: number;
  salesCosmetologist: number;
  salesDoctor: number;
};

export type CashSalesTotalsResponse = {
  context: CashContext;
  productSales: number;
  procedureIncome: number;
};

export type CashActor = "MEDICA" | "COSMETOLOGA";

export const MEDICA_PROCEDURES: ProcedureOption[] = [
  {
    code: "CONSULTA",
    label: "CONSULTA DERMATOLOGICA",
    amount: 40000,
  },
  {
    code: "PRP_CAPILAR",
    label: "PRP CAPILAR",
    amount: 65000,
  },
  {
    code: "MESOTERAPIA",
    label: "MESOTERAPIA CAPILAR",
    amount: 58000,
  },
  {
    code: "PRP_FACIAL",
    label: "PRP FACIAL",
    amount: 85000,
  },
  {
    code: "CICATRICEZ_ACNE",
    label: "PRP + DERMAPEN MÉDICO CICATRICES ACNE",
    amount: 130000,
  },
  {
    code: "SKIN_MARK",
    label: "SKIN MARK REACTIVACIÓN X-DNA + DERMAPEN",
    amount: 110000,
  },
  {
    code: "PEELING_PROFUNDO_PROTOCOLO",
    label: "PROTOCOLO PEELING PROFUNDO",
    amount: 170000,
  },
  {
    code: "PEELING_SUPERFICIAL_DERMATOLOFICO",
    label: "PEELING SUPERFICIAL DERMATOLÓGICO",
    amount: 60000,
  },
  {
    code: "OJERAS_NCTF",
    label: "OJERAS NCTF",
    amount: 185000,
  },
  {
    code: "OJERAS_SURCOS_NCTF",
    label: "OJERAS + SURCOS NASOGENIANOS NCTF",
    amount: 350000,
  },
  {
    code: "ILUMINACION_FACIAL_ANTIOXIDANTE",
    label: "VITAMINA C MESOTERAPIA",
    amount: 70000,
  },
  {
    code: "BIOESTIMULACION_OLIGOELEMENTOS",
    label: "BIOESTIMULACION CON OLIGOELEMENTOS",
    amount: 75000,
  },
  {
    code: "HIDRATACION_INTENSIVA_ANTIAGE",
    label: "HIDRATACION INTENSIVA ANTIAGE DMAE",
    amount: 85000,
  },
  {
    code: "SKINBOOSTER_ALTA_HIDRATACION",
    label: "SKINBOOSTER ALTA HIDRATACION REDENX",
    amount: 240000,
  },
  {
    code: "SKINBOOSTER_REGENERATIVO_PDRN",
    label: "SKINBOOSTER REGENERATIVO PDRN DE SALMÓN",
    amount: 180000,
  },
  {
    code: "ELECTROCOAGULACION",
    label: "ELECTROCOAGULACIÓN",
    amount: 45000,
  },
  {
    code: "MELILOT_BOLSAS_DRENANTE",
    label: "MELILOT MESOTERAPIA BOLSAS DRENANTE",
    amount: 70000,
  },
  {
    code: "FRAX_FACE",
    label: "FRAX FACE DERMATOLÓGICO",
    amount: 165000,
  },
];