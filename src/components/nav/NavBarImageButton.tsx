import React from 'react';
import Link from 'next/link';

interface NavBarImageButtonProps {
  content: string;
  backgroundImage?: string;
  backgroundColor?: string;
  fontColor?: string;
  targetUrl: string;
}

const NavBarImageButton: React.FC<NavBarImageButtonProps> = ({
  content,
  backgroundImage,
  backgroundColor,
  fontColor,
  targetUrl,
}) => {
  // Split content into words and group by twos
  const words = content.split(' ');
  const rows = [];
  for (let i = 0; i < words.length; i += 2) {
    rows.push(words.slice(i, i + 2).join(' '));
  }

  const isColorMode = backgroundColor && !backgroundImage;

  return (
    <Link
      href={targetUrl}
      className="w-[90%] h-25 shadow-lg transition focus:outline-none flex items-center"
      style={{
        maxWidth: '600px',
        ...(backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {
              backgroundColor: backgroundColor || 'var(--color-secondary)',
            }),
        justifyContent: isColorMode ? 'center' : 'flex-start',
      }}
      aria-label={`Shop ${content}`}
    >
      <span
        className="text-xl font-bold flex flex-col"
        style={{
          color: fontColor || (isColorMode ? 'var(--color-primary)' : 'black'),
          marginLeft: isColorMode ? 0 : '2rem',
          textAlign: isColorMode ? 'center' : 'left',
        }}
      >
        {rows.map((row, idx) => (
          <span key={idx}>{row}</span>
        ))}
      </span>
    </Link>
  );
};

export default NavBarImageButton;
