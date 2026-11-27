/**
 * El backend frena una compra que parece repetida (mismo número de pedido, o
 * mismos productos y cantidades hace poco) con un 409 DUPLICATE_PURCHASE.
 * Pasó con el pedido LACROZE 22706: se cargó 4 veces seguidas.
 *
 * Este helper envía la compra y, si el backend la frena, pregunta. Si el
 * usuario confirma que es otra compra, la reenvía con confirmDuplicate.
 * Devuelve false si el usuario decidió no cargarla.
 */
type DuplicatePurchaseError = {
  status: 409;
  data: { error: "DUPLICATE_PURCHASE"; message: string };
};

export function isDuplicatePurchaseError(error: unknown): error is DuplicatePurchaseError {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { status?: unknown; data?: { error?: unknown } };
  return e.status === 409 && e.data?.error === "DUPLICATE_PURCHASE";
}

export async function sendPurchaseCheckingDuplicates(
  send: (confirmDuplicate: boolean) => Promise<unknown>
): Promise<boolean> {
  try {
    await send(false);
    return true;
  } catch (error: unknown) {
    if (!isDuplicatePurchaseError(error)) throw error;

    const confirmed = window.confirm(
      `${error.data.message}\n\n¿Es otra compra y querés cargarla igual?`
    );
    if (!confirmed) return false;

    await send(true);
    return true;
  }
}
