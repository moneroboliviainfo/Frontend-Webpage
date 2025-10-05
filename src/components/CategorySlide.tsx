import React from 'react';
import Image from 'next/image';

interface CategorySlideProps {
  name: string;
  image: string;
  width: string;
  height: string;
}

const CategorySlide: React.FC<CategorySlideProps> = ({
  name,
  image,
  width,
  height,
}) => (
  <li
    className="text-sm cursor-pointer hover:bg-gray-200 transition flex items-center flex-shrink-0"
    style={{
      width,
      height,
      minWidth: width,
      minHeight: height,
      maxWidth: width,
      maxHeight: height,
      position: 'relative',
      overflow: 'hidden',
      borderColor: 'white',
      borderStyle: 'solid',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Image src={image} alt={name} fill className="object-cover" sizes={width} />
    <span
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1.1rem',
        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        zIndex: 2,
        textAlign: 'center',
        width: '90%',
      }}
    >
      {name}
    </span>
  </li>
);

export default CategorySlide;
