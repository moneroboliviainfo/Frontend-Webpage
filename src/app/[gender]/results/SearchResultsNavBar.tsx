'use client';
import React from 'react';
import useIsMobile from '@/hooks/useIsMobile';

interface SearchResultsNavBarProps {
  gender: string;
  searchQuery: string;
  resultsCount?: number;
}

export default function SearchResultsNavBar({
  gender,
  searchQuery,
  resultsCount,
}: SearchResultsNavBarProps) {
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
            <span className="text-gray-900 font-medium">
              Resultados de búsqueda
            </span>
          </nav>

          {/* Main heading and results */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex-1">
              <h1
                className={`font-bold text-gray-900 leading-tight ${
                  isMobile ? 'text-2xl' : 'text-3xl'
                }`}
              >
                {searchQuery ? (
                  <>
                    Resultados para{' '}
                    <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      &quot;{searchQuery}&quot;
                    </span>
                  </>
                ) : (
                  'Resultados de búsqueda'
                )}
              </h1>
            </div>

            {/* Results count badge */}
            {resultsCount !== undefined && (
              <div className="flex-shrink-0">
                <div
                  className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                    resultsCount === 0
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ marginRight: '0.1rem' }}
                  >
                    {resultsCount === 0 ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                  </svg>
                  {resultsCount === 0
                    ? ' Sin resultados'
                    : resultsCount === 1
                    ? ' 1 producto'
                    : `${resultsCount} productos`}
                </div>
              </div>
            )}
          </div>

          {/* Search tips for no results */}
          {resultsCount === 0 && searchQuery && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-blue-400 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-blue-800 font-medium">
                    Sugerencias de búsqueda:
                  </p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Verifica la ortografía de las palabras</li>
                    <li>• Usa términos más generales</li>
                    <li>• Intenta con sinónimos o palabras relacionadas</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
