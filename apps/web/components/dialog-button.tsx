import React from 'react';
import { DialogBalloon } from './dialog-balloon';

export function DialogButton({
  children,
  onClick,
  color = '#4F46E5',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-48 h-16 transition-transform hover:scale-105 active:scale-95"
    >
      <div className="absolute inset-0 z-0">
        <DialogBalloon width="100%" height="100%" color={color} />
      </div>
      <span className="relative z-10 text-white font-bold pb-2">{children}</span>
    </button>
  );
}
