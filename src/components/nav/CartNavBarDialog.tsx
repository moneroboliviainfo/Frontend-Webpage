import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NavBarDialog from './NavBarDialog';
import useIsMobile from '@/hooks/useIsMobile';
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
} from '@/utils/cartStorage';
import type { CartItem } from '@/types/cart';
import buildProductSlug from '@/utils/buildProductSlug';

const CartNavBarDialog: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [removedItems, setRemovedItems] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [undoData, setUndoData] = useState<{
    itemKey: string;
    item: CartItem;
  } | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const isMobile = useIsMobile();

  // Load cart items from localStorage
  useEffect(() => {
    const loadCart = () => {
      const cart = getCart();
      setCartItems(cart.items);
    };

    loadCart();
    // Reload cart when dialog opens
    if (open) {
      loadCart();
    }
  }, [open]);

  const getItemKey = (item: CartItem) => `${item.variantId}-${item.sizeName}`;

  const updateQuantity = (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      const itemKey = getItemKey(item);
      // Store undo data
      setUndoData({
        itemKey,
        item,
      });

      // Mark item as removed
      setRemovedItems((prev) => ({ ...prev, [itemKey]: true }));

      // Remove from localStorage
      removeFromCart(item.variantId, item.sizeName);

      // Update local state
      setCartItems((prev) => prev.filter((i) => getItemKey(i) !== itemKey));

      // Show undo toast
      setShowUndoToast(true);

      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setShowUndoToast(false);
        setUndoData(null);
      }, 5000);
    } else {
      // Update quantity in localStorage
      updateCartItemQuantity(item.variantId, item.sizeName, newQuantity);

      // Update local state
      setCartItems((prev) =>
        prev.map((i) =>
          getItemKey(i) === getItemKey(item)
            ? { ...i, quantity: newQuantity }
            : i
        )
      );
    }
  };

  const undoRemove = () => {
    if (undoData) {
      // Restore the item in localStorage
      const { item } = undoData;
      updateCartItemQuantity(item.variantId, item.sizeName, item.quantity);

      // Restore in local state
      setCartItems((prev) => {
        const itemKey = getItemKey(item);
        const exists = prev.some((i) => getItemKey(i) === itemKey);
        if (exists) {
          return prev;
        }
        return [...prev, item];
      });

      // Remove from removed items
      setRemovedItems((prev) => {
        const newState = { ...prev };
        delete newState[undoData.itemKey];
        return newState;
      });

      // Hide toast
      setShowUndoToast(false);
      setUndoData(null);
    }
  };

  const calculateSubtotal = () => {
    return cartItems
      .filter((item) => !removedItems[getItemKey(item)])
      .reduce((total: number, item) => {
        return total + item.finalPrice * item.quantity;
      }, 0);
  };

  const visibleItems = cartItems.filter(
    (item) => !removedItems[getItemKey(item)]
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
            paddingBottom: cartItems.length > 0 ? '200px' : '0',
          }}
        >
          {visibleItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
            </div>
          ) : (
            visibleItems.map((item, index) => {
              return (
                <div
                  key={getItemKey(item)}
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
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      const slug = buildProductSlug(
                        item.productName,
                        item.productId
                      );
                      setOpen(false);
                      router.push(
                        `/w/${encodeURIComponent(
                          slug
                        )}?colorCode=${encodeURIComponent(item.colorCode)}`
                      );
                    }}
                  >
                    {item.imageUrl ? (
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
                          src={item.imageUrl}
                          alt={item.productName}
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
                      {item.productName}
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
                        Bs. {item.finalPrice}
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
                      <div>Talla: {item.sizeName}</div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span>Color:</span>
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: item.colorCode,
                            border: '1px solid #e5e7eb',
                          }}
                        />
                        <span>{item.colorName}</span>
                      </div>
                    </div>

                    {/* Quantity counter */}
                    <div className="flex items-center justify-center">
                      <div
                        className="flex items-center border rounded-r-sm"
                        style={{ border: '1px solid #e5e7eb' }}
                      >
                        <button
                          className="hover:bg-gray-100"
                          onClick={() => updateQuantity(item, -1)}
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
                          {item.quantity}
                        </span>
                        <button
                          className="hover:bg-gray-100"
                          onClick={() => updateQuantity(item, 1)}
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
              onClick={() => {
                setOpen(false);
                window.location.href = '/w/checkout';
              }}
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
              PROCESAR ORDEN
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
                src={undoData.item.imageUrl || '/images/placeholder.jpg'}
                alt={undoData.item.productName}
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
