import React from 'react';
import GalleryTile from '@/components/GalleryTile';
import SectionHeader from '@/components/SectionHeader';
import './OutfitsSection.css';

type OutfitItem = {
  id: number;
  src: string;
  label: string;
  href: string;
};

type OutfitsSectionProps = {
  galleryOutfits: OutfitItem[];
  gender: string;
  isMobile: boolean;
  outfitsUrl: string;
};

const OutfitsSection: React.FC<OutfitsSectionProps> = ({
  galleryOutfits,
  gender,
  isMobile,
  outfitsUrl,
}) => {
  return (
    <div className="outfits-section">
      <SectionHeader
        title="MIRA LOS OUTFITS"
        subtitle="Hecha un vistazo a todos los outfits que preparamos para ti. Listos para cada ocasión, inspírate y encuentra tu estilo."
        fontColor="var(--color-primary)"
        isMobile={isMobile}
      />
      <div className="outfits-section__gallery-wrapper">
        <div
          className={`outfits-section__tiles ${
            isMobile
              ? 'outfits-section__tiles--mobile'
              : 'outfits-section__tiles--desktop'
          }`}
        >
          {galleryOutfits.map((outfit, idx) => (
            <GalleryTile
              key={outfit.id}
              src={outfit.src}
              label={outfit.label}
              isMobile={isMobile}
              idx={idx}
              priority={idx === 0}
              href={outfit.href}
            />
          ))}

          {/* Static "Ver todos" tile */}
          <GalleryTile
            src={
              gender === 'men'
                ? '/categories/Outfits-men.jpg'
                : '/categories/all-outfits.jpg'
            }
            label="Ver todos"
            isMobile={isMobile}
            priority={false}
            href={outfitsUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default OutfitsSection;
