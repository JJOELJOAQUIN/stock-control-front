import { describe, it, expect, vi, beforeEach } from "vitest";

const { baseImpl, requestStockReconcile } = vi.hoisted(() => ({
  baseImpl: vi.fn(),
  requestStockReconcile: vi.fn(),
}));

vi.mock("@reduxjs/toolkit/query", () => ({ fetchBaseQuery: vi.fn(() => baseImpl) }));
vi.mock("firebase/auth", () => ({ getAuth: vi.fn() }));
vi.mock("../../auth/helper/logoutHandler", () => ({ logoutUser: vi.fn() }));
vi.mock("@/features/stock/reconcile/stockReconcileBridge", async (orig) => ({
  ...(await orig<typeof import("@/features/stock/reconcile/stockReconcileBridge")>()),
  requestStockReconcile: (...a: unknown[]) => requestStockReconcile(...a),
}));

const insufficient = {
  error: {
    status: 409,
    data: {
      code: "INSUFFICIENT_STOCK",
      message: "Stock insuficiente de EXOSOMAS",
      productId: "p1",
      productName: "EXOSOMAS",
      context: "CONSULTORIO",
      available: 0,
      requested: 1,
      unit: "AMPOLLA",
      unitsPerPackage: 1,
    },
  },
};

const call = async () => {
  const { default: customFetchBase } = await import("../customBaseQuery");
  return customFetchBase(
    { url: "/api/business/dermato-procedure", method: "POST" },
    { dispatch: vi.fn(), getState: vi.fn() } as never,
    {}
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("customFetchBase - stock insuficiente", () => {
  it("si se reconcilia el stock, reintenta la misma operación", async () => {
    baseImpl.mockResolvedValueOnce(insufficient).mockResolvedValueOnce({ data: { ok: true } });
    requestStockReconcile.mockResolvedValueOnce(true);

    const result = await call();

    expect(requestStockReconcile).toHaveBeenCalledTimes(1);
    expect(baseImpl).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: { ok: true } });
  });

  it("si se cancela, devuelve el error original sin reintentar", async () => {
    baseImpl.mockResolvedValueOnce(insufficient);
    requestStockReconcile.mockResolvedValueOnce(false);

    const result = await call();

    expect(baseImpl).toHaveBeenCalledTimes(1);
    expect(result).toEqual(insufficient);
  });

  it("un 409 común no abre el diálogo", async () => {
    baseImpl.mockResolvedValueOnce({ error: { status: 409, data: { message: "otro" } } });

    await call();

    expect(requestStockReconcile).not.toHaveBeenCalled();
  });
});
