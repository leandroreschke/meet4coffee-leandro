import { LoadingAnim } from "./loading-anim";

export function SplashScreen() {
  return (
    <div id="splash" className="fixed inset-0 z-50 bg-[#FAF6F0] flex flex-col items-center justify-center animate-splash-out pointer-events-none">
      <div className="w-full max-w-4xl px-4">
        <LoadingAnim className="w-full h-auto" />
      </div>
    </div>
  );
}
