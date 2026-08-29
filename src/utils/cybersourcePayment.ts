import {
  BOLIVIA_STATE_CODES,
  COUNTRY_ISO_CODES,
  CYBERSOURCE_PAY_URL,
} from '@/constants/cybersource';
import type { CybersourceBilling } from '@/services/cybersourceService';

// Generates the 8-12 alphanumeric session id required by the Cybersource device fingerprint script
export const generateDeviceFingerprintId = (): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * 5) + 8; // 8-12 characters
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// First 4 digits (BIN) of the card number - PCI-safe, used only for SIN tax billing
export const extractCardFirst4 = (cardNumber: string): string =>
  cardNumber.replace(/\s/g, '').substring(0, 4);

export const detectCardType = (cardNumber: string): string => {
  const num = cardNumber.replace(/\s/g, '');
  if (/^4/.test(num)) return '001'; // Visa
  if (/^5[1-5]/.test(num)) return '002'; // Mastercard
  if (/^3[47]/.test(num)) return '003'; // Amex
  if (/^6(?:011|5)/.test(num)) return '004'; // Discover
  return '001';
};

export const resolveCountryIsoCode = (countryName: string): string =>
  COUNTRY_ISO_CODES[countryName] || 'BO';

export const resolveBoliviaStateCode = (departmentName: string): string =>
  BOLIVIA_STATE_CODES[departmentName] || '';

interface BuildBillingInput {
  name: string;
  email: string;
  selectedCountry: string;
  detailedAddress: string;
  cityProvince: string;
  departamento: string;
  city: string;
  streetNumber: string;
  postalCode: string;
  isLoggedIn: boolean;
}

// Maps the delivery/billing data already captured on step 1 to the shape Cybersource requires
export const buildCybersourceBilling = (
  input: BuildBillingInput,
): CybersourceBilling => {
  const isBolivia = input.selectedCountry === 'Bolivia';
  const nameParts = input.name.trim().split(/\s+/);
  const firstName = nameParts[0] || input.name;
  const lastName = nameParts.slice(1).join(' ') || firstName;
  const rawAddress = isBolivia ? input.detailedAddress : input.streetNumber;

  return {
    firstName,
    lastName,
    email: input.email,
    // The delivery form's textarea allows newlines, but Cybersource signs a single-line value
    address: rawAddress
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
    city: isBolivia ? input.cityProvince : input.city,
    state: isBolivia ? resolveBoliviaStateCode(input.departamento) : '',
    postalCode: input.postalCode || '0000',
    country: resolveCountryIsoCode(input.selectedCountry),
    isLoggedIn: input.isLoggedIn,
    isRepeatCustomer: false,
  };
};

// Parses a "MM/AA" or "MM/AAAA" expiry input into separate month/year values
export const parseCardExpiry = (
  expiry: string,
): { month: string; year: string } | null => {
  const match = expiry.trim().match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!match) return null;

  const month = match[1].padStart(2, '0');
  const monthNum = Number(month);
  if (monthNum < 1 || monthNum > 12) return null;

  const year = match[2].length === 2 ? `20${match[2]}` : match[2];
  return { month, year };
};

// Builds the hidden form with the signed fields + card data and submits it, navigating away to Cybersource
export const submitCardPaymentToCybersource = (
  checkoutData: Record<string, string>,
  deviceFingerprintId: string,
  cardNumber: string,
  expiryMonth: string,
  expiryYear: string,
  cvv: string,
): void => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = CYBERSOURCE_PAY_URL;

  // Device fingerprint script per Linkser manual: session_id = comercio_mid + deviceFingerprintId
  const comercioMid = 'linkser_s_0932112';
  const sessionId = `${comercioMid}${deviceFingerprintId}`;
  const metrixOrgId = 'k8vif92e';
  const metrixUrl = `https://h.online-metrix.net/fp/tags.js?org_id=${metrixOrgId}&session_id=${sessionId}`;

  const fpScript = document.createElement('script');
  fpScript.type = 'text/javascript';
  fpScript.src = metrixUrl;
  fpScript.async = true;
  document.head.appendChild(fpScript);

  const fpDiv = document.createElement('div');
  fpDiv.id = 'data-form-wrapper';
  fpDiv.style.display = 'none';
  const noscriptTag = document.createElement('noscript');
  noscriptTag.innerHTML = `<img src="https://h.online-metrix.net/fp/clear.png?org_id=${metrixOrgId}&session_id=${sessionId}" alt="" />`;
  fpDiv.appendChild(noscriptTag);
  form.appendChild(fpDiv);

  const addHidden = (name: string, value: string) => {
    const el = document.createElement('input');
    el.type = 'hidden';
    el.name = name;
    el.value = value;
    form.appendChild(el);
  };

  for (const [key, value] of Object.entries(checkoutData)) {
    addHidden(key, String(value));
  }

  addHidden('card_number', cardNumber.replace(/\s/g, ''));
  addHidden(
    'card_expiry_date',
    `${expiryMonth.padStart(2, '0')}-${expiryYear}`,
  );
  addHidden('card_cvn', cvv);
  addHidden('card_type', detectCardType(cardNumber));

  document.body.appendChild(form);
  form.submit();
};
