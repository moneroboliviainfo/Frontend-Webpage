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
import { selectClient, logout } from '@/store/clientSlice';

interface Order {
  orderId: string;
  date: string;
  total: number;
}

interface Address {
  addressId: string;
  streetName: string;
  streetNumber: string;
  city?: string;
  isDefault?: boolean;
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
    router.push(`/w/checkout/order-confirmed?orderid=${orderId}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
  };

  // Mock data - replace with real data from your store/API
  const orders: Order[] = [
    { orderId: 'ORD-001234', date: '2024-11-20', total: 150.99 },
    { orderId: 'ORD-001235', date: '2024-11-18', total: 89.5 },
    { orderId: 'ORD-001236', date: '2024-11-15', total: 245.0 },
  ];

  const savedAddresses: Address[] = [
    {
      addressId: 'addr-1',
      streetName: 'Calle Principal',
      streetNumber: '123',
      city: 'Madrid',
      isDefault: true,
    },
    {
      addressId: 'addr-2',
      streetName: 'Avenida de la Libertad',
      streetNumber: '456',
      city: 'Barcelona',
      isDefault: false,
    },
    {
      addressId: 'addr-3',
      streetName: 'Plaza Mayor',
      streetNumber: '789',
      city: 'Sevilla',
      isDefault: false,
    },
  ];

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
              {orders.map((order) => (
                <button
                  key={order.orderId}
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
                  onClick={() => handleOrderClick(order.orderId)}
                >
                  <FiShoppingCart size={18} className="text-gray-400" />
                  <div>
                    <p className="text-black font-medium text-sm">
                      N° de pedido: {order.orderId}
                    </p>
                    <p
                      className="text-gray-500"
                      style={{
                        fontSize: '12px',
                        marginTop: '2px',
                      }}
                    >
                      {new Date(order.date).toLocaleDateString('es-ES')} • €
                      {order.total.toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
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
              {savedAddresses.map((address) => (
                <div
                  key={address.addressId}
                  className="flex items-center"
                  style={{
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <FiMapPin size={18} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-black font-medium text-sm">
                      {address.streetName} {address.streetNumber}
                    </p>
                    {address.city && (
                      <p
                        className="text-gray-500"
                        style={{
                          fontSize: '12px',
                          marginTop: '2px',
                        }}
                      >
                        {address.city}
                      </p>
                    )}
                    {address.isDefault && (
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
              ))}
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
