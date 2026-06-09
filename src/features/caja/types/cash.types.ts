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
    label: "Hydra Lips",
    amount: 19000,
  },
  {
    code: "ESPALDA",
    label: "Espalda",
    amount: 40600,
  },
  {
   code: "EXOSOMAS",
   label: "Limpieza + hidratacion jelly",
   amount: 0,
   },
      {
    code: "PEELING_PROFUNDO",
    label: "Peeling profundo",
    amount: 40000,
  },

];

export type CashDailySplitResponse = {
  date: string;
  context: CashContext;
  netIncome: number;
  doctorTotal: number;
  cosmetologistTotal: number;
};

export type CashActor = "MEDICA" | "COSMETOLOGA";

export const MEDICA_PROCEDURES: ProcedureOption[] = [
  {
    code: "CONSULTA",
    label: "Consulta",
    amount: 40000,
  },
  {
    code: "PRP_CAPILAR",
    label: "PRP capilar",
    amount: 65000,
  },
  {
    code: "PRP_FACIAL",
    label: "PRP facial",
    amount: 85000,
  },

 {
    code: "MESOTERAPIA",
    label: "Mesoterapia",
    amount: 58000,
  },

   {
    code: "PEELING_PROFUNDO",
    label: "Peeling profundo",
    amount: 130000,
  },

     {
    code: "PEELING_SUPERFICIAL_DERMATOLOFICO",
    label: "Peeling superficial dermatológico",
    amount: 60000,
  },
     {
    code: "ILUMINACION_FACIAL_ANTIOXIDANTE",
    label: "Iluminación facial antioxidadante VIT C",
    amount: 70000,
  },

       {
    code: "BIOESTIMULACION_OLIGOELEMENTOS",
    label: "Bioestimulación con oligoelementos",
    amount: 75000,
  },
         {
    code: "OJERAS_NCTF",
    label: "Ojeras con NCTF",
    amount: 185000,
  },

        {
    code: "HIDRATACION_INTENSIVA_ANTIAGE",
    label: "Hidratación intensiva antiage",
    amount: 85000,
  },

          {
    code: "SKINBOOSTER_ALTA_HIDRATACION",
    label: "Skinbooster alta hidratación",
    amount: 240000,
  },

            {
    code: "SKINBOOSTER_REGENERATIVO_PDRN",
    label: "Skinbooster regenerativo PDRN",
    amount: 180000,
  },

              {
    code: "CICATRICEZ_ACNE",
    label: "PRP + DERMAPEN MÉDICO",
    amount: 130000,
  },

               {
    code: "SKIN_MARK",
    label: "REACTIVACION CELULAR SKIN MARK",
    amount: 90000,
  },

                 {
    code: "ELECTROCOAGULACION",
    label: "Electrocoagulación",
    amount: 40000,
  },



];