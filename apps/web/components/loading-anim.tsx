import React from "react";

export function LoadingAnim({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 600"
      width="100%"
      height="100%"
      className={className}
    >
      <defs>
        <style>
          {`
                    @import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');
                    
                    .main-text {
                        font-family: 'Lobster', cursive, sans-serif;
                        font-size: 110px;
                        text-anchor: middle;
                    }

                    .rainbow-path {
                        stroke-dasharray: 1000;
                        stroke-dashoffset: 1000;
                        animation: drawRainbow 2s ease-in-out infinite alternate;
                    }

                    .text-path {
                        stroke-dasharray: 2000;
                        stroke-dashoffset: 2000;
                        animation: drawText 2s ease-in-out infinite alternate;
                        fill: none;
                        stroke: #4b3935;
                        stroke-width: 2;
                    }

                    .clink-left {
                        animation: clinkLeftAnim 1.2s cubic-bezier(0.25, 1, 0.5, 1) infinite alternate;
                    }

                    .clink-right {
                        animation: clinkRightAnim 1.2s cubic-bezier(0.25, 1, 0.5, 1) infinite alternate;
                    }

                    .sparks {
                        animation: sparkAnim 1.2s cubic-bezier(0.25, 1, 0.5, 1) infinite alternate;
                        stroke: #4b3935;
                    }

                    @keyframes drawRainbow {
                        0%, 20% { stroke-dashoffset: 1000; }
                        100% { stroke-dashoffset: 0; }
                    }

                    @keyframes drawText {
                        0%, 20% { stroke-dashoffset: 2000; fill-opacity: 0; }
                        80% { stroke-dashoffset: 0; fill-opacity: 0; }
                        100% { stroke-dashoffset: 0; fill-opacity: 1; }
                    }

                    @keyframes clinkLeftAnim {
                        0%, 20% { transform: translate(320px, 310px) rotate(-15deg); }
                        100% { transform: translate(370px, 310px) rotate(20deg); }
                    }

                    @keyframes clinkRightAnim {
                        0%, 20% { transform: translate(480px, 310px) rotate(15deg); }
                        100% { transform: translate(430px, 310px) rotate(-20deg); }
                    }

                    @keyframes sparkAnim {
                        0%, 80% { opacity: 0; transform: translate(400px, 268px) scale(0.5); }
                        100% { opacity: 1; transform: translate(400px, 268px) scale(1.2); }
                    }
                    `}
        </style>

        <text id="meet-text" x="400" y="450" className="main-text">
          Meet4Coffee
        </text>

        <g id="star-fill">
          <path
            d="M 0,-25 Q 0,0 25,0 Q 0,0 0,25 Q 0,0 -25,0 Q 0,0 0,-25 Z"
            fill="#f0e7d5"
            stroke="#4b3935"
            strokeWidth="8"
            strokeLinejoin="round"
          />
        </g>
        <g id="star-black">
          <path
            d="M 0,-15 Q 0,0 15,0 Q 0,0 0,15 Q 0,0 -15,0 Q 0,0 0,-15 Z"
            fill="#4b3935"
          />
        </g>
      </defs>

      <use href="#star-black" transform="translate(150, 140)" />
      <use href="#star-fill" transform="translate(90, 210) scale(0.9)" />
      <use href="#star-fill" transform="translate(680, 130) scale(0.9)" />
      <use href="#star-black" transform="translate(730, 190) scale(0.8)" />
      <use href="#star-black" transform="translate(620, 80) scale(0.7)" />

      <g transform="translate(400, 290)">
        <path
          d="M -260,0 A 260 260 0 0 1 260,0 L 70,0 A 70 70 0 0 0 -70,0 Z"
          fill="#4b3935"
        />

        <path
          d="M -224,0 A 224 224 0 0 1 224,0"
          fill="none"
          stroke="#D8C7F0"
          strokeWidth="40"
          className="rainbow-path"
          style={{ animationDelay: "0s" }}
        />
        <path
          d="M -168,0 A 168 168 0 0 1 168,0"
          fill="none"
          stroke="#F7C6D9"
          strokeWidth="40"
          className="rainbow-path"
          style={{ animationDelay: "0.2s" }}
        />
        <path
          d="M -112,0 A 112 112 0 0 1 112,0"
          fill="none"
          stroke="#FFE58A"
          strokeWidth="40"
          className="rainbow-path"
          style={{ animationDelay: "0.4s" }}
        />
      </g>

      <g className="clink-left">
        <path
          d="M -30,0 C -80,-15 -80,50 -30,35"
          fill="none"
          stroke="#4b3935"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M -45,-30 L 45,-30 L 35,45 C 35,70 -35,70 -40,45 Z"
          fill="#4b3935"
          stroke="#4b3935"
          strokeWidth="20"
          strokeLinejoin="round"
        />
        <path
          d="M -30,0 C -80,-15 -80,50 -30,35"
          fill="none"
          stroke="#f0e7d5"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M -45,-30 L 45,-30 L 35,45 C 35,70 -35,70 -40,45 Z"
          fill="#f0e7d5"
        />
      </g>

      <g className="clink-right">
        <path
          d="M 30,0 C 80,-15 80,50 30,35"
          fill="none"
          stroke="#4b3935"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M -45,-30 L 45,-30 L 35,45 C 35,70 -35,70 -40,45 Z"
          fill="#4b3935"
          stroke="#4b3935"
          strokeWidth="20"
          strokeLinejoin="round"
        />
        <path
          d="M 30,0 C 80,-15 80,50 30,35"
          fill="none"
          stroke="#f0e7d5"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M -45,-30 L 45,-30 L 35,45 C 35,70 -35,70 -40,45 Z"
          fill="#f0e7d5"
        />
      </g>

      <g
        stroke="#4b3935"
        strokeWidth="10"
        strokeLinecap="round"
        className="sparks"
      >
        <path d="M 0,-20 L 0,-32 M -15,-15 L -25,-25 M 15,-15 L 25,-25" />
      </g>

      <g transform="rotate(-4, 400, 450)">
        <use href="#meet-text" className="text-path" />
        <use
          href="#meet-text"
          fill="#f0e7d5"
          stroke="#4b3935"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <use href="#meet-text" fill="#f0e7d5" />
      </g>
    </svg>
  );
}
