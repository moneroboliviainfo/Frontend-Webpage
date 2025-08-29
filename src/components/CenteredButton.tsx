import React from 'react';
import Link from 'next/link';

interface CenteredButtonProps {
  text: string;
  url: string;
}

const CenteredButton: React.FC<CenteredButtonProps> = ({ text, url }) => {
  return (
    <Link
      href={url}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent text-white px-8 py-4 text-lg font-semibold flex items-center justify-center"
      style={{
        borderRadius: 0,
        border: '0.125rem solid #fff',
        color: '#fff',
        textDecoration: 'none',
        padding: '0.5rem 1rem',
      }}
    >
      {text}
    </Link>
  );
};

export default CenteredButton;
