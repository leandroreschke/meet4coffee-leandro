"use client";

import { useEffect, useState } from "react";

type CenterToastProps = {
  message: string;
  variant: "success" | "error";
};

export function CenterToast({ message, variant }: CenterToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 3600);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) {
    return null;
  }

  const palette =
    variant === "success"
      ? "bg-matcha-latte text-mocha-earth"
      : "bg-rose-200 text-mocha-earth";

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className={`pointer-events-auto max-w-xl rounded-[1.8rem] border-4 border-mocha-earth px-6 py-4 text-center font-black shadow-[8px_8px_0px_var(--mocha-earth)] ${palette}`}
        role="status"
        aria-live="polite"
      >
        <p className="text-base md:text-lg">{message}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="mt-3 rounded-full border-2 border-mocha-earth bg-white px-4 py-1 text-xs uppercase tracking-[0.14em] text-mocha-earth"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
