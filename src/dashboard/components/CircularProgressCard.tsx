import type { MouseEvent } from "react";
import { useEffect, useState, useRef } from "react";

interface CircularProgressCardProps {
  value: number;
  maxValue: number;
  label: string;
  subtext: string;
  gradient: string;
  isDark: boolean;
  onClick?: () => void;
}

export function CircularProgressCard({
  value,
  maxValue,
  label,
  subtext,
  gradient,
  isDark,
  onClick
}: CircularProgressCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const percentage = (value / maxValue) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = ((y - centerY) / centerY) * -5; // Max 5 degrees
    const tiltY = ((x - centerX) / centerX) * 5;
    
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group w-full text-center p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isDark
          ? 'bg-white/5 border-white/10 hover:border-white/20'
          : 'bg-white border-gray-200 hover:border-teal-300'
      }`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.05 : 1})`,
        transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
        boxShadow: isHovered 
          ? isDark
            ? '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(20, 184, 166, 0.15)'
            : '0 10px 30px rgba(0, 0, 0, 0.08), 0 0 15px rgba(20, 184, 166, 0.1)'
          : 'none',
      }}
    >
      {/* Glassmorphism overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: isDark 
            ? 'radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.03) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.05) 0%, transparent 70%)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Circular Progress */}
      <div className="relative w-24 h-24 mx-auto mb-3">
        <svg className="transform -rotate-90 w-24 h-24">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r="45"
            stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={`${gradient.split(' ')[0].replace('from-', 'text-')}`} stopColor="currentColor" />
              <stop offset="100%" className={`${gradient.split(' ')[1].replace('to-', 'text-')}`} stopColor="currentColor" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {displayValue}
          </span>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            / {maxValue}
          </span>
        </div>
      </div>

      {/* Label */}
      <h3 className={`text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {label}
      </h3>
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {subtext}
      </p>
    </button>
  );
}