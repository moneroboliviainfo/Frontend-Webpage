import { ORDER_STATUS } from '@/constants/orders';

export type OrderStatus = 'expired' | 'pending' | 'paid' | 'sent';

/**
 * The status to show the customer.
 *
 * `GET /web-page/customers/me` can still report `pending` for an order whose
 * `expiresAt` has already passed — the backend does not sweep them. Showing
 * "Pendiente de pago" there invites the customer to go pay an order that no
 * longer accepts payment, so it counts as expired once the deadline is gone.
 *
 * An unparseable or missing `expiresAt` leaves the status untouched: guessing
 * "expired" from a bad date would be worse than showing what the backend said.
 */
export const resolveOrderStatus = (
  status: OrderStatus,
  expiresAt: string | null | undefined,
): OrderStatus => {
  if (status !== ORDER_STATUS.PENDING || !expiresAt) return status;

  const expiry = Date.parse(expiresAt);
  if (!Number.isFinite(expiry)) return status;

  return expiry <= Date.now() ? ORDER_STATUS.EXPIRED : status;
};
