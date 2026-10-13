const CURRENCY_PREFIX = 'Bs.';

/**
 * Formats an amount as Bolivian currency.
 *
 * Omitting `decimals` interpolates the value as-is, which is what the catalog does
 * (product prices are already rounded by calculatePrice). Passing `decimals` is for
 * the checkout, where FedEx amounts carry real cents.
 */
export const formatBs = (
  amount: number | string,
  decimals?: number,
): string => {
  if (decimals === undefined) return `${CURRENCY_PREFIX} ${amount}`;
  return `${CURRENCY_PREFIX} ${Number(amount).toFixed(decimals)}`;
};
