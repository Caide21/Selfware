// components/Enchantments/PurpleSheen.jsx
export default function PurpleSheen({
  always = false,      // true = loop forever, false = run only on hover
  className = '',       // extra classes
  duration = 1.25,      // seconds per sweep
  delay = 0,            // delay before starting (seconds)
}) {
  const modeClass = always ? 'sheen-loop' : 'sheen-hover';

  return (
    <div className={`pointer-events-none absolute -inset-10 ${modeClass} ${className}`}>
      <div
        className="w-[45%] h-[160%] rotate-[14deg] opacity-70"
        style={{
          background:
            'linear-gradient(90deg, rgba(139,92,246,0) 0%, rgba(139,92,246,.25) 40%, rgba(216,180,254,.55) 50%, rgba(139,92,246,.25) 60%, rgba(139,92,246,0) 100%)',
          filter: 'blur(10px)',
          borderRadius: '24px',
          animationDelay: `${delay}s`,
        }}
      />
      <style jsx>{`
        @keyframes purpleSheenSweep {
          0%   { transform: translateX(-140%) translateY(-10%); }
          60%  { transform: translateX(15%)   translateY(0%);   }
          100% { transform: translateX(140%)  translateY(10%);  }
        }
        .sheen-hover { opacity: 0; }
        .group:hover .sheen-hover {
          opacity: 1;
          animation: purpleSheenSweep ${duration}s ease-out forwards;
        }
        .sheen-loop div {
          animation: purpleSheenSweep ${duration}s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
