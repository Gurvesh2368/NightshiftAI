import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface HoldButtonProps {
  durationMs?: number;
  onTrigger: () => void;
  label?: string;
  sublabel?: string;
}

export const HoldButton: React.FC<HoldButtonProps> = ({
  durationMs = 2000,
  onTrigger,
  label = 'HOLD FOR 2 SECONDS',
  sublabel = 'Alerts your emergency contacts with live GPS link'
}) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startHold = () => {
    setIsHolding(true);
    startTimeRef.current = performance.now();

    const loop = (time: number) => {
      if (!startTimeRef.current) return;
      const elapsed = time - startTimeRef.current;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);

      if (pct >= 100) {
        setIsHolding(false);
        setProgress(0);
        startTimeRef.current = null;
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        onTrigger();
        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const endHold = () => {
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const size = 190;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className="relative flex items-center justify-center cursor-pointer touch-none"
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        onTouchCancel={endHold}
      >
        {/* Animated Progress Ring SVG */}
        <svg width={size} height={size} className="-rotate-90 transform">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2E3236"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#D41A3A"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-75"
          />
        </svg>

        {/* Center Glowing SOS Core Button */}
        <div
          className={`absolute flex flex-col items-center justify-center w-36 h-36 rounded-full gradient-sos text-white transition-transform ${
            isHolding ? 'scale-95 brightness-125' : 'hover:scale-105'
          }`}
        >
          <AlertTriangle className={`h-10 w-10 mb-1 ${isHolding ? 'animate-bounce' : ''}`} />
          <span className="text-2xl font-black tracking-wider">SOS</span>
          <span className="text-[10px] font-semibold tracking-wider uppercase opacity-90">
            {isHolding ? `${Math.round(progress)}%` : 'HOLD 2s'}
          </span>
        </div>
      </div>

      <div className="mt-4 text-center max-w-xs">
        <div className="text-sm font-bold text-[#ECEEF3]">{label}</div>
        <div className="text-xs text-[#A3A8B0] mt-1 leading-relaxed">{sublabel}</div>
      </div>
    </div>
  );
};

