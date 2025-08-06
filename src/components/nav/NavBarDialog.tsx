'use client';
import React from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { FaX } from 'react-icons/fa6';

interface NavBarDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

const iconStrokeWidth = 1.8;

const NavBarDialog: React.FC<NavBarDialogProps> = ({
  open,
  setOpen,
  children,
}) => {
  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10 w-100">
      <DialogBackdrop
        transition
        className="fixed inset-0  transition-opacity duration-500 ease-in-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto relative w-screen max-w-[1200px] transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              style={{ background: 'var(--color-gray-background)' }}
            >
              <div className="flex h-full flex-col overflow-y-auto py-6 shadow-xl">
                <div className="relative mt-6 flex-1 px-4 sm:px-6">
                  <nav
                    className="max-w-[1200px] flex items-center justify-between border-b border-gray-200"
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
                  <React.Fragment>{children}</React.Fragment>
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
