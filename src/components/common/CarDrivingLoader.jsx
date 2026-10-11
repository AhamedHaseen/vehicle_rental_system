import React, { useState, useEffect } from 'react';
import { Gauge, Sparkles } from 'lucide-react';

export const CarDrivingLoader = ({ onComplete, duration = 1400 }) => {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isAcceleratingOut, setIsAcceleratingOut] = useState(false);
  const [statusText, setStatusText] = useState('Igniting Twin-Turbo Engine...');

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);
      setSpeed(Math.min(Math.round(pct * 1.4), 140));

      if (pct < 35) {
        setStatusText('Checking Islandwide Fleet Telemetry...');
      } else if (pct < 75) {
        setStatusText('Calibrating Dynamic Booking Engine...');
      } else if (pct < 100) {
        setStatusText('Cleared for Takeoff. Welcome to RentFlow!');
      } else {
        clearInterval(interval);
        setIsAcceleratingOut(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 400);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl text-white transition-opacity duration-300 ${isAcceleratingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[300px] bg-[#0373b9]/25 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Brand Watermark / Title */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-[#0373b9] flex items-center justify-center text-white shadow-lg shadow-[#0373b9]/30 font-black">
          RF
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#38bdf8] bg-clip-text text-transparent">
            RentFlow
          </span>
          <span className="block text-[10px] uppercase tracking-widest text-[#38bdf8] font-bold">
            Premier Islandwide Fleet
          </span>
        </div>
      </div>

      {/* Main Driving Stage */}
      <div className="relative w-full max-w-lg px-6 flex flex-col items-center">
        {/* The Animated Car */}
        <div
          className={`relative transition-transform duration-500 ease-in ${isAcceleratingOut ? 'translate-x-[400px] scale-95 opacity-0' : 'translate-x-0'
            }`}
        >
          {/* Headlight beam illuminating the road */}
          <div
            className="absolute -right-32 top-8 w-44 h-16 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at left, rgba(56, 189, 248, 0.45), rgba(56, 189, 248, 0) 70%)',
              transform: 'perspective(200px) rotateY(-20deg)',
              filter: 'blur(4px)'
            }}
          />

          {/* Exhaust wind streaks */}
          <div className="absolute -left-12 top-11 flex flex-col gap-1.5 opacity-70">
            <div className="w-8 h-0.5 bg-gradient-to-l from-sky-400 to-transparent animate-pulse rounded-full" />
            <div className="w-12 h-0.5 bg-gradient-to-l from-sky-400/80 to-transparent animate-pulse delay-75 rounded-full" />
            <div className="w-6 h-0.5 bg-gradient-to-l from-sky-300 to-transparent animate-pulse delay-150 rounded-full" />
          </div>

          {/* Car Body Vector with Suspension Bounce Animation */}
          <div className="animate-car-bounce">
            <svg
              className="w-48 sm:w-56 h-auto drop-shadow-[0_10px_20px_rgba(3,115,185,0.4)]"
              viewBox="0 0 240 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Car Body Gradient */}
              <defs>
                <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="50%" stopColor="#0373b9" />
                  <stop offset="100%" stopColor="#024974" />
                </linearGradient>
                <linearGradient id="windshieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.35" />
                </linearGradient>
                <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
              </defs>

              {/* Chassis Underglow */}
              <ellipse cx="120" cy="74" rx="90" ry="6" fill="#0373b9" opacity="0.6" filter="blur(4px)" />

              {/* Lower Body Sill */}
              <path
                d="M30 68 C 50 68, 60 70, 75 70 C 90 70, 150 70, 165 70 C 180 70, 200 68, 220 62 L 215 54 L 25 56 Z"
                fill="#0f172a"
              />

              {/* Main Body Shell */}
              <path
                d="M18 56 C 22 46, 32 40, 48 38 L 82 36 C 96 24, 114 16, 138 16 L 168 16 C 188 16, 202 24, 214 36 L 226 44 C 234 49, 238 54, 236 60 C 233 65, 226 66, 216 66 L 26 66 C 18 66, 14 62, 18 56 Z"
                fill="url(#carBodyGrad)"
              />

              {/* Cabin Roof & Windows */}
              <path
                d="M86 36 L 102 20 C 108 18, 118 18, 138 18 L 166 18 C 178 18, 188 24, 196 36 Z"
                fill="#021c32"
              />
              {/* Front Windshield */}
              <path
                d="M166 21 L 192 36 L 152 36 L 148 21 Z"
                fill="url(#windshieldGrad)"
              />
              {/* Side Window */}
              <path
                d="M106 21 L 142 21 L 146 36 L 94 36 Z"
                fill="url(#windshieldGrad)"
              />

              {/* Front LED Headlight */}
              <path
                d="M222 45 C 228 47, 234 50, 230 54 L 216 54 Z"
                fill="#38bdf8"
                filter="drop-shadow(0 0 4px #38bdf8)"
              />

              {/* Rear Tail Light */}
              <path
                d="M18 52 C 16 50, 16 48, 22 47 L 26 53 Z"
                fill="#f43f5e"
                filter="drop-shadow(0 0 6px #f43f5e)"
              />

              {/* Aerodynamic Side Crease Line */}
              <path
                d="M48 48 Q 120 44 212 48"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
              />

              {/* Wheel Arches Cutouts */}
              <circle cx="58" cy="66" r="17" fill="#020617" />
              <circle cx="184" cy="66" r="17" fill="#020617" />

              {/* Rear Wheel (Spinning) */}
              <g className="animate-wheel-spin" style={{ transformOrigin: '58px 66px' }}>
                <circle cx="58" cy="66" r="14" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <circle cx="58" cy="66" r="8" fill="url(#rimGrad)" />
                <circle cx="58" cy="66" r="3" fill="#0f172a" />
                <line x1="58" y1="58" x2="58" y2="74" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="50" y1="66" x2="66" y2="66" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="52" y1="60" x2="64" y2="72" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="52" y1="72" x2="64" y2="60" stroke="#0f172a" strokeWidth="1.5" />
              </g>

              {/* Front Wheel (Spinning) */}
              <g className="animate-wheel-spin" style={{ transformOrigin: '184px 66px' }}>
                <circle cx="184" cy="66" r="14" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <circle cx="184" cy="66" r="8" fill="url(#rimGrad)" />
                <circle cx="184" cy="66" r="3" fill="#0f172a" />
                <line x1="184" y1="58" x2="184" y2="74" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="176" y1="66" x2="192" y2="66" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="178" y1="60" x2="190" y2="72" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="178" y1="72" x2="190" y2="60" stroke="#0f172a" strokeWidth="1.5" />
              </g>
            </svg>
          </div>
        </div>

        {/* Road Surface with moving dashed stripes */}
        <div className="w-full relative h-10 mt-[-10px] overflow-hidden flex flex-col justify-center">
          {/* Asphalt top line */}
          <div className="w-full h-[2px] bg-slate-700/80 shadow-sm" />

          {/* Road center dashed line */}
          <div className="w-[200%] h-[3px] flex items-center animate-road-drive my-1.5">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="inline-block w-8 h-[3px] bg-amber-400 mx-4 shrink-0 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              />
            ))}
          </div>

          {/* Asphalt bottom edge */}
          <div className="w-full h-[2px] bg-slate-800" />
        </div>

        {/* Telemetry & Progress Info */}
        <div className="w-full max-w-sm mt-8 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8] animate-spin" />
              {statusText}
            </span>
            <span className="font-mono font-bold text-[#38bdf8] flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              {speed} KM/H
            </span>
          </div>

          {/* Smooth Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#0373b9] via-[#0284c7] to-[#38bdf8] rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
            <span>Islandwide Dispatch Engine</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
