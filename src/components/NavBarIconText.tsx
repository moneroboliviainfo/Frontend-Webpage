// This file has been moved to the nav folder and is no longer available here.
import React from 'react';

interface NavBarIconTextProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

export default function NavBarIconText({
  icon,
  text,
  className = '',
}: NavBarIconTextProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon}
      <span className="navbar-font hidden md:inline font-medium text-xs">
        {text}
      </span>
    </div>
  );
}
