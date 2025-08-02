import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { FiSearch } from 'react-icons/fi';

import { fetchMostSearched } from '../../store/clothingSlice';
import type { RootState } from '../../store/store';
import NavBarDialog from './NavBarDialog';
import Link from 'next/link';

const iconSize = 20;
const iconStrokeWidth = 1.8;

const SearchNavBarDialog: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const mostSearched = useSelector(
    (state: RootState) => state.clothing.mostSearched
  );
  const loading = useSelector((state: RootState) => state.clothing.loading);
  const error = useSelector((state: RootState) => state.clothing.error);
  const inputRef = useRef<HTMLInputElement>(null);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    // Fetch most searched only if not already loaded
    if (mostSearched.length === 0) {
      dispatch(fetchMostSearched());
    }
  }, [mostSearched.length]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (open) {
      timeout = setTimeout(() => setFocus(true), 200);
    } else {
      setFocus(false);
    }
    return () => timeout && clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (open && focus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, focus]);

  // elegir la portada mediante el color para cada producto
  // revisar las tallas
  // pasar a Belen lo que necesitamos

  return (
    <NavBarDialog open={open} setOpen={setOpen}>
      <div
        className="flex flex-col items-center h-[70vh]"
        style={{
          paddingTop: '3rem',
          background: 'var(--color-white)',
        }}
      >
        {/* Search input section */}
        <div
          className="flex w-full justify-center items-center gap-1"
          style={{ padding: '1rem' }}
        >
          <div className="relative w-[100%]">
            <span className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <FiSearch
                size={iconSize}
                strokeWidth={iconStrokeWidth}
                style={{ marginLeft: '0.8rem' }}
              />
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Escribe aquí..."
              className="focus:outline-none focus:ring-2 focus:ring-primary text-lg w-full"
              style={{
                borderRadius: '0.375rem',
                paddingLeft: '2.5rem', // pl-10
                paddingRight: '1rem', // pr-4
                paddingTop: '0.5rem', // py-3
                paddingBottom: '0.5rem', // py-3
                border: '1px solid #d1d5db', // border-gray-300
              }}
              autoFocus
            />
          </div>
          <button
            className="rounded-lg text-black font-bold hover:bg-gray-300 transition"
            style={{
              width: '20%',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
              cursor: 'pointer',
            }}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </button>
        </div>
        {/* Most Searched section */}
        <div
          className="w-full justify-center items-center gap-1"
          style={{
            paddingLeft: '1rem',
            paddingRight: '1rem',
            paddingTop: '0.5rem',
          }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ marginBottom: '1rem' }}
          >
            Más buscados
          </h3>
          {loading && <div className="text-gray-500">Cargando...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && mostSearched.length > 0 && (
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
                {mostSearched.map((item) => (
                  <Link
                    key={item.name}
                    href={`/results?search=${encodeURIComponent(item.name)}`}
                    passHref
                  >
                    <li
                      className="bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-gray-200 transition flex items-center flex-shrink-0"
                      style={{
                        padding: '0.5rem 1rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          marginRight: '0.5rem',
                        }}
                      >
                        <svg
                          fill="#ff1414"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          stroke="#ff1414"
                          width={18}
                          height={18}
                          style={{ minWidth: 18, minHeight: 18 }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.1758045,11.5299649 C11.7222481,10.7630248 11.6612694,9.95529555 11.2823626,8.50234466 C10.5329929,5.62882187 10.8313891,4.05382867 13.4147321,2.18916004 L14.6756139,1.27904986 L14.9805807,2.80388386 C15.3046861,4.42441075 15.8369398,5.42670671 17.2035766,7.35464078 C17.2578735,7.43122022 17.2578735,7.43122022 17.3124108,7.50814226 C19.2809754,10.2854144 20,11.9596204 20,15 C20,18.6883517 16.2713564,22 12,22 C7.72840879,22 4,18.6888043 4,15 C4,14.9310531 4.00007066,14.9331427 3.98838852,14.6284506 C3.89803284,12.2718054 4.33380946,10.4273676 6.09706666,8.43586022 C6.46961415,8.0150872 6.8930834,7.61067534 7.36962714,7.22370749 L8.42161802,6.36945926 L8.9276612,7.62657706 C9.30157948,8.55546878 9.73969716,9.28566491 10.2346078,9.82150804 C10.6537848,10.2753538 10.9647401,10.8460665 11.1758045,11.5299649 Z M7.59448531,9.76165711 C6.23711779,11.2947332 5.91440928,12.6606068 5.98692012,14.5518252 C6.00041903,14.9039019 6,14.8915108 6,15 C6,17.5278878 8.78360021,20 12,20 C15.2161368,20 18,17.527472 18,15 C18,12.4582072 17.4317321,11.1350292 15.6807305,8.66469725 C15.6264803,8.58818014 15.6264803,8.58818014 15.5719336,8.51124844 C14.5085442,7.0111098 13.8746802,5.96758691 13.4553336,4.8005211 C12.7704786,5.62117775 12.8107447,6.43738988 13.2176374,7.99765534 C13.9670071,10.8711781 13.6686109,12.4461713 11.0852679,14.31084 L9.61227259,15.3740546 L9.50184911,13.5607848 C9.43129723,12.4022487 9.16906461,11.6155508 8.76539217,11.178492 C8.36656566,10.7466798 8.00646835,10.2411426 7.68355027,9.66278925 C7.65342985,9.69565638 7.62374254,9.72861259 7.59448531,9.76165711 Z"
                          />
                        </svg>
                      </span>
                      <span>{item.name}</span>
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </NavBarDialog>
  );
};

export default SearchNavBarDialog;
