import React from 'react';

interface NavBarIconTextProps {
  icon: React.ReactNode;
  text?: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export default function NavBarIconText({
  icon,
  text,
  className = '',
  onClick = () => {},
}: NavBarIconTextProps) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {icon}
      {text && (
        <span className="navbar-font hidden md:inline font-medium text-xs">
          {text}
        </span>
      )}
    </div>
  );
}
