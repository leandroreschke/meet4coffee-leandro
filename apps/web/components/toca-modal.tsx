"use client";

import { type ReactNode, useState } from "react";
import { getShadowColor } from "@/lib/utils";

export function TocaModal({
  trigger,
  title,
  children,
  id,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  id: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="surface-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 md:p-8 relative animate-in fade-in zoom-in-95 duration-200"
            style={{ '--shadow-color': getShadowColor(id) } as any}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Close modal"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            
            <h2 className="font-display text-3xl font-black text-stone-900 mb-6">{title}</h2>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
