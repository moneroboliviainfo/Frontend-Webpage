'use client';
import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import DesktopCartSummary from '../DesktopCartSummary';
import OrderItemsList from '../OrderItemsList';
import OrderTotalDisplay from '../OrderTotalDisplay';
import DeliveryMethodDisplay from '../DeliveryMethodDisplay';
import DeliveryAddressDisplay from '../DeliveryAddressDisplay';
import OrderProgressIndicator from '../OrderProgressIndicator';
import NavBar from '@/components/nav/NavBar';
import { API_URL } from '@/config/env';
import { GenderStorage } from '@/utils/genderStorage';
import { AuthStorage } from '@/utils/authStorage';
import { INVALID_CONFIRMATION_STATUSES } from '@/constants/orders';
import { useAppSelector } from '@/store/hooks';
import { selectClient } from '@/store/clientSlice';
import { hasGuestOrderAccess } from '@/utils/guestOrderAccess';

interface OrderItem {
  id: number;
  variantId?: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  colorName: string;
  sizeName: string;
  price: number;
  finalPrice: number;
}

interface ApiOrderItem {
  id: number;
  quantity: number;
  unit_price: string;
  discountValue: number;
  totalPrice: string;
  variant?: {
    id: number;
    size?: {
      id: number;
      name: string;
    };
    productColor?: {
      id: number;
      multimedia: string[];
      color?: {
        id: number;
        name: string;
        code: string;
      };
    };
  };
}

interface OrderData {
  orderNumber: string;
  selectedCountry: string;
  selectedDeliveryMethod: string;
  subtotal: number;
  deliveryCost: number;
  total: number;
  status: string;
  formData: {
    name: string;
    email: string;
    phone: string;
    countryCode: string;
    country: string;
    departamento: string;
    cityProvince: string;
    detailedAddress: string;
    city: string;
    streetNumber: string;
    postalCode: string;
  };
}

const OrderConfirmedContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const client = useAppSelector(selectClient);

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        setError('No se encontró el ID del pedido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = AuthStorage.getToken();
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}customers/order/${orderId}`, {
          headers,
        });

        if (!response.ok) {
          throw new Error('No se pudo cargar la información del pedido');
        }

        const data = await response.json();

        // Determine if this order was created by the guest placeholder account
        const isGuestOrder = data?.customer?.email === 'guest@moneroget.com';
        // If it's a guest order and the current browser/user is not a logged-in non-guest,
        // require the previously saved local access key for this order.
        if (isGuestOrder) {
          try {
            const localAllowed = hasGuestOrderAccess(orderId);
            const isLoggedInNonGuest = !!(
              client &&
              client.email &&
              client.email !== 'guest@moneroget.com'
            );
            if (!isLoggedInNonGuest && !localAllowed) {
              setError('No autorizado para ver este pedido');
              setIsLoading(false);
              return;
            }
          } catch (e) {
            // ignore localStorage errors and continue to set error if unauthorized
            setError('No autorizado para ver este pedido');
            setIsLoading(false);
            return;
          }
        }

        // Check if order status is pending or expired - redirect to last gender page
        if (
          data.status &&
          INVALID_CONFIRMATION_STATUSES.includes(data.status)
        ) {
          const lastGender = GenderStorage.getGender();
          router.push(`/${lastGender}`);
          return;
        }

        // Transform API data to match component structure
        const totalPrice = parseFloat(data.totalPrice) || 0;
        const shipmentPrice = parseFloat(data.shipment_price) || 0;
        const calculatedSubtotal = totalPrice - shipmentPrice;

        // Split phone to extract country code
        const fullPhone = isGuestOrder
          ? data.name_phone.phone || ''
          : data.customer?.phone || '';
        let countryCode = '+591';
        let phone = fullPhone;

        if (fullPhone) {
          const phoneMatch = fullPhone.match(/^(\+\d+)\s*(.+)$/);
          if (phoneMatch) {
            countryCode = phoneMatch[1];
            phone = phoneMatch[2];
          }
        }

        setOrderData({
          orderNumber: data.id || orderId,
          selectedCountry: data.address?.country || 'Bolivia',
          selectedDeliveryMethod: data.shipment?.name || 'Envío a terminal',
          subtotal: calculatedSubtotal,
          deliveryCost: shipmentPrice,
          total: totalPrice,
          status: data.status || '',
          formData: {
            name: isGuestOrder
              ? data.name_phone.name || ''
              : data.customer?.name || '',
            // For guest orders prefer the purchaser email returned in `data.email`.
            email: isGuestOrder ? data.email || '' : data.customer?.email || '',
            phone: phone,
            countryCode: countryCode,
            country: data.address?.country || 'Bolivia',
            departamento: '',
            cityProvince: data.address?.city || '',
            detailedAddress: data.address?.address || '',
            city: data.address?.city || '',
            streetNumber: data.address?.address || '',
            postalCode: data.address?.postal_code || '',
          },
        });

        // Transform cart items
        if (data.items && Array.isArray(data.items)) {
          const transformedItems = data.items.map((item: ApiOrderItem) => ({
            id: item.id,
            variantId: item.variant?.id,
            productName: 'Producto', // Product name not in API response
            imageUrl:
              item.variant?.productColor?.multimedia?.[0] ||
              '/clothes/default.jpg',
            quantity: item.quantity || 1,
            colorName: item.variant?.productColor?.color?.name || '',
            sizeName: item.variant?.size?.name || '',
            price: parseFloat(item.unit_price) || 0,
            finalPrice:
              parseFloat(item.totalPrice) || parseFloat(item.unit_price) || 0,
          }));
          setCartItems(transformedItems);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching order data:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Error al cargar la información del pedido',
        );
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, client]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Cargando información del pedido...
          </p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 mb-4" style={{ fontSize: '3rem' }}>
            ⚠️
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Error al cargar el pedido
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              const lastGender = GenderStorage.getGender();
              router.push(`/${lastGender}`);
            }}
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        paddingTop: 'var(--nav-height, 60px)',
      }}
    >
      {/* NavBar with white background */}
      <NavBar dynamicTransparent={false} />
      {/* Full width black line below navbar */}
      <div
        className="w-full fixed z-40"
        style={{
          backgroundColor: 'black',
          padding: '0.5px',
          top: 'var(--nav-height, 60px)',
        }}
      ></div>

      {/* Desktop Layout */}
      <div
        className="hidden lg:flex"
        style={{ minHeight: 'calc(100vh - 60px)' }}
      >
        {/* Content Area - Full Width */}
        <div className="flex-1" style={{ width: '100%' }}>
          {/* Centered Content */}
          <div className="flex justify-center" style={{ padding: '2rem' }}>
            <div style={{ maxWidth: '600px', width: '100%' }}>
              {/* Success Banner */}
              <div
                className="text-center"
                style={{
                  marginBottom: '1.5rem',
                }}
              >
                {/* Green Success Circle with Check */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                </div>

                {/* Success Message Box */}
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #10b981',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <p
                    style={{
                      color: '#065f46',
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      margin: 0,
                      marginBottom: '0.5rem',
                    }}
                  >
                    ¡Compra realizada con éxito!
                  </p>
                  <h2
                    className="font-bold"
                    style={{
                      fontSize: '1.5rem',
                      color: '#111827',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Confirmamos tu pedido
                  </h2>
                  <div
                    className="font-medium"
                    style={{
                      fontSize: '1.125rem',
                      color: '#065f46',
                    }}
                  >
                    Pedido: #{orderData.orderNumber}
                  </div>
                </div>

                {/* Email Notice */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 7L2 7" />
                  </svg>
                  <p
                    style={{
                      color: '#4b5563',
                      fontSize: '0.875rem',
                      margin: 0,
                    }}
                  >
                    Revisa tu correo para información sobre tu pedido y factura
                  </p>
                </div>
              </div>

              {/* Order Progress Indicator */}
              <OrderProgressIndicator status={orderData.status} />

              {/* Order Items Summary */}
              <OrderItemsList
                items={cartItems}
                layout="vertical"
                showTitle={true}
                title="Resumen de la orden:"
              />

              {/* Order Totals */}
              <div style={{ marginBottom: '1.5rem' }}>
                <OrderTotalDisplay
                  subtotal={orderData.subtotal}
                  deliveryCost={orderData.deliveryCost}
                  total={orderData.total}
                  showDeliveryCostMessage={
                    orderData.selectedCountry !== 'Bolivia'
                  }
                  deliveryCostMessage="Costo determinado por DHL cuando lo recibas"
                />
              </div>

              {/* Delivery Method */}
              <DeliveryMethodDisplay
                deliveryMethod={orderData.selectedDeliveryMethod}
                country={orderData.selectedCountry}
                price={orderData.deliveryCost}
                showTitle={true}
              />

              {/* Delivery Address */}
              <DeliveryAddressDisplay
                formData={orderData.formData}
                country={orderData.selectedCountry}
                showTitle={true}
              />

              {/* Order Status */}
              <div
                style={{
                  paddingBottom: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <div
                  className="font-semibold"
                  style={{
                    fontSize: '1.125rem',
                    color: '#111827',
                    marginBottom: '0.5rem',
                  }}
                >
                  {orderData.status === 'sent'
                    ? 'Estado: Enviado'
                    : 'Estado: En Proceso de Envío'}
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#10b981',
                    fontWeight: '500',
                  }}
                >
                  {orderData.status === 'sent'
                    ? 'Tu pedido fué enviado lo recibiras muy pronto'
                    : 'Tu pedido está siendo preparado para el envío'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Main Content */}
        <div
          className="flex-1 overflow-y-auto flex justify-center"
          style={{ padding: '2rem', paddingBottom: '8rem' }}
        >
          <div style={{ maxWidth: '600px', width: '100%' }}>
            {/* Success Banner */}
            <div
              className="text-center"
              style={{
                marginBottom: '1.5rem',
              }}
            >
              {/* Green Success Circle with Check */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>

              {/* Success Message Box */}
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #10b981',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                }}
              >
                <p
                  style={{
                    color: '#065f46',
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    margin: 0,
                    marginBottom: '0.5rem',
                  }}
                >
                  ¡Compra realizada con éxito!
                </p>
                <h2
                  className="font-bold"
                  style={{
                    fontSize: '1.5rem',
                    color: '#111827',
                    marginBottom: '0.25rem',
                  }}
                >
                  Confirmamos tu pedido
                </h2>
                <div
                  className="font-medium"
                  style={{
                    fontSize: '1.125rem',
                    color: '#065f46',
                  }}
                >
                  Pedido: #{orderData.orderNumber}
                </div>
              </div>

              {/* Email Notice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 7L2 7" />
                </svg>
                <p
                  style={{
                    color: '#4b5563',
                    fontSize: '0.875rem',
                    margin: 0,
                  }}
                >
                  Revisa tu correo para información sobre tu pedido y factura
                </p>
              </div>
            </div>

            {/* Order Progress Indicator */}
            <OrderProgressIndicator status={orderData.status} />

            {/* Cart Items - Horizontal Scrollable */}
            <OrderItemsList
              items={cartItems}
              layout="horizontal"
              showTitle={true}
            />

            {/* Order Totals */}
            <div style={{ marginBottom: '1.5rem' }}>
              <OrderTotalDisplay
                subtotal={orderData.subtotal}
                deliveryCost={orderData.deliveryCost}
                total={orderData.total}
                showDeliveryCostMessage={
                  orderData.selectedCountry !== 'Bolivia'
                }
                deliveryCostMessage="Costo determinado por DHL cuando lo recibas"
              />
            </div>

            {/* Delivery Method */}
            <DeliveryMethodDisplay
              deliveryMethod={orderData.selectedDeliveryMethod}
              country={orderData.selectedCountry}
              price={orderData.deliveryCost}
              showTitle={true}
            />

            {/* Delivery Address */}
            <DeliveryAddressDisplay
              formData={orderData.formData}
              country={orderData.selectedCountry}
              showTitle={true}
            />

            {/* Order Status */}
            <div
              style={{
                paddingBottom: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              <div
                className="font-semibold"
                style={{
                  fontSize: '1.125rem',
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}
              >
                {orderData.status === 'sent'
                  ? 'Estado: Enviado'
                  : 'Estado: En Proceso de Envío'}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#10b981',
                  fontWeight: '500',
                }}
              >
                {orderData.status === 'sent'
                  ? 'Tu pedido fué enviado lo recibiras muy pronto'
                  : 'Tu pedido está siendo preparado para el envío'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderConfirmedPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando confirmación...</p>
          </div>
        </div>
      }
    >
      <OrderConfirmedContent />
    </Suspense>
  );
};

export default OrderConfirmedPage;
