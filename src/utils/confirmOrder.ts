import { createOrder, generateQR, checkForWomenItems } from './orderService';
import { getCart } from '@/shared/storage/cartStorage';
import { FEATURE_FLAGS } from '@/shared/config/features';
import { buildCybersourceBilling } from './cybersourcePayment';
import { type CybersourceBilling } from '@/services/cybersourceService';
import {
  parseInsufficientStockVariantIds,
  isInsufficientStockMessage,
} from './insufficientStock';
import { isSessionExpired } from '@/shared/auth/guestSession';
import type { Shipment, FedexService } from '@/store/checkoutSlice';

/**
 * The checkout form fields this flow needs. Declared structurally rather than
 * imported, because the desktop page and the mobile sheet each carry their own
 * (overlapping) form shape.
 */
export interface ConfirmOrderFormData {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  departamento: string;
  cityProvince: string;
  detailedAddress: string;
  city: string;
  streetNumber: string;
  postalCode: string;
  billingCI?: string;
  billingName?: string;
  billingComplemento?: string;
}

export interface ConfirmOrderInput {
  branchStatus: 'idle' | 'loading' | 'ready' | 'error';
  branchId: number | null;
  addressId: number | null;
  cartToken: string | null;
  fedexShippingToken: string | null;
  formData: ConfirmOrderFormData;
  paymentMethod: 'qr' | 'card';
  selectedShipment: Shipment | null;
  selectedFedexService: FedexService | null;
  selectedCountry: string;
  /** A real account, not the shared guest placeholder. */
  isLoggedIn: boolean;
}

/**
 * What the caller has to render. Every branch is a distinct screen, so the
 * union forces both call sites to handle all of them — which is exactly how
 * the second call site stopped being forgotten.
 */
export type ConfirmOrderResult =
  /** A precondition failed; nothing was sent to the backend. */
  | { status: 'blocked'; message: string }
  /**
   * Order created; collect the card and submit to Cybersource.
   *
   * No amount: the backend derives it from `order.totalPrice`, and the
   * frontend never sends one — that is what stops a tampered total from being
   * charged.
   */
  | { status: 'card'; orderId: number; billing: CybersourceBilling }
  /** Order created; show the QR and poll for payment. */
  | { status: 'qr'; orderId: number; qr: string; gloss: string }
  /** Stock ran out between the reprice and this call. */
  | { status: 'out-of-stock'; variantIds: number[] }
  /**
   * The session was rejected (`401`). Nothing was created. For a guest this
   * means the token is dead and so is the address made with it, so recovery is
   * a new session plus a new address — not a retry.
   */
  | { status: 'session-expired' }
  | { status: 'error'; message: string };

/**
 * Creates the online order and prepares its payment.
 *
 * Deliberately knows nothing about React: it returns what happened instead of
 * calling setters, so the desktop page and the mobile sheet share the risky
 * part — the guards, the request payload, the total, and the error parsing —
 * while each keeps its own modals. Before this existed the whole thing was
 * written twice and the two copies had already drifted.
 */
export async function confirmOrder(
  input: ConfirmOrderInput,
): Promise<ConfirmOrderResult> {
  const {
    branchStatus,
    branchId,
    addressId,
    cartToken,
    fedexShippingToken,
    formData,
    paymentMethod,
    selectedShipment,
    selectedFedexService,
    selectedCountry,
    isLoggedIn,
  } = input;

  // Every quote and sale is tied to a branch: the backend requires branchId
  // and would answer 400, so stop with something the shopper can act on.
  if (branchStatus === 'idle' || branchStatus === 'loading') {
    return {
      status: 'blocked',
      message: 'Verificando disponibilidad de la tienda. Espera un momento.',
    };
  }
  if (!branchId) {
    return {
      status: 'blocked',
      message:
        'No pudimos conectar con la tienda para confirmar tu pedido. Recarga la página e intenta de nuevo.',
    };
  }
  if (!addressId || (!cartToken && !fedexShippingToken)) {
    return {
      status: 'blocked',
      message:
        'Faltan datos de tu pedido. Recargá la página e intentá de nuevo.',
    };
  }

  if (!FEATURE_FLAGS.WOMEN_ENABLED) {
    try {
      if (await checkForWomenItems(getCart().items)) {
        return {
          status: 'blocked',
          message:
            'La compra está temporalmente deshabilitada para prendas de categoría mujeres.',
        };
      }
    } catch {
      // A failed gender lookup must not block a legitimate purchase.
    }
  }

  const phone = `${formData.countryCode} ${formData.phone}`;

  try {
    const order = await createOrder({
      // The FedEx token replaces the cart token once a quote exists: it carries
      // the cart inside.
      items: fedexShippingToken || cartToken || '',
      branchId,
      name: formData.name,
      phone,
      email: formData.email,
      payment_type: paymentMethod === 'card' ? 'card_online' : 'qr',
      selectedServiceType: selectedFedexService?.serviceType,
      billing: {
        ci: formData.billingCI,
        name: formData.billingName,
        phone,
        email: formData.email,
        complemento: formData.billingComplemento || undefined,
        codigoTipoDocumentoIdentidad: 1,
      },
      shipment: selectedShipment ? selectedShipment.id : undefined,
      address: addressId,
    });

    if (paymentMethod === 'card') {
      return {
        status: 'card',
        orderId: order.id,
        billing: buildCybersourceBilling({
          name: formData.name,
          email: formData.email,
          selectedCountry,
          detailedAddress: formData.detailedAddress,
          cityProvince: formData.cityProvince,
          departamento: formData.departamento,
          city: formData.city,
          streetNumber: formData.streetNumber,
          postalCode: formData.postalCode,
          isLoggedIn,
        }),
      };
    }

    const qrResponse = await generateQR(order.id);
    return {
      status: 'qr',
      orderId: order.id,
      qr: qrResponse.qr,
      gloss: qrResponse.gloss || '',
    };
  } catch (error) {
    console.error('Error creating order or preparing payment:', error);

    // Checked before anything else: a rejected session is not a problem with
    // the order, and retrying with the same token can never work.
    if (isSessionExpired(error)) return { status: 'session-expired' };

    const message = error instanceof Error ? error.message : '';

    // The reprice can pass and this call still fail: another customer may have
    // taken the last unit in between.
    const variantIds = parseInsufficientStockVariantIds(message);
    if (variantIds.length > 0) return { status: 'out-of-stock', variantIds };
    if (isInsufficientStockMessage(message)) {
      return { status: 'out-of-stock', variantIds: [] };
    }

    return {
      status: 'error',
      message: message || 'No se pudo crear la orden. Intentá de nuevo.',
    };
  }
}
