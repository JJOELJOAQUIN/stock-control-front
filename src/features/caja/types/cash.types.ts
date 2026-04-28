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
  referenceId?: string | null;
  doctorSharePercent?: number | null;
  cosmetologistSharePercent?: number | null;
};

export type ProcedureOption = {
  code: string;
  label: string;
  amount: number;
};

export const COSMETOLOGIA_PROCEDURES: ProcedureOption[] = [
  {
    code: "DERMAPEN_DERMAPLANING",
    label: "Dermapen con Dermaplaning",
    amount: 54500,
  },
  {
    code: "DERMAPEN_DERMAPLANING_LIMPIEZA_PREMIUM",
    label: "Dermapen con Dermaplaning y limpieza premium",
    amount: 61500,
  },
  {
    code: "SIMPLE",
    label: "Simple",
    amount: 33600,
  },
  {
    code: "PREMIUM",
    label: "Premium",
    amount: 37600,
  },
  {
    code: "DERMAPLANING",
    label: "Dermaplaning",
    amount: 35300,
  },
  {
    code: "DERMAPEN",
    label: "Dermapen",
    amount: 47500,
  },
  {
    code: "HYDRA",
    label: "Hydra",
    amount: 19000,
  },
  {
    code: "ESPALDA",
    label: "Espalda",
    amount: 40600,
  },
];

export const MEDICA_PROCEDURES: ProcedureOption[] = [
  {
    code: "CONSULTA",
    label: "Consulta",
    amount: 30000,
  },
  {
    code: "PRP_CAPILAR",
    label: "PRP capilar",
    amount: 58500,
  },
  {
    code: "PRP_FACIAL",
    label: "PRP facial",
    amount: 76500,
  },
];