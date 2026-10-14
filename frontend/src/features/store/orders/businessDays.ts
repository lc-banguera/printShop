/**
 * Utilidad de cálculo y formateo de días hábiles para PrintShop
 * Reglas:
 * - Cuenta de lunes a viernes exclusivamente.
 * - Sábados (día 6) y domingos (día 0) se omiten.
 * - No muta la fecha original.
 * - Maneja transiciones de mes y de año.
 */

/**
 * Suma una cantidad de días hábiles a una fecha dada.
 * @param startDate Fecha inicial (ej. fecha de despacho)
 * @param businessDays Cantidad de días hábiles a sumar (>= 1)
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate.getTime());
  let added = 0;
  const target = Math.max(0, Math.floor(businessDays));

  while (added < target) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    // 0 es Domingo, 6 es Sábado
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }

  return result;
}

const SPANISH_MONTHS_SHORT = [
  "ene.",
  "feb.",
  "mar.",
  "abr.",
  "may.",
  "jun.",
  "jul.",
  "ago.",
  "sept.",
  "oct.",
  "nov.",
  "dic.",
];

const SPANISH_DAYS_SHORT = [
  "dom.",
  "lun.",
  "mar.",
  "mié.",
  "jue.",
  "vie.",
  "sáb.",
];

/**
 * Formatea una fecha de forma corta y legible en español: ej. "jue. 18 sept."
 */
export function formatDateShortSpanish(date: Date): string {
  const dayName = SPANISH_DAYS_SHORT[date.getDay()];
  const dayNum = date.getDate();
  const monthName = SPANISH_MONTHS_SHORT[date.getMonth()];
  return `${dayName} ${dayNum} ${monthName}`;
}

/**
 * Genera el texto del rango estimado de entrega a partir de días hábiles.
 * Ejemplo: "jue. 18 sept. — lun. 22 sept." o "vie. 19 sept." si min == max.
 */
export function formatBusinessDateRange(
  startDate: Date,
  minDays: number,
  maxDays: number,
): string {
  const minDate = addBusinessDays(startDate, Math.max(1, minDays));
  const maxDate = addBusinessDays(startDate, Math.max(minDays, maxDays));

  const minFormatted = formatDateShortSpanish(minDate);
  const maxFormatted = formatDateShortSpanish(maxDate);

  if (minFormatted === maxFormatted) {
    return minFormatted;
  }

  return `${minFormatted} — ${maxFormatted}`;
}

/**
 * Texto legible del rango de días hábiles.
 * Ejemplo: "2 a 4 días hábiles"
 */
export function formatBusinessDaysText(minDays: number, maxDays: number): string {
  if (minDays === maxDays) {
    return `${minDays} día${minDays === 1 ? " hábil" : "s hábiles"}`;
  }
  return `${minDays} a ${maxDays} días hábiles`;
}
