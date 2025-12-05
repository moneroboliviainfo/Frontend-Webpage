'use client';
import React, { useState } from 'react';

interface SubscriptionSectionProps {
  isMobile: boolean;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  isMobile,
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle subscription form submission
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email.trim()) {
      setEmailError('Por favor ingresa tu correo');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Por favor ingresa un correo válido');
      return;
    }

    setEmailError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(
        'https://api.moneroget.com/api/auth/subscribe',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.status === 201) {
        setIsSubscribed(true);
        setShowThankYouModal(true);
        setEmail('');
      } else if (response.status === 409) {
        setEmailError('Ya estás suscrito con este correo.');
      } else {
        setEmailError('Hubo un error al suscribirse. Intenta de nuevo.');
      }
    } catch {
      setEmailError('Hubo un error al suscribirse. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="w-full"
        style={{ backgroundColor: 'white', paddingTop: '0.17rem' }}
      >
        <div
          className="w-full flex items-center justify-center"
          style={{ minHeight: isMobile ? '40vh' : '30vh' }}
        >
          <div
            className="flex flex-col items-center text-center"
            style={{
              gap: '1rem',
              width: '100%',
              maxWidth: 860,
              padding: '0 1rem',
            }}
          >
            {/* Title: same size as SectionHeader */}
            <h2
              style={{
                fontSize: isMobile ? '2rem' : '3rem',
                fontWeight: 800,
                margin: 0,
                color: '#111',
              }}
            >
              SUSCRÍBETE PARA RECIBIR OFERTAS
            </h2>

            {/* Subtitle: 4x smaller than title */}
            <p
              style={{
                fontSize: isMobile ? '0.85rem' : '1.1rem',
                margin: 0,
                color: '#374151',
                maxWidth: 720,
                lineHeight: 1.3,
              }}
            >
              Sé la primera en recibir las nuevas colecciones, promociones y
              mucho más
            </p>

            {/* Input + Button row or Success message */}
            {isSubscribed ? (
              <p
                style={{
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  fontWeight: 600,
                  color: '#10b981',
                  marginTop: '0.75rem',
                }}
              >
                Gracias por suscribirte
              </p>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col items-center"
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                }}
              >
                <div
                  className="flex items-center"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  <input
                    aria-label="Ingresa tu correo"
                    placeholder="Ingresa tu correo"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    disabled={isSubmitting}
                    className="bg-white"
                    style={{
                      border: `1px solid ${
                        emailError ? '#ef4444' : 'rgba(0,0,0,0.12)'
                      }`,
                      borderRadius: 8,
                      padding: isMobile ? '0.5rem 0.75rem' : '0.6rem 1rem',
                      width: isMobile ? '65%' : 420,
                      maxWidth: '100%',
                      outline: 'none',
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      marginLeft: 12,
                      background: isSubmitting ? '#6b7280' : '#000',
                      color: '#fff',
                      borderRadius: 9999,
                      padding: isMobile ? '0.5rem 0.9rem' : '0.6rem 1.25rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSubmitting ? 'Enviando...' : 'Súscribete'}
                  </button>
                </div>
                {emailError && (
                  <p
                    style={{
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    {emailError}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Thank You Modal */}
      {showThankYouModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 80,
          }}
          onClick={() => setShowThankYouModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
              }}
            >
              🎉
            </div>
            <h2
              style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                fontWeight: 700,
                marginBottom: '1rem',
                color: '#111',
              }}
            >
              ¡Gracias por Suscribirte!
            </h2>
            <p
              style={{
                fontSize: isMobile ? '0.95rem' : '1.1rem',
                color: '#6b7280',
                marginBottom: '2rem',
                lineHeight: 1.5,
              }}
            >
              Te mantendremos informado sobre nuestras mejores ofertas, nuevas
              colecciones y promociones exclusivas.
            </p>
            <button
              onClick={() => setShowThankYouModal(false)}
              style={{
                background: '#000',
                color: '#fff',
                borderRadius: 9999,
                padding: '0.75rem 2rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscriptionSection;
