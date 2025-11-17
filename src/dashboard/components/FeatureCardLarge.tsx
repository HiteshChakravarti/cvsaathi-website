import type { MouseEvent } from "react";
import { ReactNode } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface FeatureCardLargeProps {
  icon: ReactNode;
  title: string;
  description: string;
  author: string;
  color: 'teal' | 'purple' | 'pink' | 'blue' | 'emerald';
  isDark: boolean;
  onClick: () => void;
  mascotImage?: string;
}

const colorMap = {
  teal: {
    light: 'from-teal-100 to-cyan-100',
    dark: 'from-teal-500/10 to-cyan-500/10',
    bg: 'bg-gradient-to-br from-teal-400 to-cyan-500',
    icon: 'text-white',
    hover: 'hover:from-teal-500 hover:to-cyan-600'
  },
  purple: {
    light: 'from-purple-100 to-pink-100',
    dark: 'from-purple-500/10 to-pink-500/10',
    bg: 'bg-gradient-to-br from-purple-400 to-pink-500',
    icon: 'text-white',
    hover: 'hover:from-purple-500 hover:to-pink-600'
  },
  pink: {
    light: 'from-pink-100 to-rose-100',
    dark: 'from-pink-500/10 to-rose-500/10',
    bg: 'bg-gradient-to-br from-pink-400 to-rose-500',
    icon: 'text-white',
    hover: 'hover:from-pink-500 hover:to-rose-600'
  },
  blue: {
    light: 'from-blue-100 to-indigo-100',
    dark: 'from-blue-500/10 to-indigo-500/10',
    bg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    icon: 'text-white',
    hover: 'hover:from-blue-500 hover:to-indigo-600'
  },
  emerald: {
    light: 'from-emerald-100 to-teal-100',
    dark: 'from-emerald-500/10 to-teal-500/10',
    bg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    icon: 'text-white',
    hover: 'hover:from-emerald-500 hover:to-teal-600'
  }
};

export function FeatureCardLarge({ 
  icon, 
  title, 
  description, 
  author,
  color,
  isDark, 
  onClick,
  mascotImage
}: FeatureCardLargeProps) {
  const colors = colorMap[color];
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -3;
    const tiltY = ((x - centerX) / centerX) * 3;
    
    setTilt({ x: tiltX, y: tiltY });
  };
  
  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };
  
  return (
    <button
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      className={`group w-full text-left rounded-2xl border transition-all duration-300 hover:shadow-xl relative ${
        isDark
          ? 'bg-white/5 border-white/10 hover:border-white/20'
          : 'bg-white border-gray-200 hover:border-teal-200'
      }`}
    >
      {/* Visual Illustration Area */}
      <div className={`relative h-64 ${colors.bg} ${colors.hover} transition-all duration-300 flex items-center justify-center overflow-visible`}>
        {/* Estel Mascot Image - Popping out effect */}
        {mascotImage ? (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-full h-80 flex items-end justify-center">
            <img 
              src={mascotImage} 
              alt={`Estel helping with ${title}`}
              className="h-full w-auto object-contain transform group-hover:scale-110 transition-all duration-300 drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
              }}
            />
          </div>
        ) : (
          <>
            {/* Fallback: Decorative elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-16 h-16 bg-white/20 rounded-lg"></div>
              <div className="absolute top-8 right-8 w-24 h-2 bg-white/20 rounded"></div>
              <div className="absolute top-14 right-8 w-16 h-2 bg-white/20 rounded"></div>
              <div className="absolute bottom-8 left-8 w-20 h-2 bg-white/20 rounded"></div>
              <div className="absolute bottom-12 left-8 w-32 h-2 bg-white/20 rounded"></div>
            </div>
            
            {/* Icon */}
            <div className={`relative z-10 ${colors.icon} transform group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
          </>
        )}

        {/* Arrow overlay on hover */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ArrowRight className="size-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <div className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          cvsaathi.com/{title.toLowerCase().replace(/\s+/g, '-')}
        </div>
        <h3 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
          {description}
        </p>
      </div>
    </button>
  );
}