export function SplashScreen() {
  return (
    <div id="splash" className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-splash-out pointer-events-none">
      <div className="w-full max-w-4xl px-4">
        <svg className="svg-splash w-full h-auto" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="400" className="bg" />
          <line x1="60" y1="340" x2="740" y2="340" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
          
          {/* Static Left Chair */}
          <g transform="translate(140, 210)">
            <g className="chair">
              <circle cx="-12" cy="128" r="4" className="secondary" />
              <circle cx="12" cy="128" r="4" className="secondary" />
              <path d="M-12,128 L0,120 L12,128" fill="none" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round" />
              <rect x="-3" y="96" width="6" height="26" className="secondary" />
              <rect x="-22" y="90" width="44" height="6" rx="3" className="secondary" />
              <rect x="-22" y="45" width="6" height="48" rx="3" className="secondary" />
            </g>
          </g>

          {/* Static Right Chair */}
          <g transform="translate(660, 210)">
            <g className="chair">
              <circle cx="-12" cy="128" r="4" className="secondary" />
              <circle cx="12" cy="128" r="4" className="secondary" />
              <path d="M-12,128 L0,120 L12,128" fill="none" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round" />
              <rect x="-3" y="96" width="6" height="26" className="secondary" />
              <rect x="-22" y="90" width="44" height="6" rx="3" className="secondary" />
              <rect x="16" y="45" width="6" height="48" rx="3" className="secondary" />
            </g>
          </g>

          {/* Animated Left Person */}
          <g className="animate-slide-center-left">
            <g transform="translate(140, 210)">
              <path d="M-16,90 Q-16,40 0,40 Q16,40 16,90 Z" className="primary" />
              <g className="animate-bob"><circle cx="0" cy="20" r="18" className="primary" /></g>
              {/* Mug */}
              <g className="animate-hold-mug" transform="translate(20, 50)">
                <rect x="0" y="0" width="14" height="18" rx="2" className="coffee-fill" />
                <path d="M14,4 C19,4 19,12 14,12" fill="none" stroke="#78350F" strokeWidth="2.5" />
              </g>
            </g>
          </g>

          {/* Animated Right Person */}
          <g className="animate-slide-center-right">
            <g transform="translate(660, 210)">
              <path d="M-16,90 Q-16,40 0,40 Q16,40 16,90 Z" className="primary" />
              <g className="animate-bob"><circle cx="0" cy="20" r="18" className="primary" /></g>
              {/* Mug */}
              <g className="animate-hold-mug" transform="translate(-34, 50)">
                <rect x="0" y="0" width="14" height="18" rx="2" className="coffee-fill" />
                <path d="M0,4 C-5,4 -5,12 0,12" fill="none" stroke="#78350F" strokeWidth="2.5" />
              </g>
            </g>
          </g>

          {/* Left Workspace */}
          <g transform="translate(100, 200)">
            <rect x="0" y="100" width="120" height="8" rx="4" className="secondary" />
            <rect x="20" y="108" width="8" height="32" className="secondary" />
            <rect x="90" y="108" width="8" height="32" className="secondary" />
            <rect x="38" y="96" width="16" height="4" rx="1.5" className="primary" />
            <rect x="60" y="96" width="24" height="4" rx="2" className="primary" />
            <path d="M68,96 L76,96 L73,50 L69,50 Z" className="secondary" />
            <rect x="66" y="30" width="8" height="55" rx="3" className="primary" />
          </g>

          {/* Right Workspace */}
          <g transform="translate(580, 200)">
            <rect x="0" y="100" width="120" height="8" rx="4" className="secondary" />
            <rect x="20" y="108" width="8" height="32" className="secondary" />
            <rect x="90" y="108" width="8" height="32" className="secondary" />
            <rect x="66" y="96" width="16" height="4" rx="1.5" className="primary" />
            <rect x="36" y="96" width="24" height="4" rx="2" className="primary" />
            <path d="M44,96 L52,96 L51,50 L47,50 Z" className="secondary" />
            <rect x="46" y="30" width="8" height="55" rx="3" className="primary" />
          </g>

          {/* Center Coffee Station */}
          <g transform="translate(360, 240)">
            <rect x="15" y="60" width="50" height="8" rx="3" className="secondary" />
            <rect x="35" y="68" width="10" height="32" className="secondary" />
            <rect x="25" y="20" width="30" height="40" rx="4" className="primary" />
            <rect x="30" y="30" width="20" height="20" rx="2" fill="#F9FAFB" />
            <rect x="37" y="50" width="6" height="10" className="coffee-fill" />
            <g className="animate-puff">
              <circle cx="37" cy="10" r="4" className="secondary" opacity="0.5" />
              <circle cx="47" cy="5" r="5" className="secondary" opacity="0.5" />
              <circle cx="42" cy="-5" r="3" className="secondary" opacity="0.5" />
            </g>
          </g>

          {/* Chat Bubbles */}
          <g transform="translate(290, 160)">
            <g className="chat-bubble-left">
              <rect x="-25" y="-30" width="50" height="30" rx="10" className="accent" />
              <polygon points="5,0 20,15 15,0" className="accent" />
              <circle cx="-10" cy="-15" r="3" fill="white" />
              <circle cx="0" cy="-15" r="3" fill="white" />
              <circle cx="10" cy="-15" r="3" fill="white" />
            </g>
          </g>

          <g transform="translate(510, 160)">
            <g className="chat-bubble-right">
              <rect x="-25" y="-30" width="50" height="30" rx="10" className="accent" />
              <polygon points="-5,0 -20,15 -15,0" className="accent" />
              <circle cx="-10" cy="-15" r="3" fill="white" />
              <circle cx="0" cy="-15" r="3" fill="white" />
              <circle cx="10" cy="-15" r="3" fill="white" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
