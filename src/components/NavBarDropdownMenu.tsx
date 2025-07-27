// This file has been moved to the nav folder and is no longer available here.
import React from 'react';
import Link from 'next/link';

interface NavBarDropdownMenuProps {
  show: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const menuItems = [
  { href: '/faqs', label: 'PREGUNTAS FRECUENTES' },
  { href: '/policy', label: 'POLÍTICAS DE COMPRA' },
  { href: '/order-status', label: 'ESTADO DE TU PEDIDO' },
];

export default function NavBarDropdownMenu({
  show,
  onMouseEnter,
  onMouseLeave,
}: NavBarDropdownMenuProps) {
  if (!show) {
    return null;
  }
  return (
    <div
      className="absolute left-0 top-full mt-2 w-56 text-black shadow-lg md:px-6 z-50 animate-fade-in"
      style={{ padding: '0.5rem 0', background: 'var(--color-primary)' }}
    >
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="navbar-font block px-4 py-2 hover:bg-gray-100 text-xs"
          style={{ padding: '0.5rem 0.5rem' }}
          tabIndex={0}
          onFocus={onMouseEnter}
          onBlur={onMouseLeave}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
