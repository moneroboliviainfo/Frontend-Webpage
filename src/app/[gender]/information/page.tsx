'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';
import TermsAndConditions from '@/components/TermsAndConditions';
import useIsMobile from '@/hooks/useIsMobile';

// Section divider component
const SectionDivider: React.FC<{ title: string; id: string }> = ({
  title,
  id,
}) => (
  <div
    id={id}
    style={{
      position: 'relative',
      width: '100%',
      height: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}
  >
    <Image
      src="/faqs/category.webp"
      alt={title}
      fill
      style={{ objectFit: 'cover' }}
      priority
    />
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h2
        style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#fff',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        }}
      >
        {title}
      </h2>
    </div>
  </div>
);

// FAQ Item component
const FAQItem: React.FC<{
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ question, answer, isOpen, onToggle }) => {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        marginBottom: '1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: isMobile ? '1rem' : '1.25rem 1.5rem',
          backgroundColor: isOpen ? '#f3f4f6' : '#fff',
          border: 'none',
          textAlign: 'left',
          fontSize: isMobile ? '1rem' : '1.125rem',
          fontWeight: '600',
          color: '#111',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background-color 0.2s',
        }}
      >
        <span>{question}</span>
        <span
          style={{
            fontSize: '1.5rem',
            marginLeft: '1rem',
            transition: 'transform 0.3s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            padding: isMobile ? '1rem' : '1.25rem 1.5rem',
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
            fontSize: isMobile ? '0.9rem' : '1rem',
            lineHeight: '1.6',
            color: '#555',
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
};

export default function InformationPage() {
  const isMobile = useIsMobile();
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: '¿Tienen tienda física?',
      answer:
        'SÍ, nuestra tienda se encuentra en Sucre, en la calle Destacamento 317 N° 1110 (Frente al mundito)',
    },
    {
      question: '¿En qué ciudad se encuentran?',
      answer: 'Estamos en la ciudad de Sucre-Bolivia.',
    },
    {
      question: '¿Cómo sé que su página web es segura?',
      answer:
        'Nuestra página web se encuentra cifrada de extremo a extremo con certificación SSL proporcionada por CloudFlare.',
    },
    {
      question: '¿Puedo pagar mediante QR?',
      answer:
        'SÍ, aceptamos pagos mediante código QR. Durante el proceso de pago podrás seleccionar esta opción y se generará un código QR que podrás escanear desde tu aplicación bancaria para completar la transacción de forma segura.',
    },
    {
      question: '¿Cobran costos de envío?',
      answer:
        'Sí, los costos de envío son cobrados de acuerdo a su destino. Contamos con logística de envíos a nivel nacional vía courier.',
    },
    {
      question: '¿Me pueden cambiar si compro una prenda y no me gusta?',
      answer: (
        <>
          Sí, claro, los cambios se hacen de acuerdo a la siguiente{' '}
          <a
            href="#politicas"
            style={{
              color: '#000',
              fontWeight: 'bold',
              textDecoration: 'underline',
            }}
          >
            política de compras
          </a>
          .
        </>
      ),
    },
    {
      question: '¿Puedo ser imagen tiktoker de su tienda?',
      answer: (
        <>
          Sí, claro, solo envíanos tu perfil a nuestro{' '}
          <a
            href="https://api.whatsapp.com/message/G2LHYOAMPULZP1?autoload=1&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#000',
              fontWeight: 'bold',
              textDecoration: 'underline',
            }}
          >
            Whatsapp
          </a>{' '}
          para ponernos en contacto.
        </>
      ),
    },
  ];

  return (
    <>
      <NavBar dynamicTransparent={false} />

      <main
        style={{
          marginTop: 'var(--nav-height, 64px)',
          backgroundColor: '#f9fafb',
        }}
      >
        {/* Section 1: FAQs */}
        <SectionDivider title="Preguntas Frecuentes" id="faqs" />
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '2rem 1rem' : '3rem 2rem',
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </section>

        {/* Section 2: Políticas de Compra */}
        <SectionDivider title="Políticas de Compra" id="politicas" />
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '2rem 1rem' : '3rem 2rem',
            backgroundColor: '#fff',
          }}
        >
          <TermsAndConditions showTitle={true} compact={false} />
        </section>

        {/* Section 3: Estado de tu Pedido */}
        <SectionDivider title="Estado de tu Pedido" id="estado-pedido" />
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '2rem 1rem' : '3rem 2rem',
            backgroundColor: '#fff',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            <p
              style={{
                fontSize: isMobile ? '1rem' : '1.125rem',
                lineHeight: '1.8',
                color: '#555',
                marginBottom: '2rem',
              }}
            >
              Sigue estos pasos para verificar el estado de tus pedidos:
            </p>
          </div>

          {/* Step 1 */}
          <div
            style={{
              marginBottom: '3rem',
              padding: isMobile ? '1.5rem' : '2rem',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
            }}
          >
            <h3
              style={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#111',
              }}
            >
              Paso 1: Accede a tu Perfil
            </h3>
            <p
              style={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                lineHeight: '1.6',
                color: '#555',
                marginBottom: '1.5rem',
              }}
            >
              Haz clic en el icono de perfil en la barra de navegación superior.
              Si no has iniciado sesión, primero deberás ingresar con tu cuenta
              de google.
            </p>
            <div
              style={{
                width: '100%',
                height: isMobile ? '200px' : '300px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                fontSize: isMobile ? '0.875rem' : '1rem',
              }}
            >
              [Captura de pantalla del menú de perfil]
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              marginBottom: '3rem',
              padding: isMobile ? '1.5rem' : '2rem',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
            }}
          >
            <h3
              style={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#111',
              }}
            >
              Paso 2: Ver Tus Pedidos
            </h3>
            <p
              style={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                lineHeight: '1.6',
                color: '#555',
                marginBottom: '1.5rem',
              }}
            >
              En tu perfil, encontrarás la sección "Mis Pedidos" donde podrás
              ver todos tus pedidos realizados con su estado actual.
            </p>
            <div
              style={{
                width: '100%',
                height: isMobile ? '200px' : '300px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                fontSize: isMobile ? '0.875rem' : '1rem',
              }}
            >
              [Captura de pantalla de la lista de pedidos]
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              marginBottom: '3rem',
              padding: isMobile ? '1.5rem' : '2rem',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
            }}
          >
            <h3
              style={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#111',
              }}
            >
              Paso 3: Detalles del Pedido
            </h3>
            <p
              style={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                lineHeight: '1.6',
                color: '#555',
                marginBottom: '1.5rem',
              }}
            >
              Haz clic en cualquier pedido para ver los detalles completos,
              incluyendo productos, dirección de envío, método de pago y estado
              de entrega actualizado.
            </p>
            <div
              style={{
                width: '100%',
                height: isMobile ? '200px' : '300px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                fontSize: isMobile ? '0.875rem' : '1rem',
              }}
            >
              [Captura de pantalla del detalle del pedido]
            </div>
          </div>

          {/* Help text */}
          <div
            style={{
              padding: isMobile ? '1.5rem' : '2rem',
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              border: '2px solid #bfdbfe',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                lineHeight: '1.6',
                color: '#1e40af',
                margin: 0,
              }}
            >
              <strong>¿Necesitas ayuda?</strong> Contáctanos por{' '}
              <a
                href="https://api.whatsapp.com/message/G2LHYOAMPULZP1?autoload=1&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1e40af',
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                }}
              >
                WhatsApp
              </a>{' '}
              o visita nuestra tienda física en la calle Junín #166, Sucre.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
