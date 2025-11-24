'use client';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import BottomSheet from '@/components/BottomSheet/BottomSheet';
import React, { useRef, useState } from 'react';

type OutfitDetails = {
  multimedia: Array<{ image: string; label: string }>;
  outfitId: number;
  name: string;
  items: Array<{ name: string; price: number }>;
  totalPrice: number;
  description: string;
  slug?: string;
};

type Props = {
  outfitDetails: OutfitDetails;
  allOutfits?: OutfitDetails[]; // Array of all outfits for swiping
  currentOutfitIndex?: number; // Current outfit index
  onOutfitChange?: (index: number) => void; // Callback when outfit changes
};

const OutfitPageMobile: React.FC<Props> = ({
  outfitDetails,
  allOutfits = [outfitDetails],
  currentOutfitIndex = 0,
  onOutfitChange,
}) => {
  const bottomSheetRef = useRef<{
    expand: () => void;
    collapse: () => void;
  } | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  // Swipe detection states (same as ProductPageMobile)
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(
    null
  );
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle swipe start
  const handleSwipeStart = (clientX: number, clientY: number) => {
    // Check if touch is within BottomSheet area
    const containerHeight =
      containerRef.current?.offsetHeight || window.innerHeight * 0.8;
    const bottomSheetStartY = containerHeight * 0.79; // Approximately where BottomSheet starts

    if (clientY > bottomSheetStartY) {
      // Touch started in BottomSheet area, don't handle horizontal swipes
      return;
    }

    setStartX(clientX);
    setStartY(clientY);
    setIsDragging(true);
    setIsHorizontalSwipe(null); // Reset direction detection
  };

  // Handle swipe move
  const handleSwipeMove = (clientX: number, clientY: number) => {
    if (!isDragging || startX === null || startY === null) return;

    const diffX = clientX - startX;
    const diffY = clientY - startY;

    // Determine swipe direction on first significant movement
    if (
      isHorizontalSwipe === null &&
      (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)
    ) {
      const isHorizontal = Math.abs(diffX) > Math.abs(diffY);
      setIsHorizontalSwipe(isHorizontal);

      // If it's a vertical swipe, don't handle horizontal movement
      if (!isHorizontal) {
        return;
      }
    }

    // Only process horizontal swipes
    if (isHorizontalSwipe === false) {
      return;
    }

    // Only allow swipe if not at boundaries
    if (
      (diffX > 0 && currentOutfitIndex === 0) ||
      (diffX < 0 && currentOutfitIndex === allOutfits.length - 1)
    ) {
      return;
    }

    setTranslateX(diffX);
  };

  // Handle swipe end
  const handleSwipeEnd = () => {
    if (!isDragging || startX === null) return;

    // Only process swipe if it was determined to be horizontal
    if (isHorizontalSwipe === true) {
      const swipeThreshold = 100;

      if (Math.abs(translateX) > swipeThreshold) {
        const direction = translateX > 0 ? -1 : 1; // Right swipe = -1 (previous), Left swipe = 1 (next)
        const newIndex = currentOutfitIndex + direction;

        if (newIndex >= 0 && newIndex < allOutfits.length && onOutfitChange) {
          // Add a slight delay for smooth transition
          setTimeout(() => {
            onOutfitChange(newIndex);
            // Collapse bottom sheet
            bottomSheetRef.current?.collapse();
          }, 100);
        }
      }
    }

    // Reset swipe state
    setTranslateX(0);
    setStartX(null);
    setStartY(null);
    setIsDragging(false);
    setIsHorizontalSwipe(null);
  };

  return (
    <div
      className="w-full"
      style={{
        height: '80vh',
      }}
      ref={containerRef}
    >
      {/* Top 85% - Primary color with slider (same as ProductPageMobile) */}
      <div
        style={{ height: '100%' }}
        className="relative"
        onTouchStart={(e) =>
          handleSwipeStart(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchMove={(e) =>
          handleSwipeMove(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={handleSwipeEnd}
        onMouseDown={(e) => handleSwipeStart(e.clientX, e.clientY)}
        onMouseMove={(e) =>
          e.buttons === 1 && handleSwipeMove(e.clientX, e.clientY)
        }
        onMouseUp={handleSwipeEnd}
        onMouseLeave={handleSwipeEnd}
      >
        <div
          className="absolute inset-0"
          style={{
            opacity: 1,
            transform: `translateX(${translateX}px)`,
            transition: isDragging
              ? 'none'
              : 'transform 300ms ease, opacity 200ms ease',
          }}
          id="outfit-slider-container"
          onClick={() => {
            // if bottom sheet is expanded, collapse it when the slider area is clicked
            if (sheetExpanded) {
              bottomSheetRef.current?.collapse();
            }
          }}
        >
          <ImageSlider
            direction="vertical"
            slidesData={outfitDetails.multimedia}
            autoplayDelay={0}
            showNews={false}
            onSlide={() => {
              // collapse the bottom sheet when the user slides the image carousel
              bottomSheetRef.current?.collapse();
            }}
          />
        </div>
      </div>

      {/* BottomSheet contains the outfit info (different content from product) */}
      <BottomSheet
        ref={bottomSheetRef}
        initialHeightVh={21}
        expandedHeightVh={40}
        onExpandedChange={(expanded) => {
          setSheetExpanded(expanded);
          const el = document.getElementById('outfit-slider-container');
          if (el) {
            // darken the slider when expanded (reduce brightness) instead of lowering opacity
            el.style.transition = 'filter 200ms ease';
            el.style.filter = expanded ? 'brightness(0.80)' : 'none';
          }
        }}
      >
        <div
          className="w-full"
          style={{
            height: sheetExpanded ? '31vh' : '20vh',
            paddingTop: '0.1rem',
            paddingLeft: '0.7rem',
            paddingRight: '0.7rem',
            background: 'white',
          }}
        >
          {/* Different content for outfits - blank for now */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">
                {outfitDetails.name}
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Outfit content coming soon...
              </p>
              <div className="text-xs text-gray-400">
                <p>Outfit ID: {outfitDetails.outfitId}</p>
                <p>Items: {outfitDetails.items.length}</p>
                <p>Total: Bs. {outfitDetails.totalPrice}</p>
              </div>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default OutfitPageMobile;
