import SocialMediaLinks from './SocialMediaLinks';
import './Footer.css';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__social">
          <SocialMediaLinks gap="1.5rem" />
        </div>

        <div>
          <p className="footer__copyright">
            © {year} Tu Tienda de Ropa Monero. Todos los derechos reservados.
          </p>
        </div>

        <div className="footer__dev">
          <a
            className="footer__dev-link"
            href="https://wa.me/59160313229"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="footer__dev-text">Desarrollado por</span>
            <img
              className="footer__dev-logo"
              src="/logos/devop-icon.png"
              alt="DevOp"
              width={28}
              height={28}
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
