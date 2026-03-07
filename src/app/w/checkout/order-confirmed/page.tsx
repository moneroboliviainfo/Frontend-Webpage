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

      // Front-end only guard for guest orders: require a stored local key for this order
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
        // ignore localStorage errors and continue to fetch (will fail server-side if unauthorized)
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
        const fullPhone = data.customer?.phone || '';
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
            name: data.customer?.name || '',
            email: data.customer?.email || '',
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
              {/* Order Confirmation Title */}
              <div
                className="text-center"
                style={{
                  marginBottom: '1.5rem',
                }}
              >
                <h2
                  className="font-bold"
                  style={{
                    fontSize: '1.5rem',
                    color: '#111827',
                    marginBottom: '0.5rem',
                  }}
                >
                  Confirmamos tu pedido
                </h2>
                <div
                  className="font-medium"
                  style={{
                    fontSize: '1.125rem',
                    color: '#6b7280',
                  }}
                >
                  Pedido: #{orderData.orderNumber}
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
            {/* Order Confirmation Title */}
            <div
              className="text-center"
              style={{
                marginBottom: '1.5rem',
              }}
            >
              <h2
                className="font-bold"
                style={{
                  fontSize: '1.5rem',
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}
              >
                Confirmamos tu pedido
              </h2>
              <div
                className="font-medium"
                style={{
                  fontSize: '1.125rem',
                  color: '#6b7280',
                }}
              >
                Pedido: #{orderData.orderNumber}
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
