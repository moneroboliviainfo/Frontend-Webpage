import React from 'react';

interface HamburgerButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  iconsSize: number;
  iconsStrokeWidth: number;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  onClick,
  iconsSize,
  iconsStrokeWidth,
}) => {
  return (
    <button
      aria-label="Open menu"
      className="block md:hidden"
      onClick={onClick}
    >
      {/* Hamburger icon hidden on md+ */}
      <svg
        width={iconsSize}
        height={iconsSize}
        strokeWidth={iconsStrokeWidth}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
};

export default HamburgerButton;
