"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function DynamicLogo() {
  const beeRef = useRef<SVGGElement>(null);

  const celebrate = () => {
    if (!beeRef.current) return;
    beeRef.current.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0)' }
    ], {
      duration: 300,
      iterations: 2
    });
  };

  return (
    <Link href="/" className="group flex items-center gap-3" onClick={celebrate}>
      <div className="relative h-12 w-12 transition-transform duration-300 group-hover:scale-110">
        <svg width="48" height="48" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFB300"/>
              <stop offset="100%" stopColor="#FF8F00"/>
            </linearGradient>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#42A5F5"/>
              <stop offset="100%" stopColor="#1565C0"/>
            </linearGradient>
          </defs>
          
          {/* Radar Waves */}
          <circle cx="60" cy="60" r="45" fill="none" stroke="url(#blueGradient)" strokeWidth="1" className="animate-radar" style={{ animationDelay: '0s' }} />
          <circle cx="60" cy="60" r="35" fill="none" stroke="url(#blueGradient)" strokeWidth="1" className="animate-radar" style={{ animationDelay: '0.5s' }} />
          <circle cx="60" cy="60" r="25" fill="none" stroke="url(#blueGradient)" strokeWidth="1" className="animate-radar" style={{ animationDelay: '1s' }} />
          
          {/* Bee/Hive Symbol */}
          <g ref={beeRef} className="bee-symbol transition-transform duration-300">
            {/* Bee Body */}
            <ellipse cx="60" cy="60" rx="18" ry="12" fill="url(#goldGradient)" className="bee-body" />
            
            {/* Bee Stripes */}
            <rect x="55" y="48" width="10" height="24" fill="#163250" />
            <rect x="50" y="52" width="20" height="4" fill="#163250" />
            <rect x="50" y="60" width="20" height="4" fill="#163250" />
            <rect x="50" y="68" width="20" height="4" fill="#163250" />
            
            {/* Bee Wings */}
            <path d="M45 55 Q60 45 75 55" fill="white" fillOpacity="0.8" stroke="#E0E0E0" strokeWidth="0.5" />
            <path d="M45 65 Q60 75 75 65" fill="white" fillOpacity="0.8" stroke="#E0E0E0" strokeWidth="0.5" />
          </g>
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tightest bg-gradient-primary bg-clip-text text-transparent group-hover:text-brand-primaryDark transition-all duration-300">
        Careers.mt
      </span>
    </Link>
  );
}
