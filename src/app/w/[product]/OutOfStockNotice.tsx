'use client';
import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectBranches, selectSelectedBranch } from '@/store/branchSlice';

/**
 * Shown when every size of the selected colour is out of stock.
 *
 * It names the branch on purpose: the garment is not sold out everywhere, it is
 * sold out *here*, and stock is what the chosen branch has. Saying "AGOTADO"
 * flat would be wrong the moment a second store exists.
 *
 * Deliberately has no button. There is no public endpoint telling us where else
 * a variant is available (`variants/branch-stock` is staff-only), so any
 * "try another store" action today would send the customer hunting blind.
 *
 * Shared by both layouts: each used to carry its own copy of this message and
 * both ended up commented out, which is why a sold-out product said nothing at
 * all.
 */
const OutOfStockNotice: React.FC = () => {
  const branch = useAppSelector(selectSelectedBranch);
  const branches = useAppSelector(selectBranches);

  // Only suggest switching when there is somewhere to switch to. With a single
  // store the hint would send the customer looking for a selector that offers
  // nothing. It starts appearing on its own the day a second store opens.
  const canSwitchStores = branches.length > 1;

  return (
    <div
      role="status"
      className="flex items-start"
      style={{
        gap: '0.625rem',
        padding: '0.875rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid #fecaca',
        backgroundColor: '#fef2f2',
      }}
    >
      <span
        aria-hidden="true"
        style={{ fontSize: '1.1rem', lineHeight: 1.2, flexShrink: 0 }}
      >
        ⚠️
      </span>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: '#991b1b',
            lineHeight: 1.3,
          }}
        >
          {branch ? `Sin stock en ${branch.name}` : 'Sin stock por el momento'}
        </p>
        <p
          style={{
            margin: '0.25rem 0 0',
            fontSize: '0.8125rem',
            color: '#b91c1c',
            lineHeight: 1.35,
          }}
        >
         
          {canSwitchStores && (
            <>
              {' '}
              Cambia de tienda con el <strong>📍 de arriba</strong> para buscar
              en otra sucursal.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default OutOfStockNotice;
