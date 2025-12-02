import React from 'react';

import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { RootState } from '@/store/store';
import FireIcon from './FireIcon';

interface MostSearchedPillsProps {
  onPillClick?: () => void;
}

const MostSearchedPills: React.FC<MostSearchedPillsProps> = ({
  onPillClick,
}) => {
  const params = useParams();
  const gender = params?.gender || 'women';

  const mostSearched = useSelector(
    (state: RootState) => state.clothing.mostSearched
  );
  return (
    <div
      className="w-full overflow-x-auto hide-scrollbar"
      style={{
        msOverflowStyle: 'none', // IE and Edge
        scrollbarWidth: 'none', // Firefox
      }}
    >
      <ul
        className="flex gap-2 pb-2"
        style={{
          WebkitOverflowScrolling: 'touch',
          minWidth: 'fit-content',
          overflow: 'hidden',
        }}
      >
        {(mostSearched as Array<{ id?: number; name: string }>).map((item) => (
          <Link
            key={item.name}
            href={`/${gender}/results?search=${encodeURIComponent(item.name)}`}
            passHref
            onClick={() => onPillClick?.()}
          >
            <li
              className="rounded-full text-sm cursor-pointer hover:bg-gray-200 transition flex items-center flex-shrink-0"
              style={{
                padding: '0.5rem 1rem',
                whiteSpace: 'nowrap',
                borderColor: 'var(--color-red-fire)',
                borderWidth: '1px',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginRight: '0.5rem',
                }}
              >
                <FireIcon size={18} />
              </span>
              <span>{item.name}</span>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default MostSearchedPills;
