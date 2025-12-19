import React from 'react';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6';

interface SocialMediaLinksProps {
  iconSize?: number;
  showLabel?: boolean;
  gap?: string;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  iconSize = 26,
  showLabel = false,
  gap = '1.5rem',
}) => {
  return (
    <div className="flex flex-col items-center">
      {showLabel && (
        <span className="text-gray-700 text-lg font-semibold mb-2">
          Síguenos
        </span>
      )}
      <div className="flex" style={{ gap }}>
        <a
          href="https://www.facebook.com/profile.php?id=61577714284167"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebook size={iconSize} className="text-blue-700" />
        </a>
        <a
          href="https://www.instagram.com/moneroget/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram size={iconSize} className="text-pink-500" />
        </a>
        <a
          href="https://www.tiktok.com/@moneroget"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
        >
          <FaTiktok size={iconSize} className="text-black" />
        </a>
        <a
          href="https://wa.me/message/G2LHYOAMPULZP1"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          <FaWhatsapp size={iconSize} className="text-green-600" />
        </a>
      </div>
    </div>
  );
};

export default SocialMediaLinks;
