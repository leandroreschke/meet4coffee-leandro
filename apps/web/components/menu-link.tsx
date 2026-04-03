import Link from "next/link";
import { getShadowColor } from "@/lib/utils";

export function MenuLink({
  href,
  title,
  color,
  tiltDeg,
  tapeTiltDeg,
}: {
  href: string;
  title: string;
  color: string;
  tiltDeg?: number;
  tapeTiltDeg?: number;
}) {
  const tilts = [-3.2, -2.1, -1.4, 1.2, 2.3, 3.1];
  const tapeTiltOffsets = [-2.8, -2.1, -1.4, -0.8, -0.2, 0.4, 1.1];
  const hash = `${href}-${title}`
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tilt = tiltDeg ?? tilts[hash % tilts.length];
  const tapeTilt =
    tapeTiltDeg ?? tapeTiltOffsets[hash % tapeTiltOffsets.length] ?? -2;

  return (
    <div className="relative group transition-all duration-300 hover:translate-x-[4px] hover:translate-y-[4px] active:scale-95 block">
      <Link
        href={href}
        transitionTypes={["nav-forward"]}
        className="relative flex h-40 md:h-56 lg:h-64 w-full items-center justify-center outline-none"
        style={{
          rotate: `${tilt}deg`,
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center border-4 border-mocha-earth shadow-[6px_6px_0px_var(--shadow-color,var(--mocha-earth))] transition-shadow duration-300 group-hover:shadow-none"
          style={
            {
              backgroundColor: color,
              borderBottomRightRadius: "10% 25%",
              "--shadow-color": getShadowColor(title),
            } as any
          }
        >
          <span className="relative z-10 px-4 text-center font-display text-5xl md:text-7xl lg:text-8xl font-black text-mocha-earth">
            {title}
          </span>
        </div>
      </Link>

      {/* Adhesive Tape */}
      <div
        className="tape-anim absolute z-20 h-8 w-28 md:h-10 md:w-36 lg:h-12 lg:w-44 -top-4 md:-top-5 lg:-top-6 left-1/2 bg-white/40 shadow-[0_1px_3px_rgba(0,0,0,0.1)] backdrop-blur-lg pointer-events-none"
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          rotate: `${tilt + tapeTilt}deg`,
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
}
