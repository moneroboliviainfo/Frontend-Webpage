'use client';
import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import CheckoutCostSummary from '../CheckoutCostSummary';
import DesktopCartSummary from '../DesktopCartSummary';
import NavBar from '@/components/nav/NavBar';
import { API_URL } from '@/config/env';
import { GenderStorage } from '@/utils/genderStorage';
import { AuthStorage } from '@/utils/authStorage';

interface OrderItem {
  id: number;
  image: string;
  name: string;
  quantity: number;
  color: string;
  size: string;
  price: number;
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

        // Transform API data to match component structure
        setOrderData({
          orderNumber: data.id || orderId,
          selectedCountry: data.address?.country || 'Bolivia',
          selectedDeliveryMethod: data.shipment?.name || 'Envío a terminal',
          formData: {
            name: data.customer?.name || '',
            email: data.customer?.email || '',
            phone: data.customer?.phone || '',
            countryCode: '+591',
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
            image:
              item.variant?.productColor?.multimedia?.[0] ||
              '/clothes/default.jpg',
            name: 'Producto', // Product name not in API response
            quantity: item.quantity || 1,
            color: item.variant?.productColor?.color?.name || '',
            size: item.variant?.size?.name || '',
            price: parseFloat(item.unit_price) || 0,
          }));
          setCartItems(transformedItems);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching order data:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Error al cargar la información del pedido'
        );
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

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

  const formatDeliveryAddress = () => {
    if (orderData.selectedCountry === 'Bolivia') {
      return `${orderData.formData.name}, ${orderData.formData.departamento}\n${orderData.formData.cityProvince}\n${orderData.formData.detailedAddress}\n${orderData.formData.phone}\nBolivia`;
    } else {
      return `${orderData.formData.name}, ${orderData.formData.city}\n${orderData.formData.streetNumber}\n${orderData.formData.postalCode}\n${orderData.formData.phone}\n${orderData.formData.country}`;
    }
  };

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
        {/* Left Content Area - 80% */}
        <div className="flex-1" style={{ width: '80%' }}>
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

              {/* Delivery Method */}
              <div
                className="border-b"
                style={{
                  paddingBottom: '1.5rem',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <div
                  className="font-semibold"
                  style={{
                    fontSize: '1rem',
                    color: '#111827',
                    marginBottom: '0.5rem',
                  }}
                >
                  {orderData.selectedDeliveryMethod}
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}
                >
                  {orderData.selectedCountry === 'Bolivia'
                    ? orderData.selectedDeliveryMethod === 'Envío a terminal'
                      ? 'Recibelo en 24 horas'
                      : orderData.selectedDeliveryMethod === 'Envío a domicilio'
                      ? 'Recibelo en 48 horas'
                      : orderData.selectedDeliveryMethod === 'Envío a provincia'
                      ? 'Recibelo en 72 horas'
                      : 'Recibelo lo más pronto posible hasta su domicilio'
                    : 'Tiempo determinado por DHL'}
                </div>
                <div
                  className="font-semibold"
                  style={{
                    fontSize: '1rem',
                    color: '#111827',
                    marginTop: '0.25rem',
                  }}
                >
                  {orderData.selectedCountry === 'Bolivia'
                    ? orderData.selectedDeliveryMethod === 'Envío a terminal'
                      ? '27.99 €'
                      : orderData.selectedDeliveryMethod === 'Envío a domicilio'
                      ? 'Bs. 50'
                      : orderData.selectedDeliveryMethod === 'Envío a provincia'
                      ? 'Bs. 50'
                      : 'Bs. 60'
                    : 'Costo determinado por DHL cuando lo recibas'}
                </div>
              </div>

              {/* Delivery Address */}
              <div
                className="border-b"
                style={{
                  paddingBottom: '1.5rem',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <div
                  className="font-semibold"
                  style={{
                    fontSize: '1rem',
                    color: '#111827',
                    marginBottom: '0.5rem',
                  }}
                >
                  Dirección de entrega
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    whiteSpace: 'pre-line',
                    lineHeight: '1.5',
                  }}
                >
                  {formatDeliveryAddress()}
                </div>
              </div>

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
                  Estado: En Proceso de Envío
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#10b981',
                    fontWeight: '500',
                  }}
                >
                  Tu pedido está siendo preparado para el envío
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Cart Summary - 20% */}
        <div style={{ width: '20%' }}>
          <DesktopCartSummary
            selectedCountry={orderData.selectedCountry}
            selectedDeliveryMethod={orderData.selectedDeliveryMethod}
          />
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

            {/* Cart Items - Horizontal Scrollable */}
            <div
              className="flex gap-4 overflow-x-auto pb-4"
              style={{
                marginBottom: '2rem',
                scrollSnapType: 'x mandatory',
              }}
            >
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0"
                  style={{
                    width: '120px',
                    scrollSnapAlign: 'start',
                  }}
                >
                  {/* Item Image */}
                  <div
                    className="bg-gray-100 rounded-lg flex items-center justify-center"
                    style={{
                      width: '120px',
                      height: '120px',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div
                      className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center"
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        textAlign: 'center',
                        padding: '0.5rem',
                      }}
                    >
                      {item.name}
                    </div>
                  </div>

                  {/* Item Details */}
                  <div>
                    {/* Product Name - Link */}
                    <Link
                      href="/w/pantalón-slim-102"
                      className="text-left hover:underline"
                      style={{
                        fontSize: '0.875rem',
                        color: '#3b82f6',
                        fontWeight: '500',
                        marginBottom: '0.25rem',
                        display: 'block',
                        width: '100%',
                      }}
                    >
                      {item.name}
                    </Link>

                    {/* Quantity */}
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Cantidad: {item.quantity}
                    </div>

                    {/* Color */}
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Color: {item.color}
                    </div>

                    {/* Size */}
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                      }}
                    >
                      Talla: {item.size}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Method */}
            <div
              className="border-b"
              style={{
                paddingBottom: '1.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <div
                className="font-semibold"
                style={{
                  fontSize: '1rem',
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}
              >
                {orderData.selectedDeliveryMethod}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                }}
              >
                {orderData.selectedCountry === 'Bolivia'
                  ? orderData.selectedDeliveryMethod === 'Envío a terminal'
                    ? 'Recibelo en 24 horas'
                    : orderData.selectedDeliveryMethod === 'Envío a domicilio'
                    ? 'Recibelo en 48 horas'
                    : orderData.selectedDeliveryMethod === 'Envío a provincia'
                    ? 'Recibelo en 72 horas'
                    : 'Recibelo lo más pronto posible hasta su domicilio'
                  : 'Tiempo determinado por DHL'}
              </div>
              <div
                className="font-semibold"
                style={{
                  fontSize: '1rem',
                  color: '#111827',
                  marginTop: '0.25rem',
                }}
              >
                {orderData.selectedCountry === 'Bolivia'
                  ? orderData.selectedDeliveryMethod === 'Envío a terminal'
                    ? '27.99 €'
                    : orderData.selectedDeliveryMethod === 'Envío a domicilio'
                    ? 'Bs. 50'
                    : orderData.selectedDeliveryMethod === 'Envío a provincia'
                    ? 'Bs. 50'
                    : 'Bs. 60'
                  : 'Costo determinado por DHL cuando lo recibas'}
              </div>
            </div>

            {/* Delivery Address */}
            <div
              className="border-b"
              style={{
                paddingBottom: '1.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <div
                className="font-semibold"
                style={{
                  fontSize: '1rem',
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}
              >
                Dirección de entrega
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  whiteSpace: 'pre-line',
                  lineHeight: '1.5',
                }}
              >
                {formatDeliveryAddress()}
              </div>
            </div>

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
                Estado: En Proceso de Envío
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#10b981',
                  fontWeight: '500',
                }}
              >
                Tu pedido está siendo preparado para el envío
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Cost Summary for Mobile */}
        <CheckoutCostSummary
          subtotal={59.98}
          selectedCountry={orderData.selectedCountry}
          deliveryCost={
            orderData.selectedDeliveryMethod === 'Envío a terminal' ? 27.99 : 0
          }
        />
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
