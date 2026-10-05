import { describe, it, expect } from "vitest";
import { parseLacrozeLines } from "../lacrozeParser";

// Texto real que devuelve el OCR del pedido 20897 (foto JPG), SIN preprocesar:
// los números en rojo salen rotos ("8" -> "El", "4" -> "a", "8410" -> "sa10").
const OCR_PEDIDO_CRUDO = `Pedidos N2 20897 MURILLO MARIA DEL PILAR (Cliente: 4345) — Fecha: 31/08/2026
CODIGO PRODUCTO CANT. PRECIO X UNID. IMPORTE
1001169 ESPUMA DE LIMPIEZA DESCONGESTIVA P/S X 1200CC 16 7542 120678
Envase: BOTELLA FOAMER C/PUMP BLANCO X 150CC
1001001 EMULSION DE LIMPIEZA C/ALMENDRAS DULCES P/SECA X 1 a sa10 sa10
Envase: VALVULA ATOMIZADORA/ CREMERA PARA POTEX1
1001023 EMULSION DE LIMPIEZA DESC C/AZULENO P/SEN X 120CC 1 7241 7241
Envase: VALVULA ATOMIZADORA/ CREMERA PARA POTEX1
6028231 EMULSION HUMECTANTE ANTIOXIDANTE X 500GR 10 6997 69973
Envase: POTE RENZO X SOGR
11041581 SERUM DESCONG CALMANTE CON CENTELLA ASIATICA MALV x2500(—- 8 8400 67200
Envase: GOTERO GLASS C/ VALVULA X 30CC
11041094 EMULSION HERBAL DESCONGESTIVA X 250GR 5 6651 33253
Envase: POTE RENZO X SOGR
1004011 SERUM ULTRA HUMECTANTE X 250CC El 5192 41532
Envase: GOTERO GLASS C/ VALVULA X 30CC
1004173 SERUM CON NIACINAMIDA 10% X 250CC 8 8539 68309
Envase: GOTERO GLASS C/ VALVULA X 30CC
3021094 SERUM DESPIGMENTANTE ACLARANTE DIURNO X 120CC a 17853 71413
Envase: GOTERO ROUND GLASS AMBAR X 30CC
11041581 SERUM DESCONG CALMANTE CON CENTELLA ASIATICA MALV 1 48000 48000
536009`.split("\n");

describe("parseLacrozeLines - pedido por OCR", () => {
  const r = parseLacrozeLines(OCR_PEDIDO_CRUDO);
  const byDesc = (s: string) => r.lines.find((l) => l.descripcion.includes(s));

  it("detecta los 10 renglones, incluidos los de números rotos", () => {
    expect(r.lines).toHaveLength(10);
  });

  it("lee el total suelto al pie y el número de pedido", () => {
    expect(r.meta.totalFactura).toBe(536009);
    expect(r.meta.factura).toBe("20897");
    expect(r.meta.fecha).toBe("31/08/2026");
  });

  it("deduce la cantidad desde importe / precio", () => {
    const ultra = byDesc("ULTRA HUMECTANTE");
    expect(ultra?.descripcion).toBe("SERUM ULTRA HUMECTANTE X 250CC");
    expect(ultra?.cantidad).toBe(8);
    expect(ultra?.importe).toBe(41532);
    expect(ultra?.importeDescuadra).toBe(true);

    const despig = byDesc("DESPIGMENTANTE");
    expect(despig?.cantidad).toBe(4);
    expect(despig?.importe).toBe(71413);
  });

  it("deduce el importe ilegible desde el total del pedido", () => {
    const almendras = byDesc("ALMENDRAS DULCES");
    expect(almendras?.descripcion).toBe(
      "EMULSION DE LIMPIEZA C/ALMENDRAS DULCES P/SECA X 1"
    );
    expect(almendras?.cantidad).toBe(1);
    expect(almendras?.importe).toBe(8410);
    expect(almendras?.precioUnit).toBe(8410);
  });

  it("la suma de las líneas cierra con el total del documento", () => {
    // Puede diferir en centavos por el redondeo del costo unitario.
    expect(Math.abs(r.totalCalculado - 536009)).toBeLessThan(1);
    expect(r.warnings.some((w) => w.includes("no coincide"))).toBe(false);
  });
});

describe("parseLacrozeLines - factura PDF", () => {
  it("sigue leyendo el formato factura con UN", () => {
    const r = parseLacrozeLines([
      "FACTURA Nº 0003-00012345",
      "1234 SERUM HIALURONICO X 30CC 2 UN 1.500,000 3.000,00",
      "Total: $ 3.000,00",
    ]);
    expect(r.lines).toHaveLength(1);
    expect(r.lines[0]).toMatchObject({ cantidad: 2, precioUnit: 1500, importe: 3000 });
    expect(r.meta.totalFactura).toBe(3000);
  });
});
