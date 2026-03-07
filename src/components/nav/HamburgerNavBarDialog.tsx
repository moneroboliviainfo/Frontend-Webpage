import React from 'react';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';

import NavBarDialog from './NavBarDialog';
import NavBarImageButton from './NavBarImageButton';
import SocialMediaLinks from '../SocialMediaLinks';
import GoogleLoginButton from '../GoogleLoginButton';
import { selectClient, logout } from '@/store/clientSlice';
import { FEATURE_FLAGS } from '@/config/features';
import { GenderStorage } from '@/utils/genderStorage';

const iconSize = 26;

const HamburgerNavBarDialog: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  const client = useSelector(selectClient);
  const dispatch = useDispatch();
  const currentGender = GenderStorage.getGender();
  const isGuest = client?.email === 'guest@moneroget.com';

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
          backgroundColor="var(--color-secondary)"
          fontColor="var(--color-primary)"
          targetUrl="/men"
        />
        {FEATURE_FLAGS.WOMEN_ENABLED && (
          <NavBarImageButton
            content="MUJERES"
            backgroundColor="var(--color-secondary)"
            fontColor="var(--color-primary)"
            targetUrl="/women"
          />
        )}
        <NavBarImageButton
          content="SOBRE NOSOTROS"
          backgroundColor="var(--color-secondary)"
          fontColor="var(--color-primary)"
          targetUrl={`/${currentGender}/about_us`}
        />
        <NavBarImageButton
          content="ACERCA DE TU COMPRA"
          backgroundColor="var(--color-secondary)"
          fontColor="var(--color-primary)"
          targetUrl={`/${currentGender}/information#purchase`}
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
        {client && !isGuest ? (
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
          <GoogleLoginButton text="Iniciar sesión" />
        )}
      </div>
    </NavBarDialog>
  );
};

export default HamburgerNavBarDialog;
