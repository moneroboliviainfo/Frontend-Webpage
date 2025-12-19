'use client';
import React, { useState, useEffect } from 'react';
import NavBar from '@/components/nav/NavBar';
import Footer from '@/components/Footer';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import useIsMobile from '@/hooks/useIsMobile';

export default function AboutUsPage() {
  const isMobile = useIsMobile();
  const [showVideo, setShowVideo] = useState(false);

  // Placeholder slider images - replace with actual about us images
  const sliderImages = [
    {
      image: '/about_us/about_us_1.jpg',
      label: 'Nuestra Historia',
    },
    {
      image: '/about_us/about_us_2.jpg',
      label: 'Nuestros Valores',
    },
    {
      image: '/about_us/about_us_3.jpg',
      label: 'Nuestra Misión',
    },
  ];

  return (
    <>
      <NavBar dynamicTransparent={false} />

      {/* Hero Slider Section */}
      <section
        style={{
          marginTop: 'var(--nav-height, 64px)',
          width: '100%',
          height: isMobile ? '60vh' : '75vh',
          minHeight: isMobile ? '400px' : '600px',
        }}
      >
        <div style={{ height: '100%', width: '100%' }}>
          <ImageSlider
            direction="horizontal"
            slidesData={sliderImages}
            autoplayDelay={4000}
            showNews={false}
          />
        </div>
      </section>

      {/* About Content Section */}
      <section
        style={{
          padding: isMobile ? '3rem 1.5rem' : '5rem 2rem',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? '2rem' : '3rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              color: '#111',
              lineHeight: 1.2,
            }}
          >
            Sobre Nosotros
          </h1>

          <div
            style={{
              fontSize: isMobile ? '1rem' : '1.125rem',
              color: '#555',
              lineHeight: 1.8,
              marginBottom: '2rem',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            <p style={{ marginBottom: '1.5rem' }}>
              En <strong>MONERO</strong>, creemos que la moda es una forma de
              expresión personal que trasciende tendencias pasajeras. Nuestra
              misión es vestir a las personas con elegancia y distinción,
              ofreciendo prendas de alta calidad que combinan estilo
              contemporáneo con comodidad excepcional.
            </p>

            <p style={{ marginBottom: '1.5rem' }}>
              Nos dedicamos a seleccionar cuidadosamente cada pieza de nuestra
              colección, asegurándonos de que cada prenda refleje nuestro
              compromiso con la excelencia y el buen gusto. Queremos que cada
              cliente encuentre en nuestra tienda no solo ropa, sino una
              experiencia de compra memorable.
            </p>

            <p>
              Nuestro objetivo es simple pero ambicioso:{' '}
              <strong>
                hacer que cada persona luzca y se sienta increíble
              </strong>
              , independientemente de la ocasión. Desde el día a día hasta los
              momentos especiales, estamos aquí para acompañarte con estilo.
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section
        style={{
          width: '100%',
          backgroundColor: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: isMobile ? '80vh' : '60vh',
            backgroundColor: '#000',
          }}
        >
          {isMobile ? (
            // Mobile: Vertical video
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
              <source src="/about_us/vertical.mp4" type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          ) : (
            // Desktop: Horizontal video (using vertical for now)
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
              <source src="/about_us/vertical.mp4" type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          )}
        </div>
      </section>

      {/* Map Section */}
      <section
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          padding: isMobile ? '3rem 1rem' : '4rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? '1.75rem' : '2.5rem',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '2rem',
              color: '#111',
            }}
          >
            Encuéntranos
          </h2>

          <div
            style={{
              width: '100%',
              height: isMobile ? '350px' : '450px',
              borderRadius: isMobile ? '8px' : '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.3775280861636!2d-68.12634892393896!3d-16.499773984276156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915f2064c1b6c9cb%3A0x8b8b8b8b8b8b8b8b!2sLa%20Paz%2C%20Bolivia!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de MONERO"
            />
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: '2rem',
            }}
          >
            <p
              style={{
                fontSize: isMobile ? '1rem' : '1.125rem',
                color: '#555',
                marginBottom: '1rem',
              }}
            >
              <strong>Dirección:</strong> Destacamento 317 N° 1110 (Frente al
              mundito), Sucre, Bolivia
            </p>
            <p
              style={{
                fontSize: isMobile ? '1rem' : '1.125rem',
                color: '#555',
                marginBottom: '1rem',
              }}
            >
              <strong>Horario:</strong> Lunes a Sábado, 9:00 AM - 8:00 PM
            </p>
            <a
              href="https://api.whatsapp.com/message/G2LHYOAMPULZP1?autoload=1&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: isMobile ? '1rem' : '1.125rem',
                color: '#555',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s, color 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#25D366';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#555';
              }}
            >
              <svg
                width={isMobile ? '20' : '24'}
                height={isMobile ? '20' : '24'}
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ flexShrink: 0 }}
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span>
                <strong>Teléfono:</strong> 63336892
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section
        style={{
          width: '100%',
          backgroundColor: '#f9fafb',
          padding: isMobile ? '2.5rem 1rem' : '3rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#111',
            textAlign: 'center',
          }}
        >
          Síguenos en Redes Sociales
        </h2>
        <SocialMediaLinks iconSize={isMobile ? 32 : 40} gap="2rem" />
      </section>

      <Footer />
    </>
  );
}
