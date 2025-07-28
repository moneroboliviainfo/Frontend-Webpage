'use client';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectClient, logout } from '../../store/clientSlice';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { FaX, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa6';
import NavBarImageButton from './NavBarImageButton';
import Image from 'next/image';

interface NavBarDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const iconSize = 26;
const iconStrokeWidth = 1.8;

const NavBarDialog: React.FC<NavBarDialogProps> = ({ open, setOpen }) => {
  const client = useSelector(selectClient);
  const dispatch = useDispatch();

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0  transition-opacity duration-500 ease-in-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              style={{ background: 'var(--color-gray-background)' }}
            >
              <div className="flex h-full flex-col overflow-y-auto py-6 shadow-xl">
                <div className="relative mt-6 flex-1 px-4 sm:px-6">
                  <nav
                    className="fixed top-0 left-0 w-full flex items-center justify-between border-b border-gray-200"
                    style={{
                      backdropFilter: 'blur(8px)',
                      padding: '0.6rem 1rem',
                      backgroundColor: 'var(--color-white)',
                      borderBottom: '1px solid #e5e7eb', // Tailwind gray-200
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        aria-label="Open menu"
                        className="block md:hidden"
                        onClick={() => setOpen(false)}
                      >
                        <FaX
                          size={16}
                          strokeWidth={iconStrokeWidth}
                          className="text-black"
                        />
                      </button>
                      <span className="text-xl md:text-3xl font-extrabold tracking-widest select-none text-black">
                        MONERO
                      </span>
                    </div>
                  </nav>
                  <div
                    className="flex flex-col items-center h-[70vh] gap-5"
                    style={{
                      paddingTop: '4rem',
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
                    <span className="text-gray-700 text-lg font-semibold">
                      Síguenos
                    </span>
                    <div className="flex gap-6">
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                      >
                        <FaFacebook
                          size={iconSize}
                          strokeWidth={iconStrokeWidth}
                          className="text-blue-700"
                        />
                      </a>
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                      >
                        <FaInstagram
                          size={iconSize}
                          strokeWidth={iconStrokeWidth}
                          className="text-pink-500"
                        />
                      </a>
                      <a
                        href="https://tiktok.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="TikTok"
                      >
                        <FaTiktok
                          size={iconSize}
                          strokeWidth={iconStrokeWidth}
                          className="text-black"
                        />
                      </a>
                    </div>
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
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default NavBarDialog;
