import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

type Props = {
  title: string;
  subtitle?: string;
  fontColor?: string;
  isMobile?: boolean;
};

const SectionHeader: React.FC<Props> = ({
  title,
  subtitle,
  fontColor = '#374151',
  isMobile = false,
}) => {
  // On desktop insert a line break after the first sentence if possible (only when subtitle is provided).
  const formattedSubtitle = subtitle
    ? !isMobile
      ? (() => {
          const split = subtitle.split('. ');
          if (split.length > 1)
            return (
              <>
                {split[0]}.<br />
                {split.slice(1).join('. ')}
              </>
            );
          return subtitle;
        })()
      : subtitle
    : null;

  const titleFontSize = isMobile ? '2rem' : '3rem';
  const arrowSize = isMobile
    ? { width: '2.5rem', height: '3rem' }
    : { width: '4rem', height: '3rem' };

  return (
    <div
      className="flex flex-col md:flex-row items-start md:items-center w-full"
      style={isMobile ? { paddingTop: '0.5rem' } : { padding: '2rem 1rem' }}
    >
      {/* Title column */}
      <div className="flex items-center" style={{ paddingLeft: '0.3rem' }}>
        <h1
          className="font-bold flex items-center gap-2 flex-1 min-w-0"
          style={{
            fontSize: titleFontSize,
            fontWeight: 'bold',
            lineHeight: 1.1,
            color: fontColor,
            overflowWrap: 'break-word',
          }}
        >
          <FiArrowRight style={{ ...arrowSize, fontWeight: 'bold' }} />
          <span style={{ display: 'inline' }}>{title}</span>
        </h1>
      </div>

      {/* Subtitle column (render only if subtitle provided) */}
      {formattedSubtitle && (
        <div className="flex items-center" style={{ paddingLeft: '0.75rem' }}>
          <span
            className="text-base md:text-lg font-normal mt-2 md:mt-0"
            style={{ lineHeight: 1.2, color: fontColor }}
          >
            {formattedSubtitle}
          </span>
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
