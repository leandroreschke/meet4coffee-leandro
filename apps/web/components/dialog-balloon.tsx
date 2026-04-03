import React from 'react';

export interface DialogBalloonProps extends React.SVGProps<SVGSVGElement> {
  /** The width of the balloon graphic */
  width?: number | string;
  /** The height of the balloon graphic */
  height?: number | string;
  /** The primary fill color of the balloon */
  color?: string;
  /** Option to stroke the SVG or fill it. Usually balloons have solid colors. */
  variant?: 'fill' | 'outline';
  /** The thickness of the stroke if variant is 'outline' */
  strokeWidth?: number;
  /** The direction of the speech tail */
  tailDirection?: 'left' | 'right' | 'center';
}

export function DialogBalloon({
  width = 100,
  height = 100,
  color = 'currentColor',
  variant = 'fill',
  strokeWidth = 2,
  tailDirection = 'left',
  ...props
}: DialogBalloonProps) {
  // Returns SVG path based on tail position
  const getPath = () => {
    switch (tailDirection) {
      case 'right':
        return 'M 10 0 H 90 A 10 10 0 0 1 100 10 V 70 A 10 10 0 0 1 90 80 H 75 L 80 100 L 60 80 H 10 A 10 10 0 0 1 0 70 V 10 A 10 10 0 0 1 10 0 Z';
      case 'center':
        return 'M 10 0 H 90 A 10 10 0 0 1 100 10 V 70 A 10 10 0 0 1 90 80 H 60 L 50 100 L 40 80 H 10 A 10 10 0 0 1 0 70 V 10 A 10 10 0 0 1 10 0 Z';
      case 'left':
      default:
        // Tail is on the bottom-left side
        return 'M 10 0 H 90 A 10 10 0 0 1 100 10 V 70 A 10 10 0 0 1 90 80 H 40 L 20 100 L 25 80 H 10 A 10 10 0 0 1 0 70 V 10 A 10 10 0 0 1 10 0 Z';
    }
  };

  const isOutline = variant === 'outline';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 -2 100 104" // Slightly padded to avoid clipping strokes
      fill={isOutline ? 'none' : color}
      stroke={isOutline ? color : 'none'}
      strokeWidth={isOutline ? strokeWidth : undefined}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d={getPath()} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default DialogBalloon;
