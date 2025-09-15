interface NewRouletteProps {
  messages: string[];
}

// Overlapping roulette message bar at the bottom of the slider
const NewsRoulette: React.FC<NewRouletteProps> = ({ messages }) => {
  return (
    <div
      className="absolute left-0 bottom-0 w-full flex items-center justify-center"
      style={{
        height: '2.2rem',
        background: 'rgba(250,250,250,0.5)',
        color: '#000',
        zIndex: 1, // Lower z-index so it's behind dialogs
        fontWeight: 600,
        fontSize: '1.1rem',
        borderTop: '1px solid black',
        borderBottom: '1px solid black',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          animation: 'marquee 10000s linear infinite',
          paddingLeft: '100%',
        }}
      >
        {Array(600)
          .fill(`${messages.join(' // ')} // `)
          .join('')}
      </span>
      <style>{`
                @keyframes marquee {
                  0%   { transform: translateX(0); }
                  100% { transform: translateX(-100%); }
                }
              `}</style>
    </div>
  );
};

export default NewsRoulette;
