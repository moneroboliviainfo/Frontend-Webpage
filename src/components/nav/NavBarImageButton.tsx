import React from 'react';
import Link from 'next/link';

interface NavBarImageButtonProps {
  content: string;
  backgroundImage: string;
  targetUrl: string;
}

const NavBarImageButton: React.FC<NavBarImageButtonProps> = ({
  content,
  backgroundImage,
  targetUrl,
}) => {
  // Split content into words and group by twos
  const words = content.split(' ');
  const rows = [];
  for (let i = 0; i < words.length; i += 2) {
    rows.push(words.slice(i, i + 2).join(' '));
  }

  return (
    <Link
      href={targetUrl}
      className="w-[90%] h-25 shadow-lg transition focus:outline-none flex items-center"
      style={{
        maxWidth: '600px',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      aria-label={`Shop ${content}`}
    >
      <span
        className="text-black text-xl font-bold flex flex-col"
        style={{ marginLeft: '2rem' }}
      >
        {rows.map((row, idx) => (
          <span key={idx}>{row}</span>
        ))}
      </span>
    </Link>
  );
};

export default NavBarImageButton;
