'use client';
import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CheckoutCostSummary from '../CheckoutCostSummary';
import DesktopCartSummary from '../DesktopCartSummary';
import NavBar from '@/components/nav/NavBar';

const OrderConfirmedPage: React.FC = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '12345678'; // Fallback to default if no orderId

  // Mock order data - in real app this would come from URL params or API
  const orderData = {
    orderNumber: orderId,
    selectedCountry: 'Bolivia',
    selectedDeliveryMethod: 'Envío a terminal',
    formData: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '70123456',
      countryCode: '+591',
      country: 'Bolivia',
      departamento: 'La Paz',
      cityProvince: 'La Paz',
      detailedAddress: 'Av. 6 de Agosto #123, Zona San Miguel',
      city: '',
      streetNumber: '',
      postalCode: '',
    },
  };

  // Mock cart items with additional details
  const cartItems = [
    {
      id: 1,
      image: '/clothes/jacket-1.jpg',
      name: 'Blue Jacket',
      quantity: 1,
      color: 'Azul',
      size: 'M',
      price: 29.99,
    },
    {
      id: 2,
      image: '/clothes/pants-1.jpg',
      name: 'Black Pants',
      quantity: 1,
      color: 'Negro',
      size: 'L',
      price: 29.99,
    },
  ];

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

export default OrderConfirmedPage;
