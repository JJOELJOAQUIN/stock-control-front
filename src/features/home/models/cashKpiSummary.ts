export interface CashKpiSummary {
  totalIn: number;
  totalOut: number;
  totalRetention: number;
  netTotal: number;

  localNet: number;
  consultorioNet: number;

  cashNet: number;
  transferNet: number;
  creditNet: number;
  debitNet: number;
}
