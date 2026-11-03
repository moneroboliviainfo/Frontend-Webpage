'use client';
import React, { useEffect, useRef, useState } from 'react';
import { FiMapPin, FiChevronDown, FiCheck } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectBranch,
  selectBranches,
  selectBranchStatus,
  selectSelectedBranch,
} from '@/store/branchSlice';

interface BranchSelectorProps {
  iconsSize?: number;
  iconsStrokeWidth?: number;
}

/**
 * Lets the customer pick which store serves them: it decides the stock shown
 * and which branch invoices the sale.
 *
 * Deliberately worded around availability rather than "branch" — a shopper does
 * not think in branches, and the backend concept would mean nothing to them.
 */
const BranchSelector: React.FC<BranchSelectorProps> = ({
  iconsSize = 20,
  iconsStrokeWidth = 1.5,
}) => {
  const dispatch = useAppDispatch();
  const branches = useAppSelector(selectBranches);
  const selected = useAppSelector(selectSelectedBranch);
  const status = useAppSelector(selectBranchStatus);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // Nothing useful to show while loading, and on failure the checkout already
  // explains that ordering is unavailable.
  if (status !== 'ready' || !selected) return null;

  const handleSelect = (id: number) => {
    setOpen(false);
    if (id !== selected.id) dispatch(selectBranch(id));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Tienda seleccionada: ${selected.name}. Cambiar`}
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
        style={{ color: 'inherit', background: 'none', border: 'none' }}
      >
        <FiMapPin size={iconsSize} strokeWidth={iconsStrokeWidth} />
        <span
          className="hidden lg:inline text-sm font-medium truncate"
          style={{ maxWidth: '11rem' }}
        >
          {selected.name}
        </span>
        <FiChevronDown
          size={14}
          strokeWidth={2}
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 bg-white rounded-lg overflow-hidden"
          style={{
            top: 'calc(100% + 0.5rem)',
            minWidth: '16rem',
            maxWidth: 'calc(100vw - 2rem)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            zIndex: 60,
          }}
        >
          <p
            className="px-4 pt-3 pb-2"
            style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}
          >
            Viendo disponibilidad y envíos de:
          </p>
          {branches.map((branch) => {
            const isSelected = branch.id === selected.id;
            return (
              <button
                key={branch.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(branch.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#111827',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <span>{branch.name}</span>
                {isSelected && (
                  <FiCheck
                    size={16}
                    strokeWidth={2.5}
                    style={{ color: 'var(--color-primary)', flexShrink: 0 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BranchSelector;
