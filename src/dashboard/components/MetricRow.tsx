import { ReactNode, useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

interface MetricRowProps {
  icon: ReactNode;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  isDark: boolean;
  onClick?: () => void;
  sparklineData?: number[];
  percentage?: number; // For the progress bar
}

export function MetricRow({ 
  icon, 
  label, 
  value, 
  change, 
  trend, 
  isDark, 
  onClick, 
  sparklineData,
  percentage = 0
}: MetricRowProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Extract numeric value for counter animation
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const suffix = value.replace(/[0-9.]/g, '').trim();

  // Counter Roll-up Animation
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1500;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(numericValue * eased);
      setAnimatedPercentage(percentage * eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [numericValue, percentage]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full text-left rounded-xl border p-5 transition-all duration-300 hover:scale-[1.02] group ${
        isDark
          ? 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
          : 'bg-white border-gray-200 hover:border-teal-300 hover:shadow-lg'
      }`}
      style={{
        boxShadow: isHovered 
          ? isDark
            ? '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(20, 184, 166, 0.1)'
            : '0 10px 30px rgba(0, 0, 0, 0.08), 0 0 15px rgba(20, 184, 166, 0.1)'
          : 'none',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
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

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Label and trend badge */}
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {label}
            </h3>
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
          </div>

          {/* Value and progress bar */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {animatedValue.toFixed(suffix.includes('%') ? 0 : 1)}{suffix}
              </span>
              
              {/* Mini Sparkline */}
              {sparklineData && sparklineData.length > 0 && (
                <div className="h-8 w-24">
                  <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`mini-gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
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
                    
                    {/* Area */}
                    <path
                      d={(() => {
                        const max = Math.max(...sparklineData);
                        const min = Math.min(...sparklineData);
                        const range = max - min || 1;
                        const points = sparklineData.map((val, i) => {
                          const x = (i / (sparklineData.length - 1)) * 100;
                          const y = 40 - ((val - min) / range) * 40;
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ');
                        return `${points} L 100 40 L 0 40 Z`;
                      })()}
                      fill={`url(#mini-gradient-${label})`}
                    />
                    
                    {/* Line */}
                    <path
                      d={(() => {
                        const max = Math.max(...sparklineData);
                        const min = Math.min(...sparklineData);
                        const range = max - min || 1;
                        return sparklineData.map((val, i) => {
                          const x = (i / (sparklineData.length - 1)) * 100;
                          const y = 40 - ((val - min) / range) * 40;
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ');
                      })()}
                      fill="none"
                      stroke={trend === 'up' ? '#10b981' : '#ef4444'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-opacity duration-300"
                      style={{ opacity: isHovered ? 1 : 0.7 }}
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-transparent via-transparent to-transparent"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              <div 
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                  trend === 'up'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{
                  width: `${Math.min(animatedPercentage, 100)}%`,
                }}
              />
              
              {/* Shimmer effect on hover */}
              {isHovered && (
                <div 
                  className="absolute inset-0 animate-shimmer"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    backgroundSize: '200% 100%',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
