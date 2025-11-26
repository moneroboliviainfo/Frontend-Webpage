// This file has been moved to the nav folder and is no longer available here.
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { FiUser, FiShoppingCart, FiSearch } from 'react-icons/fi';
import { motion, useAnimation } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { selectCartQuantity } from '@/store/cartSlice';
import NavBarLink from './NavBarLink';
import NavBarIconText from './NavBarIconText';
import NavBarDropdown from './NavBarDropdown';
import { usePathname } from 'next/navigation';

import HamburgerButton from './HamburgerButton';
import HamburgerNavBarDialog from './HamburgerNavBarDialog';
import SearchNavBarDialog from './SearchNavBarDialog';
import CartNavBarDialog from './CartNavBarDialog';
import ProfileNavBarDialog from './ProfileNavBarDialog';

const iconsSize = 22;
const iconsStrokeWidth = 1.8;

export default function NavBar({
  dynamicTransparent = true,
}: {
  dynamicTransparent?: boolean;
}) {
  const navRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const controls = useAnimation();
  const cartLength = useAppSelector(selectCartQuantity);
  // TODO: Replace with real client name from redux
  const clientName = null;
  const pathname = usePathname();

  // measure nav height and expose it via CSS variable so other components can
  // position themselves below the nav without hardcoded values
  useEffect(() => {
    const measure = () => {
      try {
        const el = navRef.current;
        const h = el?.getBoundingClientRect().height ?? 0;
        document.documentElement.style.setProperty(
          '--nav-height',
          `${Math.ceil(h)}px`
        );
      } catch {}
    };

    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 500);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate NavBar out when a dialog is open
  useEffect(() => {
    if (hamburgerOpen || searchOpen || cartOpen || profileOpen) {
      controls.start({
        opacity: 0,
        pointerEvents: 'none',
        transition: { duration: 0.2 },
      });
    } else {
      const transparent = !scrolled && dynamicTransparent;
      controls.start({
        opacity: 1,
        backgroundColor: transparent
          ? 'var(--color-transparent)'
          : 'var(--color-white)',
        color: !transparent ? 'var(--color-black)' : 'var(--color-white)',
        pointerEvents: 'auto',
        transition: { duration: 0.3 },
      });
    }
  }, [
    scrolled,
    controls,
    hamburgerOpen,
    searchOpen,
    cartOpen,
    profileOpen,
    dynamicTransparent,
  ]);

  const borderBottomStyle =
    scrolled &&
    dynamicTransparent &&
    typeof window !== 'undefined' &&
    window.innerWidth >= 768
      ? { borderBottom: '3px solid var(--color-primary)' }
      : {};

  return (
    <div ref={navRef} className="fixed top-0 left-0 w-full z-50">
      <motion.nav
        animate={controls}
        className="w-full flex items-center justify-between"
        style={{
          padding: '0.6rem 1rem',
          ...borderBottomStyle,
        }}
      >
        {/* Left: Store name and nav links */}
        <div className="flex items-center gap-4">
          {/* Hamburger only on mobile */}
          <HamburgerButton
            onClick={() => setHamburgerOpen(true)}
            iconsSize={iconsSize}
            iconsStrokeWidth={iconsStrokeWidth}
          />
          <span className="text-xl md:text-3xl font-extrabold tracking-widest select-none">
            MONERO
          </span>

          {/* Nav links only on md+ */}
          <div className="hidden md:flex items-center gap-6 text-base font-medium h-full relative">
            <NavBarLink href="/men" active={pathname === '/men'}>
              HOMBRES
            </NavBarLink>
            <NavBarLink href="/women" active={pathname === '/women'}>
              MUJERES
            </NavBarLink>
            <NavBarLink href="/contact" active={pathname === '/contact'}>
              CONTACTO
            </NavBarLink>
            <NavBarDropdown
              show={showMenu}
              showDropdownMenu={() => setShowMenu(true)}
              hideDropdownMenu={() => setShowMenu(false)}
            />
          </div>
        </div>
        {/* Right: Icons and text */}
        <div className="flex items-center gap-7">
          <NavBarIconText
            icon={<FiSearch size={iconsSize} strokeWidth={iconsStrokeWidth} />}
            text="BUSCA AQUÍ"
            onClick={() => setSearchOpen(true)}
          />
          <NavBarIconText
            icon={<FiUser size={iconsSize} strokeWidth={iconsStrokeWidth} />}
            text={clientName ? clientName : 'INICIA SESIÓN'}
            onClick={() => setProfileOpen(true)}
          />
          <div
            className="relative flex items-center gap-2"
            style={{ cursor: 'pointer' }}
            onClick={() => setCartOpen(true)}
          >
            <FiShoppingCart size={iconsSize} strokeWidth={iconsStrokeWidth} />
            <span className="navbar-font hidden md:inline text-xs">
              CARRITO
            </span>
            {cartLength > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartLength}
              </span>
            )}
          </div>
        </div>
      </motion.nav>
      <HamburgerNavBarDialog open={hamburgerOpen} setOpen={setHamburgerOpen} />
      <SearchNavBarDialog open={searchOpen} setOpen={setSearchOpen} />
      <CartNavBarDialog open={cartOpen} setOpen={setCartOpen} />
      <ProfileNavBarDialog open={profileOpen} setOpen={setProfileOpen} />
    </div>
  );
}
