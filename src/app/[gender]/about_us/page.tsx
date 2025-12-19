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
              <strong>Dirección:</strong> Calle Principal #123, La Paz, Bolivia
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
            <p
              style={{
                fontSize: isMobile ? '1rem' : '1.125rem',
                color: '#555',
              }}
            >
              <strong>Teléfono:</strong> +591 123 456 789
            </p>
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
