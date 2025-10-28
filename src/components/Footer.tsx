import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6';

const Footer: React.FC = () => {
  return (
    <footer className="w-full" style={{ backgroundColor: '#f8f8f8' }}>
      <div className="mx-auto w-full" style={{ padding: '1rem' }}>
        {/* Row 1: Social icons centered */}
        <div
          className="w-full flex justify-center items-center"
          style={{ marginBottom: 8 }}
        >
          <div className="flex gap-6" style={{ marginBottom: '0.5rem' }}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook size={26} className="text-blue-700" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram size={26} className="text-pink-500" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <FaTiktok size={26} className="text-black" />
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={26} className="text-green-600" />
            </a>
          </div>
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
