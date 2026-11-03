/**
 * The backend reports missing stock inside the text of a 400, not in a field.
 * `errorsStock` in a 200 reprice response is always empty, so this is the only
 * way to know which garments failed.
 *
 * Two shapes exist, because two different endpoints build the message:
 *   - reprice and FedEx rates: "Insufficient stock for variants: [10, 12]"
 *   - order creation:          "Insufficient stock for variant ID: 10"
 *
 * The reprice form can also carry a trailing note that mentions other numbers
 * ("(variante 10 reservada para el pedido #15)"), so the bracketed list is read
 * first and the singular form only when there are no brackets.
 */

const BRACKETED_IDS = /\[\s*(\d+(?:\s*,\s*\d+)*)\s*\]/;
const SINGLE_ID = /variant\s*ID\s*:?\s*(\d+)/i;

/** Variant ids named in a backend stock error. Empty when the text has none. */
export const parseInsufficientStockVariantIds = (
  message: unknown,
): number[] => {
  if (typeof message !== 'string') return [];

  const bracketed = message.match(BRACKETED_IDS);
  if (bracketed?.[1]) {
    return bracketed[1]
      .split(',')
      .map((id) => Number.parseInt(id.trim(), 10))
      .filter((id) => Number.isFinite(id));
  }

  const single = message.match(SINGLE_ID);
  if (single?.[1]) {
    const id = Number.parseInt(single[1], 10);
    return Number.isFinite(id) ? [id] : [];
  }

  return [];
};

/** Whether a backend error is about stock running out. */
export const isInsufficientStockMessage = (message: unknown): boolean =>
  typeof message === 'string' && /insufficient stock/i.test(message);

/**
 * Names the cart garments behind a list of variant ids, for flows that show a
 * message instead of the out-of-stock modal (the mobile confirmation sheet).
 * Ids missing from the cart are skipped: the point is to name what the customer
 * recognises, not to echo the backend.
 */
export const describeOutOfStockItems = (
  variantIds: number[],
  items: Array<{ variantId: number; productName: string; sizeName: string }>,
): string =>
  variantIds
    .map((id) => items.find((item) => item.variantId === id))
    .filter((item): item is NonNullable<typeof item> => !!item)
    .map((item) => `${item.productName} (talla ${item.sizeName})`)
    .join(', ');
