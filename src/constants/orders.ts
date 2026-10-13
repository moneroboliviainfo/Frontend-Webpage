// Order status constants
const ORDER_STATUS = {
  EXPIRED: 'expired',
  PENDING: 'pending',
  PAID: 'paid',
  SENT: 'sent',
} as const;

// Order statuses that should redirect away from confirmation page
export const INVALID_CONFIRMATION_STATUSES = [
  ORDER_STATUS.EXPIRED,
  ORDER_STATUS.PENDING,
] as const;
