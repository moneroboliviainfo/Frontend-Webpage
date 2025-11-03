import React, { useState } from 'react';
// Simple pills list component used only in this file
const PillsList: React.FC = () => {
  const pills = [
    'Ver todo',
    'Baggy',
    'Mommy',
    'Chupin',
    'Skinny',
    'Wide',
    'Low-rise',
  ];
  const [selected, setSelected] = useState<string>('Ver todo');

  return (
    <div
      className="w-full overflow-x-auto hide-scrollbar"
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        marginTop: '1rem',
        marginBottom: '1rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
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
        {pills.map((p) => {
          const isSelected = selected === p;
          return (
            <li
              key={p}
              className="rounded-full text-sm cursor-pointer hover:bg-gray-200 transition flex items-center flex-shrink-0"
              style={{
                padding: '0.5rem 1rem',
                whiteSpace: 'nowrap',
                borderColor: '#00000033',
                borderWidth: '1px',
                backgroundColor: isSelected ? 'black' : 'white',
              }}
            >
              <button
                type="button"
                onClick={() => setSelected(p)}
                aria-pressed={isSelected}
                className={`rounded-full text-sm cursor-pointer transition whitespace-nowrap px-4 py-2 font-medium`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'white' : 'black',
                }}
              >
                {p}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PillsList;
