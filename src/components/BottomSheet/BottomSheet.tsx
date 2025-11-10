'use client';
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import './BottomSheet.css';

type Props = {
  initialHeightVh?: number; // collapsed height in vh
  expandedHeightVh?: number; // expanded height in vh (used to calculate max)
  children?: React.ReactNode;
  onExpandedChange?: (expanded: boolean) => void;
};

function BottomSheet(
  props: Props,
  ref: React.ForwardedRef<{ expand: () => void; collapse: () => void }>
) {
  const {
    initialHeightVh = 18,
    expandedHeightVh = 80,
    children,
    onExpandedChange,
  } = props;
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef<number | null>(null);
  const startTranslateRef = useRef<number>(0);
  const [translateY, setTranslateY] = useState<number>(0); // px
  const [collapsedTranslate, setCollapsedTranslate] = useState<number>(0);
  const [expandedTranslate, setExpandedTranslate] = useState<number>(0);

  useEffect(() => {
    const calc = () => {
      const vh = window.innerHeight;
      const sheetMaxHeight = Math.round((expandedHeightVh / 100) * vh);
      const collapsedHeight = Math.round((initialHeightVh / 100) * vh);
      const collapsedTr = sheetMaxHeight - collapsedHeight; // translate when collapsed
      setCollapsedTranslate(collapsedTr);
      setExpandedTranslate(0);
      setTranslateY(collapsedTr);
      // expose CSS var for consumers
      try {
        document.documentElement.style.setProperty(
          '--bottom-sheet-height',
          `${sheetMaxHeight}px`
        );
      } catch {}
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [initialHeightVh, expandedHeightVh]);

  useEffect(() => {
    const onMove = (clientY: number) => {
      if (startYRef.current == null) return;
      const dy = clientY - startYRef.current;
      let next = startTranslateRef.current + dy;
      // clamp between expandedTranslate (0) and collapsedTranslate
      next = Math.max(expandedTranslate, Math.min(collapsedTranslate, next));
      setTranslateY(next);
    };

    const onPointerMove = (e: PointerEvent) => onMove(e.clientY);
    const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientY);

    const onPointerUp = () => {
      // snap
      const mid = (collapsedTranslate + expandedTranslate) / 2;
      setTranslateY((t) => (t > mid ? collapsedTranslate : expandedTranslate));
      startYRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [collapsedTranslate, expandedTranslate]);

  // notify parent when expanded state changes
  useEffect(() => {
    if (typeof onExpandedChange !== 'function') return;
    const mid = (collapsedTranslate + expandedTranslate) / 2;
    const isExpanded = translateY <= mid;
    try {
      onExpandedChange(isExpanded);
    } catch {}
  }, [translateY, collapsedTranslate, expandedTranslate, onExpandedChange]);

  // expose imperative API
  useImperativeHandle(
    ref,
    () => ({
      expand: () => {
        setTranslateY(expandedTranslate);
      },
      collapse: () => {
        setTranslateY(collapsedTranslate);
      },
    }),
    [collapsedTranslate, expandedTranslate]
  );

  const startDrag = (clientY: number) => {
    startYRef.current = clientY;
    startTranslateRef.current = translateY;
  };

  return (
    <div
      ref={sheetRef}
      className="bottom-sheet"
      style={{ transform: `translateY(${translateY}px)` }}
      onPointerDown={(e) => startDrag(e.clientY)}
      onTouchStart={(e) => startDrag(e.touches[0].clientY)}
    >
      <div className="bottom-sheet__grab" aria-hidden />
      <div className="bottom-sheet__content">{children}</div>
    </div>
  );
}

export default forwardRef(BottomSheet);
