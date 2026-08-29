// Cybersource card payment constants

// Production Secure Acceptance endpoint - same for sandbox/live, credentials are configured backend-side
export const CYBERSOURCE_PAY_URL =
  'https://secureacceptance.cybersource.com/pay';

export const PAYMENT_METHOD = {
  QR: 'qr',
  CARD: 'card',
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const CYBERSOURCE_PAYMENT_TYPE = {
  CARD_ONLINE: 'card_online',
  QR_TRANSFER: 'qr_transfer',
} as const;

// Bolivia department name (as normalized in the checkout form) -> ISO-3166-2 state code
export const BOLIVIA_STATE_CODES: Record<string, string> = {
  'La Paz': 'L',
  Cochabamba: 'C',
  Chuquisaca: 'H',
  Oruro: 'O',
  Potosí: 'P',
  'Santa Cruz': 'S',
  Beni: 'B',
  'El Beni': 'B',
  Pando: 'N',
  Tarija: 'T',
};

// Country name (as selected in the checkout form) -> ISO-3166-1 alpha-2 code
export const COUNTRY_ISO_CODES: Record<string, string> = {
  Bolivia: 'BO',
  Argentina: 'AR',
  Chile: 'CL',
  Colombia: 'CO',
  Perú: 'PE',
  Peru: 'PE',
  Brasil: 'BR',
  Brazil: 'BR',
  México: 'MX',
  Mexico: 'MX',
  'Estados Unidos': 'US',
  España: 'ES',
};
