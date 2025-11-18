import React, { useEffect, useState, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectCartItems } from '@/store/cartSlice';
import { CartItem } from '@/store/types';
import Image from 'next/image';
import NavBarDialog from './NavBarDialog';
import useIsMobile from '@/hooks/useIsMobile';

const CartNavBarDialog: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  const cartItems = useAppSelector(selectCartItems);

  // Memoize mock items to prevent recreation on every render
  const mockItems = useMemo(
    () => [
      {
        itemId: 'mock-1',
        name: 'Chaqueta Derby',
        cost: 116,
        quantity: 1,
        src: '/images/ver-slide-1.png',
        color: {
          colorId: 'black',
          name: 'Negro',
        },
        size: {
          sizeId: 'm',
          name: 'M',
        },
        totalCost: 116,
      },
      {
        itemId: 'mock-2',
        name: 'Blusa Elegante',
        cost: 79,
        quantity: 2,
        src: '/images/ver-slide-2.png',
        color: {
          colorId: 'orange',
          name: 'Naranja',
        },
        size: {
          sizeId: 'l',
          name: 'L',
        },
        totalCost: 158,
      },
      {
        itemId: 'mock-3',
        name: 'Chaqueta Derby',
        cost: 116,
        quantity: 1,
        src: '/images/ver-slide-1.png',
        color: {
          colorId: 'black',
          name: 'Negro',
        },
        size: {
          sizeId: 'm',
          name: 'M',
        },
        totalCost: 116,
      },
      {
        itemId: 'mock-4',
        name: 'Blusa Elegante',
        cost: 79,
        quantity: 2,
        src: '/images/ver-slide-2.png',
        color: {
          colorId: 'orange',
          name: 'Naranja',
        },
        size: {
          sizeId: 'l',
          name: 'L',
        },
        totalCost: 158,
      },
    ],
    []
  );

  const displayItems = cartItems.length > 0 ? cartItems : mockItems;
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [removedItems, setRemovedItems] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [undoData, setUndoData] = useState<{
    itemId: string;
    item: CartItem;
    quantity: number;
  } | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const isMobile = useIsMobile();

  // Initialize quantities for cart items
  useEffect(() => {
    const initialQuantities: { [key: string]: number } = {};
    const itemsToProcess = cartItems.length > 0 ? cartItems : mockItems;
    itemsToProcess.forEach((item) => {
      const key = item.itemId;
      initialQuantities[key] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [cartItems, mockItems]);

  const updateQuantity = (itemId: string, delta: number) => {
    const currentQuantity = quantities[itemId] || 1;
    const newQuantity = currentQuantity + delta;

    if (newQuantity <= 0) {
      // Find the item to store for undo
      const itemToRemove = displayItems.find((item) => item.itemId === itemId);
      if (itemToRemove) {
        // Store undo data
        setUndoData({
          itemId,
          item: itemToRemove,
          quantity: currentQuantity,
        });

        // Mark item as removed
        setRemovedItems((prev) => ({ ...prev, [itemId]: true }));

        // Show undo toast
        setShowUndoToast(true);

        // Auto-hide toast after 5 seconds
        setTimeout(() => {
          setShowUndoToast(false);
          setUndoData(null);
        }, 5000);
      }
    } else {
      setQuantities((prev) => ({
        ...prev,
        [itemId]: newQuantity,
      }));
    }
  };

  const undoRemove = () => {
    if (undoData) {
      // Restore the item
      setRemovedItems((prev) => {
        const newState = { ...prev };
        delete newState[undoData.itemId];
        return newState;
      });

      // Restore quantity
      setQuantities((prev) => ({
        ...prev,
        [undoData.itemId]: undoData.quantity,
      }));

      // Hide toast
      setShowUndoToast(false);
      setUndoData(null);
    }
  };

  const calculateSubtotal = () => {
    return displayItems
      .filter((item) => !removedItems[item.itemId])
      .reduce((total: number, item) => {
        const quantity = quantities[item.itemId] || item.quantity;
        return total + item.cost * quantity;
      }, 0);
  };

  const visibleItems = displayItems.filter(
    (item) => !removedItems[item.itemId]
  );

  return (
    <NavBarDialog open={open} setOpen={setOpen}>
      <div
        className="flex flex-col"
        style={{
          background: 'var(--color-white)',
          height: '100vh',
          position: 'relative',
        }}
      >
        {/* Scrollable clothes section */}
        <div
          className="overflow-y-auto"
          style={{
            padding: '0 2rem',
            flex: 1,
            paddingBottom: displayItems.length > 0 ? '200px' : '0',
          }}
        >
          {visibleItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
            </div>
          ) : (
            visibleItems.map((item, index) => {
              const quantity = quantities[item.itemId] || item.quantity;

              return (
                <div
                  key={item.itemId}
                  className="flex"
                  style={{
                    height: '30vh',
                    padding: '1rem 0',
                    borderBottom:
                      index < visibleItems.length - 1
                        ? '1px solid #f3f4f6'
                        : 'none',
                  }}
                >
                  {/* Left column: Image (50%) */}
                  <div
                    className="flex items-center justify-center rounded-r-sm"
                    style={{
                      width: '50%',
                      paddingRight: '1rem',
                      height: '100%',
                    }}
                  >
                    {item.src ? (
                      <div
                        className="relative w-full h-full"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Image
                          src={item.src}
                          alt={item.name}
                          fill
                          className="object-contain rounded-r-sm"
                          sizes="25vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Right column: Details (50%) */}
                  <div
                    className="flex flex-col justify-between"
                    style={{ width: '50%', paddingLeft: '1rem' }}
                  >
                    {/* Title */}
                    <h3
                      className="font-semibold"
                      style={{
                        fontSize: '1.1rem',
                        lineHeight: '1.3',
                        marginBottom: '0.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.name}
                    </h3>

                    {/* Price */}
                    <div
                      style={{
                        marginBottom: '0.75rem',
                      }}
                    >
                      <span
                        className="font-bold"
                        style={{ fontSize: '1.1rem' }}
                      >
                        Bs. {item.cost}
                      </span>
                    </div>

                    {/* Size and Color */}
                    <div
                      style={{
                        marginBottom: '1rem',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                      }}
                    >
                      <div>Talla: {item.size.name}</div>
                      <div>Color: {item.color.name}</div>
                    </div>

                    {/* Quantity counter */}
                    <div className="flex items-center justify-center">
                      <div
                        className="flex items-center border rounded-r-sm"
                        style={{ border: '1px solid #e5e7eb' }}
                      >
                        <button
                          className="hover:bg-gray-100"
                          onClick={() => updateQuantity(item.itemId, -1)}
                          style={{
                            cursor: 'pointer',
                            padding: '0.5rem 0.75rem',
                          }}
                        >
                          −
                        </button>
                        <span
                          className="font-medium"
                          style={{ minWidth: '3rem', textAlign: 'center' }}
                        >
                          {quantity}
                        </span>
                        <button
                          className="hover:bg-gray-100"
                          onClick={() => updateQuantity(item.itemId, 1)}
                          style={{
                            cursor: 'pointer',
                            padding: '0.5rem 0.75rem',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Fixed bottom section */}
        {visibleItems.length > 0 && (
          <div
            style={{
              position: isMobile ? 'fixed' : 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              borderTop: '1px solid #e5e7eb',
              padding: '2rem',
              backgroundColor: '#fff',
            }}
          >
            {/* Subtotal row */}
            <div
              className="flex justify-between items-center"
              style={{ marginBottom: '0.75rem' }}
            >
              <span className="font-medium">Subtotal</span>
              <span className="font-bold text-lg">
                Bs. {calculateSubtotal().toFixed(2)}
              </span>
            </div>

            {/* Shipping row */}
            <div
              className="flex justify-between items-center"
              style={{ marginBottom: '1.5rem' }}
            >
              <span className="font-medium">Gastos de envío</span>
              <span style={{ color: '#6b7280' }}>A calcularse</span>
            </div>

            {/* Checkout button */}
            <button
              type="button"
              className="w-full font-bold"
              style={{
                backgroundColor: '#000',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              TRAMITAR PEDIDO
            </button>
          </div>
        )}
      </div>

      {/* Undo Toast */}
      {showUndoToast && undoData && (
        <div
          className="fixed bottom-2 text-white rounded-lg shadow-lg flex items-center justify-between"
          style={{
            zIndex: 9999,
            position: 'fixed',
            bottom: '3rem',
            left: '1rem',
            right: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#5ebf9b',
          }}
        >
          {/* Left side: Image and text */}
          <div className="flex items-center" style={{ gap: '0.75rem' }}>
            {/* Item image */}
            <div className="flex-shrink-0">
              <Image
                src={undoData.item.src || '/images/placeholder.jpg'}
                alt={undoData.item.name}
                width={32}
                height={32}
                className="object-cover rounded"
              />
            </div>

            {/* Text */}
            <span className="text-sm">Eliminado</span>
          </div>

          {/* Right side: Undo button */}
          <button
            onClick={undoRemove}
            className="text-white underline text-sm font-medium hover:text-gray-300 transition-colors"
          >
            Deshacer
          </button>
        </div>
      )}
    </NavBarDialog>
  );
};

export default CartNavBarDialog;
