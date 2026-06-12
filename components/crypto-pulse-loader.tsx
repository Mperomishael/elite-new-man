'use client'

export function CryptoPulseLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="relative w-24 h-24">
        {/* Outer pulse rings */}
        <div className="absolute inset-0 rounded-full border-2 border-lime-400/30 animate-pulse-ring-1"></div>
        <div className="absolute inset-2 rounded-full border-2 border-lime-400/20 animate-pulse-ring-2"></div>
        <div className="absolute inset-4 rounded-full border-2 border-lime-400/10 animate-pulse-ring-3"></div>

        {/* Center crypto wave */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
            {/* Wave animation lines */}
            <path
              d="M 10 50 Q 25 30, 40 50 T 70 50 T 100 50"
              stroke="#d4ff00"
              strokeWidth="2"
              className="animate-crypto-wave-1"
              strokeLinecap="round"
            />
            <path
              d="M 10 60 Q 25 40, 40 60 T 70 60 T 100 60"
              stroke="#d4ff00"
              strokeWidth="2"
              className="animate-crypto-wave-2"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M 10 40 Q 25 20, 40 40 T 70 40 T 100 40"
              stroke="#d4ff00"
              strokeWidth="2"
              className="animate-crypto-wave-3"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Pulse dot in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-ring-1 {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        @keyframes pulse-ring-2 {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes pulse-ring-3 {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes crypto-wave-1 {
          0% {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          50% {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 100;
            stroke-dashoffset: -100;
          }
        }

        @keyframes crypto-wave-2 {
          0% {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          50% {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 100;
            stroke-dashoffset: -100;
          }
        }

        @keyframes crypto-wave-3 {
          0% {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          50% {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 100;
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  )
}
