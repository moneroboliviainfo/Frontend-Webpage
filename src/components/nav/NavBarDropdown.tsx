// This file has been moved to the nav folder and is no longer available here.
import React, { useRef } from 'react';
import NavBarDropdownMenu from './NavBarDropdownMenu';

interface NavBarDropdownProps {
  show: boolean;
  showDropdownMenu: () => void;
  hideDropdownMenu: () => void;
}

export default function NavBarDropdown({
  show,
  showDropdownMenu,
  hideDropdownMenu,
}: NavBarDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onMouseEnter = () => {
    (dropdownRef.current as HTMLDivElement).style.background =
      'var(--color-primary)';
  };

  const onMouseLeave = () => {
    (dropdownRef.current as HTMLDivElement).style.background = '';
  };

  return (
    <div
      ref={dropdownRef}
      className="relative group"
      onMouseEnter={showDropdownMenu}
      onMouseLeave={hideDropdownMenu}
      style={{ transition: 'background 0.2s' }}
    >
      <span
        className="navbar-font hover:underline cursor-pointer text-xs"
        style={{
          padding: '0.5rem 0.5rem',
          transition: 'background 0.2s',
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        ACERCA DE TU COMPRA
      </span>
      <NavBarDropdownMenu
        show={show}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </div>
  );
}
