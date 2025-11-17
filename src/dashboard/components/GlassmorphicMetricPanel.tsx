import type { MouseEvent } from "react";
import { ReactNode, useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

interface GlassmorphicMetricPanelProps {
  icon: ReactNode;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  isDark: boolean;
  onClick?: () => void;
  sparklineData?: number[];
  color?: 'teal' | 'purple' | 'blue' | 'emerald';
}

const colorMap = {
  teal: {
    gradient: 'from-teal-400 to-cyan-400',
    glow: 'rgba(20, 184, 166, 0.5)',
    light: 'rgba(20, 184, 166, 0.1)',
    solid: '#14b8a6'
  },
  purple: {
    gradient: 'from-purple-400 to-pink-400',
    glow: 'rgba(168, 85, 247, 0.5)',
    light: 'rgba(168, 85, 247, 0.1)',
    solid: '#a855f7'
  },
  blue: {
    gradient: 'from-blue-400 to-indigo-400',
    glow: 'rgba(59, 130, 246, 0.5)',
    light: 'rgba(59, 130, 246, 0.1)',
    solid: '#3b82f6'
  },
  emerald: {
    gradient: 'from-emerald-400 to-teal-400',
    glow: 'rgba(16, 185, 129, 0.5)',
    light: 'rgba(16, 185, 129, 0.1)',
    solid: '#10b981'
  }
};

export function GlassmorphicMetricPanel({ 
  icon, 
  label, 
  value, 
  change, 
  trend, 
  isDark, 
  onClick, 
  sparklineData,
  color = 'teal'
}: GlassmorphicMetricPanelProps) {
  const colors = colorMap[color];
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Extract numeric value for counter animation
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const suffix = value.replace(/[0-9.]/g, '').trim();

  // Counter Roll-up Animation
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2000;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(numericValue * eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [numericValue]);

  // Track mouse position for gradient effect
  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={`group relative w-full text-left rounded-3xl border overflow-hidden transition-all duration-500 ${
        isDark
          ? 'border-white/10 hover:border-white/20'
          : 'border-white/40 hover:border-white/60'
      }`}
      style={{
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered 
          ? isDark
            ? `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px ${colors.glow}`
            : `0 20px 60px rgba(0, 0, 0, 0.15), 0 0 40px ${colors.glow}`
          : isDark
            ? '0 10px 30px rgba(0, 0, 0, 0.3)'
            : '0 10px 30px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Glassmorphism Background */}
      <div 
        className={`absolute inset-0 ${
          isDark 
            ? 'bg-white/5 backdrop-blur-xl' 
            : 'bg-white/60 backdrop-blur-xl'
        }`}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
        }}
      />

      {/* Animated Gradient Border Glow */}
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-3xl opacity-50 blur-xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${colors.glow}, transparent 70%)`,
          }}
        />
      )}

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)'
            : 'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.1) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          {/* Icon with Gradient Background */}
          <div className="relative">
            <div 
              className={`p-3 rounded-2xl bg-gradient-to-br ${colors.gradient} transition-all duration-500`}
              style={{
                transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
                boxShadow: isHovered ? `0 8px 20px ${colors.glow}` : 'none',
              }}
            >
              <div className="text-white">
                {icon}
              </div>
            </div>
            
            {/* Floating particles on hover */}
            {isHovered && (
              <>
                <div 
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-br ${colors.gradient} animate-ping`}
                />
                <div 
                  className={`absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${colors.gradient} animate-ping`}
                  style={{ animationDelay: '0.3s' }}
                />
              </>
            )}
          </div>

          {/* Trend Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
            trend === 'up'
              ? isDark 
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-emerald-500/20 text-emerald-600'
              : isDark
                ? 'bg-red-500/20 text-red-400'
                : 'bg-red-500/20 text-red-600'
          }`}
          style={{
            backdropFilter: 'blur(10px)',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}>
            <div
              style={{
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'transform 0.3s ease',
              }}
            >
              {trend === 'up' ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
            </div>
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>

        {/* Label */}
        <div>
          <h3 className={`text-sm font-medium mb-1 transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {label}
          </h3>
          
          {/* Value with Counter Animation */}
          <div className={`text-4xl font-medium transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
          style={{
            background: isHovered 
              ? `linear-gradient(135deg, ${colors.solid}, ${colors.solid}dd)`
              : isDark ? 'white' : '#111827',
            WebkitBackgroundClip: isHovered ? 'text' : 'unset',
            WebkitTextFillColor: isHovered ? 'transparent' : 'unset',
            backgroundClip: isHovered ? 'text' : 'unset',
          }}>
            {animatedValue.toFixed(suffix.includes('%') || suffix.includes('days') ? 1 : 0)}{suffix}
          </div>
        </div>

        {/* Sparkline Chart */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="relative h-20 -mb-2">
            <svg 
              viewBox="0 0 200 60" 
              className="w-full h-full" 
              preserveAspectRatio="none"
              style={{
                filter: isHovered ? `drop-shadow(0 2px 8px ${colors.glow})` : 'none',
                transition: 'filter 0.3s ease',
              }}
            >
              <defs>
                <linearGradient id={`glass-gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors.solid} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={colors.solid} stopOpacity="0" />
                </linearGradient>
                
                <filter id={`glow-${label}`}>
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Area Fill */}
              <path
                d={(() => {
                  const max = Math.max(...sparklineData);
                  const min = Math.min(...sparklineData);
                  const range = max - min || 1;
                  const points = sparklineData.map((val, i) => {
                    const x = (i / (sparklineData.length - 1)) * 200;
                    const y = 60 - ((val - min) / range) * 50 - 5;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');
                  return `${points} L 200 60 L 0 60 Z`;
                })()}
                fill={`url(#glass-gradient-${label})`}
                className="transition-opacity duration-500"
                style={{ opacity: isHovered ? 1 : 0.6 }}
              />
              
              {/* Line */}
              <path
                d={(() => {
                  const max = Math.max(...sparklineData);
                  const min = Math.min(...sparklineData);
                  const range = max - min || 1;
                  return sparklineData.map((val, i) => {
                    const x = (i / (sparklineData.length - 1)) * 200;
                    const y = 60 - ((val - min) / range) * 50 - 5;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');
                })()}
                fill="none"
                stroke={colors.solid}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={isHovered ? `url(#glow-${label})` : 'none'}
                className="transition-all duration-500"
                style={{
                  strokeDasharray: isHovered ? 'none' : '400',
                  strokeDashoffset: isHovered ? '0' : '400',
                  animation: 'drawLine 2s ease-out forwards',
                }}
              />
              
              {/* Data Points */}
              {isHovered && sparklineData.map((val, i) => {
                const max = Math.max(...sparklineData);
                const min = Math.min(...sparklineData);
                const range = max - min || 1;
                const x = (i / (sparklineData.length - 1)) * 200;
                const y = 60 - ((val - min) / range) * 50 - 5;
                
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="white"
                    stroke={colors.solid}
                    strokeWidth="2"
                    className="animate-in fade-in zoom-in duration-300"
                    style={{
                      animationDelay: `${i * 50}ms`,
                      filter: `drop-shadow(0 2px 4px ${colors.glow})`,
                    }}
                  />
                );
              })}
            </svg>
          </div>
        )}

        {/* Hover Arrow Indicator */}
        <div 
          className={`flex items-center gap-2 text-sm transition-all duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
          }}
        >
          <span>View Details</span>
          <ArrowRight className="size-4" />
        </div>
      </div>

      {/* Shimmer Effect on Hover */}
      {isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(110deg, transparent 40%, ${colors.light} 50%, transparent 60%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
          }}
        />
      )}
    </button>
  );
}
