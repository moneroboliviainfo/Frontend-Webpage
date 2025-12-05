import React from 'react';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';

import NavBarDialog from './NavBarDialog';
import NavBarImageButton from './NavBarImageButton';
import SocialMediaLinks from '../SocialMediaLinks';
import { selectClient, logout } from '@/store/clientSlice';

const iconSize = 26;

const HamburgerNavBarDialog: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  const client = useSelector(selectClient);
  const dispatch = useDispatch();

  return (
    <NavBarDialog open={open} setOpen={setOpen}>
      <div
        className="flex flex-col items-center h-[70vh] gap-5"
        style={{
          paddingTop: '1rem',
          background: 'var(--color-white)',
        }}
      >
        <NavBarImageButton
          content="HOMBRES"
          backgroundImage="https://images.asos-media.com/navigation/mw_com_newin_1M_148883109_p3w5ie?&$n_320w$"
          targetUrl="/men"
        />
        <NavBarImageButton
          content="MUJERES"
          backgroundImage="https://images.asos-media.com/navigation/mw_com_newin_1M_148883109_p3w5ie?&$n_320w$"
          targetUrl="/women"
        />
        <NavBarImageButton
          content="CONTACTO"
          backgroundImage="https://images.asos-media.com/navigation/mw_com_newin_1M_148883109_p3w5ie?&$n_320w$"
          targetUrl="/men"
        />
        <NavBarImageButton
          content="ACERCA DE TU COMPRA"
          backgroundImage="https://images.asos-media.com/navigation/mw_com_newin_1M_148883109_p3w5ie?&$n_320w$"
          targetUrl="/women"
        />
      </div>
      {/* Spacer */}
      <div
        style={{
          height: '1rem',
          background: 'var(--color-gray-background)',
        }}
      />
      {/* Social network section */}
      <div
        className="w-full bg-white flex flex-col items-center"
        style={{ paddingTop: '0.7rem', paddingBottom: '0.7rem' }}
      >
        <SocialMediaLinks iconSize={iconSize} showLabel={true} />
      </div>
      {/* Auth section */}
      <div
        className="w-full flex flex-col items-center"
        style={{
          padding: '1rem 0',
          background: 'var(--color-gray-background)',
          marginTop: '0.5rem',
        }}
      >
        {client ? (
          <React.Fragment>
            <span className="text-gray-700 text-lg font-semibold mb-2">
              Hola, {client.name}
            </span>
            <button
              className="px-6 py-2 rounded-lg bg-black text-white font-bold transition"
              onClick={() => dispatch(logout())}
            >
              Cerrar sesión
            </button>
          </React.Fragment>
        ) : (
          <button
            className="rounded-lg border border-gray-300 text-gray-800 font-bold flex items-center gap-3 shadow transition"
            style={{
              background: 'white',
              padding: '0.8rem 1.5rem',
              borderRadius: '0.5rem',
            }}
            onClick={() => {
              /* TODO: iniciar sesión con Google */
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Image
                src="/logos/google-icon.svg"
                alt="Google"
                width={iconSize}
                height={iconSize}
                style={{ display: 'inline-block' }}
              />
            </span>
            Iniciar sesión
          </button>
        )}
      </div>
    </NavBarDialog>
  );
};

export default HamburgerNavBarDialog;
