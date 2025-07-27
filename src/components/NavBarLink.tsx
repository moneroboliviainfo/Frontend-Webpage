// This file has been moved to the nav folder and is no longer available here.
import Link from 'next/link';
import React from 'react';

interface NavBarLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  active?: boolean;
}

export default function NavBarLink({
  href,
  children,
  className = '',
  style,
  active = false,
  ...props
}: NavBarLinkProps) {
  return (
    <Link
      href={href}
      className={`navbar-font text-xs px-2 pb-2 transition-colors duration-200 ${
        active
          ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
          : 'hover:underline'
      } ${className}`}
      style={{
        ...style,
        borderBottomWidth: active ? 2 : undefined,
        borderBottomColor: active ? 'var(--color-primary)' : undefined,
        borderBottomStyle: active ? 'solid' : undefined,
        marginBottom: active ? '-4px' : undefined, // visually connects to navbar border
        paddingBottom: active ? '0.5rem' : undefined, // adjust padding for active state
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
