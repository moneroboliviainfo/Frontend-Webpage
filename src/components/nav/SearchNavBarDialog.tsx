import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch } from 'react-icons/fi';

import type { AppDispatch } from '../../store/store';
import { fetchMostSearched } from '../../store/clothingSlice';
import type { RootState } from '../../store/store';
import NavBarDialog from './NavBarDialog';
import MostSearchedPills from '../MostSearchedPills';

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
    // Fetch most searched when dialog opens and data is not already loaded
    if (open && mostSearched.length === 0) {
      dispatch(fetchMostSearched());
    }
  }, [open, mostSearched.length, dispatch]);

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
                border: '1px solid var(--color-gray-border)', // border-gray-300
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
            <MostSearchedPills />
          )}
        </div>
      </div>
    </NavBarDialog>
  );
};

export default SearchNavBarDialog;
