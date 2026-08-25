// Zona horaria del negocio en el front. Espeja BusinessZone del backend: las
// fechas "del día" se calculan en hora Argentina, no en UTC ni en la zona del
// navegador. Sin esto, new Date().toISOString().slice(0,10) devuelve la fecha
// UTC: entre las 21:00 y las 23:59 AR ya es "mañana" en UTC, así que el día
// por defecto y los filtros de la tabla se corrían respecto de lo que agrupa
// el servidor.
const BUSINESS_TIME_ZONE = "America/Argentina/Buenos_Aires";

// en-CA formatea como YYYY-MM-DD, que es el formato ISO de fecha que usan los
// date pickers y los filtros de rango.
const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Fecha (YYYY-MM-DD) de un instante, en hora Argentina. Recibe lo que devuelve
 * el backend en createdAt (string ISO con zona), un timestamp o un Date.
 */
export function toBusinessDateISO(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return isoDateFormatter.format(date);
}

/** Hoy (YYYY-MM-DD) en hora Argentina. */
export function businessToday(): string {
  return isoDateFormatter.format(new Date());
}