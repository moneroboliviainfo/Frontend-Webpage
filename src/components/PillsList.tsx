import React from 'react';

type PillsListProps = {
  subcategories: { id: number; name: string }[];
  selectedSubcategoryId: number | null;
  onSelectSubcategory: (id: number | null) => void;
};

const PillsList: React.FC<PillsListProps> = ({
  subcategories,
  selectedSubcategoryId,
  onSelectSubcategory,
}) => {
  const pills: { id: number | null; name: string }[] = [
    { id: null, name: 'Ver todo' },
    ...subcategories,
  ];

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
        {pills.map((pill) => {
          const isSelected = selectedSubcategoryId === pill.id;
          return (
            <li
              key={pill.id !== null ? pill.id : 'all'}
              className="rounded-full text-sm cursor-pointer hover:bg-gray-200 transition flex items-center flex-shrink-0"
              style={{
                padding: '0.5rem 1rem',
                whiteSpace: 'nowrap',
                borderColor: '#00000033',
                borderWidth: '1px',
                backgroundColor: isSelected ? 'black' : 'white',
              }}
              onClick={() => onSelectSubcategory(pill.id)}
            >
              <button
                type="button"
                onClick={() => onSelectSubcategory(pill.id)}
                aria-pressed={isSelected}
                className={`rounded-full text-sm cursor-pointer transition whitespace-nowrap px-4 py-2 font-medium`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'white' : 'black',
                }}
              >
                {pill.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PillsList;
