// Order status constants
export const ORDER_STATUS = {
  EXPIRED: 'expired',
  PENDING: 'pending',
  PAID: 'paid',
  SENT: 'sent',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Order statuses that should redirect away from confirmation page
export const INVALID_CONFIRMATION_STATUSES = [
  ORDER_STATUS.EXPIRED,
  ORDER_STATUS.PENDING,
] as const;
