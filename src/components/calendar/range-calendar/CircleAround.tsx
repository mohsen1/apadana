import { type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

interface CircleAroundProps extends HTMLAttributes<SVGElement> {
  color?: string;
  animationDuration?: number;
  className?: string;
}

export function CircleAround({
  color = 'currentColor',
  animationDuration = 0.5,
  className,
  children,
  ...props
}: CircleAroundProps) {
  return (
    <div className='relative h-full w-full'>
      <svg
        version='1.0'
        xmlns='http://www.w3.org/2000/svg'
        width='190%'
        height='170%'
        viewBox='105 90 215 150'
        preserveAspectRatio='xMidYMid meet'
        className={cn('absolute inset-0 left-[-45%] top-[-30%] z-10', className)}
        {...props}
      >
        <defs>
          <style>
            {`
              @keyframes revealCircle {
                0%   { stroke-dashoffset: 1256; }
                100% { stroke-dashoffset: 0; }
              }
              #arc {
                animation-name: revealCircle;
                animation-duration: ${animationDuration}s;
                animation-timing-function: ease-in-out;
                animation-delay: 600ms;
                animation-fill-mode: forwards;
              }
            `}
          </style>
          <mask id='circleMask'>
            <circle
              id='arc'
              cx='210'
              cy='210'
              r='200'
              transform='rotate(-83,210,210)'
              fill='none'
              stroke='white'
              strokeWidth='400'
              strokeDasharray='1256'
              strokeDashoffset='1256'
            />
          </mask>
        </defs>

        <g mask='url(#circleMask)'>
          <g transform='translate(0,340) scale(0.1,-0.1)' fill={color} stroke='none'>
            <path
              d='M2350 2533 c-8 -3 -30 -14 -48 -25 -41 -25 -30 -43 31 -53 23 -4 47 -10
                     52 -14 6 -4 26 -12 46 -19 59 -20 199 -99 264 -149 109 -85 163 -157
                     211 -278 27 -69 27 -256 0 -335 -137 -402 -511 -669 -940 -670 -275 0
                     -485 122 -598 349 l-43 86 0 135 c0 144 7 175 61 283 117 231 373 440
                     634 517 87 26 150 58 150 77 0 17 -7 17 -96 -7 -282 -76 -562 -232
                     -719 -402 -83 -89 -164 -218 -197 -312 -24 -71 -28 -96 -28 -196 0 -138
                     19 -216 79 -318 63 -109 167 -190 306 -240 82 -29 180 -42 328 -42
                     536 0 1016 264 1206 664 53 109 71 191 71 314 0 87 -4 111 -27 169
                     -34 86 -72 142 -141 209 -96 95 -260 190 -419 243 -58 20 -149 26
                     -183 14z'
            />
          </g>
        </g>
      </svg>
      {children}
    </div>
  );
}
