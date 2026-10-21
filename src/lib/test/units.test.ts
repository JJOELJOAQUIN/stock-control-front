import { describe, it, expect } from "vitest";
import { fitsScale, formatQty, parseDecimal, toStored } from "../units";
import { computeTarget } from "@/features/stock/reconcile/reconcileQuantity";

describe("unidades con escala", () => {
  it("ML se muestra en ml reales aunque se guarde en décimas", () => {
    expect(formatQty(75, "ML", 10)).toBe("7,5 ml");
    expect(formatQty(150, "ML", 10)).toBe("15 ml");
    expect(formatQty(18, "AMPOLLA", 1)).toBe("18 amp.");
    expect(formatQty(3, "UNIDAD", 1)).toBe("3");
  });

  it("sin escala del backend, no divide (datos viejos)", () => {
    expect(formatQty(8, "ML", undefined)).toBe("8 ml");
  });

  it("acepta coma decimal y valida la precisión", () => {
    expect(parseDecimal("1,5")).toBe(1.5);
    expect(toStored(1.5, 10)).toBe(15);
    expect(fitsScale(1.5, 10)).toBe(true);
    expect(fitsScale(1.25, 10)).toBe(false);
    expect(fitsScale(1.5, 1)).toBe(false);
    expect(Number.isNaN(parseDecimal("abc"))).toBe(true);
  });
});

describe("reconciliación", () => {
  it("total: el stock queda en lo cargado", () => {
    // Vitamina C: figura 1, hay 18 en total -> queda 18.
    expect(computeTarget("total", "18", 1, 1).targetStored).toBe(18);
  });

  it("sumar: se suma a lo que figura", () => {
    // Figura 1, se suman 17 -> 18.
    expect(computeTarget("add", "17", 1, 1).targetStored).toBe(18);
  });

  it("ml con decimales: 2 viales de 3 ml + 1,5 ml = 7,5 ml", () => {
    expect(computeTarget("total", "7,5", 45, 10).targetStored).toBe(75);
  });

  it("rechaza decimales donde no van", () => {
    expect(computeTarget("total", "2,5", 0, 1).error).not.toBeNull();
    expect(computeTarget("total", "1,25", 0, 10).error).not.toBeNull();
  });
});
