import CenteredButton from '@/components/CenteredButton';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import NavBar from '@/components/nav/NavBar';
import useIsMobile from '@/hooks/useIsMobile';

export default function Home() {
  // Responsive: use vertical slides for mobile, horizontal for desktop
  const isMobile = useIsMobile();

  // Slides for each mode
  const horSlides = [
    { image: '/images/hor-slide-1-white.png', label: '' },
    { image: '/images/Portadas_web-01-2.jpg', label: '' },
    { image: '/images/Portadas_web-02-2.jpg', label: '' },
  ];
  const verSlides = [
    { image: '/images/ver-slide-1.png', label: '' },
    { image: '/images/ver-slide-2.png', label: '' },
  ];

  return (
    <div className="relative min-h-screen">
      <NavBar />
      {/* First full-screen section */}
      <div className="w-full flex flex-col" style={{ height: '100dvh' }}>
        {/* Top 50% - Primary color with slider */}
        <div style={{ height: '70%' }} className="relative">
          <div className="absolute inset-0">
            <ImageSlider
              direction="horizontal"
              slidesData={isMobile ? verSlides : horSlides}
              autoplayDelay={3500}
            />
          </div>
        </div>
        {/* Bottom 50% - Secondary color, split into 2 rows */}
        <div
          style={{ height: '30%' }}
          className="flex flex-col md:flex-row w-full h-full"
        >
          <div
            className="w-full h-1/2 md:w-1/2 md:h-full bg-cover bg-center relative"
            style={{
              ...(isMobile
                ? {
                    borderTop: '0.3rem solid #fff',
                    borderLeft: '0.3rem solid #fff',
                    borderRight: '0.3rem solid #fff',
                    borderBottom: '0.15rem solid #fff',
                  }
                : {
                    borderTop: '0.3rem solid #fff',
                    borderLeft: '0.3rem solid #fff',
                    borderBottom: '0.3rem solid #fff',
                    borderRight: '0.15rem solid #fff',
                  }),
              backgroundImage: "url('/images/portada-hombres.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <CenteredButton text="Para Ellos" url="/men" />
          </div>
          <div
            className="w-full h-1/2 md:w-1/2 md:h-full bg-cover bg-center relative"
            style={{
              ...(isMobile
                ? {
                    borderLeft: '0.3rem solid #fff',
                    borderRight: '0.3rem solid #fff',
                    borderBottom: '0.3rem solid #fff',
                    borderTop: '0.15rem solid #fff',
                  }
                : {
                    borderTop: '0.3rem solid #fff',
                    borderRight: '0.3rem solid #fff',
                    borderBottom: '0.3rem solid #fff',
                    borderLeft: '0.15rem solid #fff',
                  }),
              backgroundImage: "url('/images/portada-mujeres.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <CenteredButton text="Para Ellas" url="/women" />
          </div>
        </div>
      </div>
      {/* Second full-screen section for scrolling */}
      {/* <div
        className="w-full flex items-center justify-center"
        style={{ background: 'var(--color-white)', height: '100dvh' }}
      >
        <h1 className="text-3xl font-bold text-black">Second Section</h1>
      </div> */}
    </div>
  );
}
