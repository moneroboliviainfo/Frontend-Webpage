'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiMapPin, FiChevronDown, FiCheck, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectBranch,
  selectBranches,
  selectBranchNeedsAttention,
  selectBranchStatus,
  selectSelectedBranch,
} from '@/store/branchSlice';
import './BranchSelector.css';

interface BranchSelectorProps {
  iconsSize?: number;
  iconsStrokeWidth?: number;
}

interface PanelPosition {
  top: number;
  right: number;
  /** Only set when the panel has to span the viewport on a narrow screen. */
  left?: number;
  /**
   * Where the speech-bubble tail goes, measured from the bubble's right edge so
   * it lands under the middle of the pin whichever way the bubble was placed.
   */
  arrowRight: number;
}

const PANEL_GAP = 8;
const VIEWPORT_MARGIN = 16;
const PANEL_MIN_WIDTH = 256;
const ARROW_SIZE = 10;
/** Keeps the tail off the rounded corners. */
const ARROW_EDGE_INSET = 14;

const panelStyle = (pos: PanelPosition): React.CSSProperties => ({
  position: 'fixed',
  top: pos.top,
  right: pos.right,
  ...(pos.left === undefined
    ? { minWidth: PANEL_MIN_WIDTH }
    : { left: pos.left }),
});

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
  const needsAttention = useAppSelector(selectBranchNeedsAttention);

  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [panel, setPanel] = useState<PanelPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Places the floating panel from the trigger's real position.
   *
   * Measured rather than anchored with CSS because neither side works on its
   * own: `absolute right-0` pushed a 16rem panel off the left edge on phones
   * (the trigger sits near the left, and `min-width` beats `max-width`), and a
   * fixed offset would have to guess the navbar height — `--nav-height` is read
   * in several places but never actually defined, and the bar animates on
   * scroll anyway.
   */
  const measurePanel = useCallback(() => {
    const el = containerRef.current;
    if (!el || typeof window === 'undefined') return;

    const rect = el.getBoundingClientRect();
    const top = rect.bottom + PANEL_GAP;
    const triggerCentre = rect.left + rect.width / 2;
    const rightmost = window.innerWidth - PANEL_MIN_WIDTH - VIEWPORT_MARGIN;

    // The tail is placed from the bubble's right edge, which is known in both
    // layouts below, and clamped so it never rides onto a rounded corner.
    const tailFrom = (right: number) =>
      Math.max(
        ARROW_EDGE_INSET,
        window.innerWidth - right - triggerCentre - ARROW_SIZE / 2,
      );

    if (rightmost < VIEWPORT_MARGIN) {
      // Too narrow for the natural width: span the viewport instead.
      setPanel({
        top,
        left: VIEWPORT_MARGIN,
        right: VIEWPORT_MARGIN,
        arrowRight: tailFrom(VIEWPORT_MARGIN),
      });
      return;
    }

    // Hang off the trigger's right edge, but never past the left margin.
    const right = Math.min(
      Math.max(VIEWPORT_MARGIN, window.innerWidth - rect.right),
      rightmost,
    );
    setPanel({ top, right, arrowRight: tailFrom(right) });
  }, []);

  /**
   * The callout is contextual, not a welcome tour: it shows only while
   * something on screen actually needs another store — today, a product sold
   * out in this one. An on-load version nagged on every page, because the
   * navbar is rendered per page and remounts on every navigation.
   *
   * Derived, not stored: there is nothing to synchronise, so an effect would
   * only add a render. Closing it keeps it closed for this page — the navbar is
   * mounted per page, so `dismissed` resets by itself on the next product,
   * which is the behaviour we want anyway.
   */
  const showHint = needsAttention && !dismissed;
  const dismissHint = () => setDismissed(true);

  // Keep it attached while it is open: rotating a phone or resizing a window
  // would otherwise leave the panel floating away from the icon.
  useEffect(() => {
    if (!open && !showHint) return;
    measurePanel();
    window.addEventListener('resize', measurePanel);
    window.addEventListener('scroll', measurePanel, { passive: true });
    return () => {
      window.removeEventListener('resize', measurePanel);
      window.removeEventListener('scroll', measurePanel);
    };
  }, [open, showHint, measurePanel]);

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

  const openList = () => {
    if (showHint) dismissHint();
    measurePanel();
    setOpen((v) => !v);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={openList}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Tienda seleccionada: ${selected.name}. Cambiar`}
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity rounded-full px-2.5 py-1.5 lg:pr-3"
        style={{
          // A solid pill instead of a bare icon: it reads as a control on both
          // navbar states (transparent over photos, and solid white on scroll),
          // which the inherited-colour version did not.
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-white)',
          border: 'none',
        }}
      >
        <span className="relative flex items-center">
          <FiMapPin size={iconsSize} strokeWidth={iconsStrokeWidth} />
          {/* Unread-style dot: the only thing that makes a navbar icon get
              looked at. Goes away for good once the hint is dismissed. */}
          {showHint && (
            <span
              aria-hidden="true"
              className="absolute rounded-full branch-dot"
              style={{
                top: -3,
                right: -4,
                width: 8,
                height: 8,
                backgroundColor: 'var(--color-accent)',
                boxShadow: '0 0 0 2px var(--color-primary)',
              }}
            />
          )}
        </span>
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

      {/* One-time nudge. Anchored like the list: full width on phones, hanging
          off the button from `sm` up. */}
      {showHint && !open && panel && (
        <div
          role="status"
          className="rounded-lg branch-hint"
          style={{
            ...panelStyle(panel),
            minWidth: 0,
            width: 'max-content',
            maxWidth: `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`,
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-white)',
            padding: '0.4375rem 0.5rem 0.4375rem 0.75rem',
            boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
            zIndex: 61,
          }}
        >
          {/* Speech-bubble tail, aimed at the middle of the pin. A rotated
              square rather than a border triangle so it inherits the bubble's
              own colour and needs no second shape for the shadow. */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -ARROW_SIZE / 2,
              right: panel.arrowRight,
              width: ARROW_SIZE,
              height: ARROW_SIZE,
              backgroundColor: 'var(--color-primary)',
              transform: 'rotate(45deg)',
              borderRadius: 2,
            }}
          />
          <div className="flex items-center" style={{ gap: '0.5rem' }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.75rem',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Mira el stock de otra tienda
            </p>
            <button
              type="button"
              onClick={dismissHint}
              aria-label="Entendido, cerrar aviso"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.65)',
                padding: 0,
                lineHeight: 0,
                flexShrink: 0,
              }}
            >
              <FiX size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {open && panel && (
        <div
          role="listbox"
          className="bg-white rounded-lg overflow-hidden"
          style={{
            ...panelStyle(panel),
            maxWidth: `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`,
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
