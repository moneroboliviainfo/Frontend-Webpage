import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  FiChevronDown,
  FiChevronUp,
  FiShoppingCart,
  FiUser,
  FiMapPin,
  FiLogOut,
} from 'react-icons/fi';

import NavBarDialog from './NavBarDialog';
import GoogleLoginButton from '../GoogleLoginButton';
import { selectClient, logout } from '@/store/clientSlice';
import { normalizePlaceName } from '@/utils/addressService';

interface Order {
  id: number;
  type: string;
  status: 'expired' | 'pending' | 'paid' | 'sent';
  payment_type: string;
  enabled: boolean;
  shipment_price: number;
  totalPrice: string;
  address_data: unknown;
  dhl_code: string | null;
  expiresAt: string;
  createdAt: string | null;
}

const ProfileNavBarDialog: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  const client = useSelector(selectClient);
  const dispatch = useDispatch();
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleOrderClick = (orderId: string) => {
    setOpen(false); // Close the dialog first
    router.push(`/w/checkout/order-confirmed?orderId=${orderId}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
  };

  // Get orders and addresses from authenticated user - with safe fallbacks
  const orders: Order[] =
    client?.orders && Array.isArray(client.orders) ? client.orders : [];
  const savedAddresses =
    client?.address && Array.isArray(client.address) ? client.address : [];

  // If user is not logged in, show only Google login button
  if (!client) {
    return (
      <NavBarDialog open={open} setOpen={setOpen}>
        <div
          className="flex items-center justify-center h-[70vh] bg-white"
          style={{
            padding: '24px',
          }}
        >
          <GoogleLoginButton />
        </div>
      </NavBarDialog>
    );
  }

  // Helper function to get status label
  const getOrderStatusLabel = (status: Order['status']): string => {
    switch (status) {
      case 'expired':
        return 'Cancelado por falta de pago';
      case 'pending':
        return 'Pendiente de pago';
      case 'paid':
        return 'Pagada - En preparación para envío';
      case 'sent':
        return 'Enviado';
      default:
        return status;
    }
  };

  // Helper function to get status color
  const getOrderStatusColor = (status: Order['status']): string => {
    switch (status) {
      case 'expired':
        return '#ef4444'; // red
      case 'pending':
        return '#f59e0b'; // amber
      case 'paid':
        return '#3b82f6'; // blue
      case 'sent':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const ExpandableCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    sectionKey: string;
    children: React.ReactNode;
  }> = ({ title, icon, sectionKey, children }) => {
    const isExpanded = expandedSection === sectionKey;

    return (
      <div className="w-full">
        <button
          className="w-full flex items-center text-left hover:bg-gray-50 transition-colors"
          style={{
            padding: '20px 24px',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center" style={{ gap: '16px' }}>
            <div className="text-black">{icon}</div>
            <span className="text-black font-medium text-base">{title}</span>
          </div>
          <div className="text-gray-400">
            {isExpanded ? (
              <FiChevronUp size={20} />
            ) : (
              <FiChevronDown size={20} />
            )}
          </div>
        </button>
        {isExpanded && (
          <div
            className="bg-gray-50"
            style={{
              paddingLeft: '24px',
              paddingRight: '24px',
              paddingBottom: '20px',
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <NavBarDialog open={open} setOpen={setOpen}>
      <div
        className="flex flex-col h-[70vh] bg-white"
        style={{
          paddingTop: '24px',
        }}
      >
        {/* Header */}
        <div
          className="border-b border-gray-200"
          style={{
            paddingLeft: '24px',
            paddingRight: '24px',
            paddingBottom: '24px',
            marginBottom: '8px',
          }}
        >
          <h1
            className="text-black font-bold"
            style={{
              fontSize: '28px',
              marginBottom: '4px',
            }}
          >
            Hi
          </h1>
          <p
            className="text-blue-600"
            style={{
              fontSize: '14px',
            }}
          >
            {client ? client.email : 'info@alvaroz.in'}
          </p>
        </div>

        {/* Expandable sections */}
        <div className="flex-1 overflow-y-auto">
          {/* Mis compras */}
          <ExpandableCard
            title="Mis compras"
            icon={<FiShoppingCart size={24} />}
            sectionKey="purchases"
          >
            <div style={{ paddingTop: '16px' }}>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <button
                    key={order.id}
                    className="flex items-center w-full text-left hover:bg-gray-100 transition-colors"
                    style={{
                      gap: '12px',
                      marginBottom: '16px',
                      padding: '8px',
                      borderRadius: '4px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleOrderClick(order.id.toString())}
                  >
                    <FiShoppingCart size={18} className="text-gray-400" />
                    <div className="flex-1">
                      <p className="text-black font-medium text-sm">
                        N° de pedido: {order.id}
                      </p>
                      {order.createdAt && (
                        <p
                          className="text-gray-500"
                          style={{
                            fontSize: '12px',
                            marginTop: '2px',
                          }}
                        >
                          {new Date(order.createdAt).toLocaleDateString(
                            'es-ES'
                          )}
                        </p>
                      )}
                      <p
                        style={{
                          fontSize: '12px',
                          marginTop: '4px',
                          color: getOrderStatusColor(order.status),
                          fontWeight: '500',
                        }}
                      >
                        {getOrderStatusLabel(order.status)}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p
                  className="text-gray-500"
                  style={{
                    fontSize: '14px',
                  }}
                >
                  No hay órdenes disponibles
                </p>
              )}
            </div>
          </ExpandableCard>

          {/* Personal details */}
          <ExpandableCard
            title="Datos personales"
            icon={<FiUser size={24} />}
            sectionKey="personal"
          >
            <div style={{ paddingTop: '16px' }}>
              {client ? (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <p
                      className="text-gray-600 font-medium"
                      style={{ fontSize: '12px' }}
                    >
                      Nombre
                    </p>
                    <p
                      className="text-black"
                      style={{
                        fontSize: '14px',
                        marginTop: '2px',
                      }}
                    >
                      {client.name}
                    </p>
                  </div>
                  {client.phone && (
                    <div style={{ marginBottom: '12px' }}>
                      <p
                        className="text-gray-600 font-medium"
                        style={{ fontSize: '12px' }}
                      >
                        Teléfono
                      </p>
                      <p
                        className="text-black"
                        style={{
                          fontSize: '14px',
                          marginTop: '2px',
                        }}
                      >
                        {client.phone}
                      </p>
                    </div>
                  )}
                  <div style={{ marginBottom: '12px' }}>
                    <p
                      className="text-gray-600 font-medium"
                      style={{ fontSize: '12px' }}
                    >
                      Email
                    </p>
                    <p
                      className="text-black"
                      style={{
                        fontSize: '14px',
                        marginTop: '2px',
                      }}
                    >
                      {client.email}
                    </p>
                  </div>
                </>
              ) : (
                <p
                  className="text-gray-500"
                  style={{
                    fontSize: '14px',
                  }}
                >
                  No hay datos personales disponibles
                </p>
              )}
            </div>
          </ExpandableCard>

          {/* Saved addresses */}
          <ExpandableCard
            title="Direcciones guardadas"
            icon={<FiMapPin size={24} />}
            sectionKey="addresses"
          >
            <div style={{ paddingTop: '16px' }}>
              {savedAddresses.length > 0 ? (
                savedAddresses.map((address, index) => (
                  <div
                    key={address.id}
                    className="flex items-center"
                    style={{
                      gap: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    <FiMapPin size={18} className="text-gray-400" />
                    <div className="flex-1">
                      <p className="text-black font-medium text-sm">
                        {address.address}
                      </p>
                      <p
                        className="text-gray-500"
                        style={{
                          fontSize: '12px',
                          marginTop: '2px',
                        }}
                      >
                        {address.city}, {address.country}
                      </p>
                      {address.place && (
                        <p
                          className="text-gray-500"
                          style={{
                            fontSize: '12px',
                            marginTop: '2px',
                          }}
                        >
                          {normalizePlaceName(address.place.place)}
                        </p>
                      )}
                      {address.postal_code && (
                        <p
                          className="text-gray-500"
                          style={{
                            fontSize: '12px',
                            marginTop: '2px',
                          }}
                        >
                          CP: {address.postal_code}
                        </p>
                      )}
                      {index === 0 && (
                        <span
                          className="inline-block bg-blue-100 text-blue-800 rounded-full"
                          style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            marginTop: '4px',
                          }}
                        >
                          Predeterminada
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p
                  className="text-gray-500"
                  style={{
                    fontSize: '14px',
                  }}
                >
                  No hay direcciones guardadas
                </p>
              )}
            </div>
          </ExpandableCard>
        </div>

        {/* Fixed bottom logout button */}
        <div
          className="border-t border-gray-200 bg-white"
          style={{
            padding: '16px 24px',
            position: 'sticky',
            bottom: 0,
          }}
        >
          <button
            className="w-full flex items-center text-left hover:bg-gray-50 transition-colors"
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              gap: '12px',
            }}
            onClick={handleLogout}
          >
            <FiLogOut size={20} className="text-gray-600" />
            <span className="text-gray-800 font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </NavBarDialog>
  );
};

export default ProfileNavBarDialog;
