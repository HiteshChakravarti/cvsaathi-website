import type { MouseEvent } from "react";
import { ReactNode, useState, useRef, useEffect } from "react";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  isDark: boolean;
  onClick?: () => void;
  sparklineData?: number[];
}

export function MetricCard({ icon, label, value, change, trend, isDark, onClick, sparklineData }: MetricCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  // Extract numeric value for counter animation
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const suffix = value.replace(/[0-9.]/g, '').trim();

  // Counter Roll-up Animation
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1500; // 1.5 seconds
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function (ease-out-cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(numericValue * eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [numericValue]);

  // 3D Tilt Effect
  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = ((y - centerY) / centerY) * -8; // Max 8 degrees
    const tiltY = ((x - centerX) / centerX) * 8;
    
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
    setHoveredPoint(null);
    setShowTooltip(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Sparkline with tooltips
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length === 0) return null;

    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min;
    
    const points = sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return { x, y, value };
    });

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    const areaData = `${pathData} L 100 100 L 0 100 Z`;

    return (
      <div className="relative h-12 mt-4 -mb-2">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Area fill with gradient */}
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop 
                offset="0%" 
                stopColor={trend === 'up' ? '#10b981' : '#ef4444'} 
                stopOpacity="0.3" 
              />
              <stop 
                offset="100%" 
                stopColor={trend === 'up' ? '#10b981' : '#ef4444'} 
                stopOpacity="0" 
              />
            </linearGradient>
          </defs>
          
          {/* Animated area */}
          <path
            d={areaData}
            fill={`url(#gradient-${label})`}
            className="transition-all duration-300"
            style={{
              opacity: isHovered ? 0.5 : 0.3,
            }}
          />
          
          {/* Animated line */}
          <path
            d={pathData}
            fill="none"
            stroke={trend === 'up' ? '#10b981' : '#ef4444'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
            style={{
              strokeDasharray: isHovered ? 'none' : '200',
              strokeDashoffset: isHovered ? 0 : 200,
              animation: 'drawLine 1.5s ease-out forwards',
            }}
          />
          
          {/* Data points */}
          {isHovered && points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === index ? 4 : 2}
              fill={trend === 'up' ? '#10b981' : '#ef4444'}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{
                filter: hoveredPoint === index ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.8))' : 'none',
              }}
            />
          ))}
          
          {/* Latest point pulse */}
          {isHovered && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="4"
              fill={trend === 'up' ? '#10b981' : '#ef4444'}
              opacity="0.5"
              className="animate-ping"
            />
          )}
        </svg>
        
        {/* Tooltip for hovered point */}
        {hoveredPoint !== null && (
          <div 
            className={`absolute bottom-full mb-2 px-2 py-1 rounded text-xs whitespace-nowrap transition-all duration-200 ${
              isDark 
                ? 'bg-slate-800 text-white border border-white/10' 
                : 'bg-white text-gray-900 border border-gray-200 shadow-lg'
            }`}
            style={{
              left: `${points[hoveredPoint].x}%`,
              transform: 'translateX(-50%)',
            }}
          >
            Day {hoveredPoint + 1}: {sparklineData[hoveredPoint].toFixed(1)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`w-full text-left rounded-xl border p-6 transition-all duration-300 relative overflow-hidden ${
          isDark
            ? 'bg-white/5 border-white/10 hover:border-white/20'
            : 'bg-white border-gray-200 hover:border-teal-300'
        }`}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.05 : 1})`,
          transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
          boxShadow: isHovered 
            ? isDark
              ? '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(20, 184, 166, 0.2)'
              : '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 20px rgba(20, 184, 166, 0.15)'
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
              ? 'radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.05) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.08) 0%, transparent 70%)',
            backdropFilter: 'blur(8px)',
          }}
        />
        
        {/* Animated gradient border effect */}
        <div 
          className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: `linear-gradient(135deg, ${
              trend === 'up' 
                ? 'rgba(16, 185, 129, 0.2), rgba(20, 184, 166, 0.2)' 
                : 'rgba(239, 68, 68, 0.2), rgba(251, 146, 60, 0.2)'
            })`,
            maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div 
              className={`p-3 rounded-lg transition-all duration-300 ${
                isDark ? 'bg-teal-500/10' : 'bg-teal-50'
              }`}
              style={{
                transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
              }}
            >
              <div className={`transition-colors duration-300 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                {icon}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                trend === 'up'
                  ? isDark 
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-emerald-50 text-emerald-600'
                  : isDark
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-red-50 text-red-600'
              }`}>
                <div
                  style={{
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  {trend === 'up' ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                </div>
                {change}
              </div>
              
              {/* Info icon for tooltip */}
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`p-1 rounded-full transition-all duration-300 ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(!showTooltip);
                }}
              >
                <Info className={`size-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
          
          {/* Animated counter */}
          <div className={`text-3xl mb-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {animatedValue.toFixed(suffix.includes('%') ? 0 : 1)}{suffix}
          </div>
          
          <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </div>
          
          {/* Sparkline */}
          {renderSparkline()}
        </div>
      </button>

      {/* Rich Tooltip */}
      {showTooltip && (
        <div 
          className={`absolute z-50 top-0 left-full ml-2 w-64 rounded-xl border p-4 shadow-2xl transition-all duration-300 ${
            isDark 
              ? 'bg-slate-800 border-white/10 text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}
          style={{
            animation: 'slideInRight 0.2s ease-out',
          }}
        >
          <h4 className="font-semibold mb-3">{label} Breakdown</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Current</span>
              <span className="font-medium">{value}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Change</span>
              <span className={`font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                {change}
              </span>
            </div>
            {sparklineData && (
              <>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>7-Day High</span>
                  <span className="font-medium">{Math.max(...sparklineData).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>7-Day Low</span>
                  <span className="font-medium">{Math.min(...sparklineData).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Average</span>
                  <span className="font-medium">
                    {(sparklineData.reduce((a, b) => a + b, 0) / sparklineData.length).toFixed(1)}
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className={`mt-3 pt-3 border-t text-xs ${
            isDark ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-500'
          }`}>
            Click card for detailed analysis
          </div>
        </div>
      )}
    </div>
  );
}
