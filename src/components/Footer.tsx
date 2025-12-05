import SocialMediaLinks from './SocialMediaLinks';

const Footer: React.FC = () => {
  return (
    <footer className="w-full" style={{ backgroundColor: '#f8f8f8' }}>
      <div className="mx-auto w-full" style={{ padding: '1rem' }}>
        {/* Row 1: Social icons centered */}
        <div
          className="w-full flex justify-center items-center"
          style={{ marginBottom: 8 }}
        >
          <SocialMediaLinks gap="1.5rem" />
        </div>

        {/* Row 2: Copyright / existing label */}
        <div className="w-full">
          <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
            © {new Date().getFullYear()} Tu Tienda de Ropa Monero. Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
