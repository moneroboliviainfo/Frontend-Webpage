'use client';
import React from 'react';
import useIsMobile from '@/hooks/useIsMobile';

interface NewProductsNavBarProps {
  gender: string;
  productsCount?: number;
}

export default function NewProductsNavBar({
  gender,
  productsCount,
}: NewProductsNavBarProps) {
  const isMobile = useIsMobile();

  const genderLabel = React.useMemo(() => {
    const genderParam = gender.toLowerCase();
    if (
      genderParam === 'men' ||
      genderParam === 'hombres' ||
      genderParam === 'male'
    ) {
      return 'Hombres';
    } else if (
      genderParam === 'women' ||
      genderParam === 'mujeres' ||
      genderParam === 'female'
    ) {
      return 'Mujeres';
    }
    return 'Productos';
  }, [gender]);

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100">
      <div
        className="max-w-7xl mx-auto"
        style={{
          paddingLeft: isMobile ? '1rem' : '2rem',
          paddingRight: isMobile ? '1rem' : '2rem',
          paddingTop: isMobile ? '1.5rem' : '2rem',
          paddingBottom: isMobile ? '1.5rem' : '2rem',
        }}
      >
        <div className="flex flex-col space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              {genderLabel}
            </span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-gray-900 font-medium">Novedades</span>
          </nav>

          {/* Main heading and products count */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex-1">
              <h1
                className={`font-bold text-gray-900 leading-tight ${
                  isMobile ? 'text-2xl' : 'text-3xl'
                }`}
              >
                <span className="flex items-center">
                  <h1
                    style={{
                      fontWeight: 'bold',
                      fontSize: isMobile ? '1.5rem' : '2.5rem',
                    }}
                  >
                    Novedades
                  </h1>
                  <svg
                    className="w-8 h-8 ml-3 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </span>
              </h1>
              <p
                className="text-gray-600 text-sm"
                style={{ marginTop: '0.2rem' }}
              >
                Los productos más recientes en nuestra colección
              </p>
            </div>
          </div>

          {/* Info banner */}
          <div
            className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4"
            style={{ marginTop: '0.2rem' }}
          >
            <div className="flex">
              <svg
                className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-orange-800 font-medium">
                  ¡Recién llegados!
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Productos agregados en los últimos {15} días. Sé el primero en
                  conseguirlos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
