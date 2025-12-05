import React from 'react';
import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';

export default function InformationPage() {
  return (
    <>
      <NavBar dynamicTransparent={false} />
      <main
        style={{
          minHeight: 'calc(100vh - var(--nav-height) - 200px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          backgroundColor: '#f9fafb',
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '3rem 2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#111',
            }}
          >
            Página en Construcción
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              lineHeight: 1.6,
            }}
          >
            Estamos trabajando para traerte contenido increíble. Pronto podrás
            encontrar más información aquí.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
