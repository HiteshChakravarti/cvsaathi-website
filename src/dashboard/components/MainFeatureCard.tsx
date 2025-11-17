import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface MainFeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
  glowColor: string;
  isDark: boolean;
  onClick: () => void;
}

export function MainFeatureCard({ 
  icon, 
  title, 
  description, 
  gradient, 
  glowColor,
  isDark, 
  onClick 
}: MainFeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border p-8 transition-all duration-500 hover:scale-[1.02] w-full text-left ${
        isDark
          ? 'bg-gradient-to-br from-white/5 to-white/10 border-white/20 hover:border-white/40'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-xl hover:shadow-2xl'
      }`}
    >
      {/* Animated background gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      ></div>
      
      {/* Glow effect */}
      <div 
        className={`absolute -top-24 -right-24 w-48 h-48 ${glowColor} rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-500 group-hover:scale-150`}
      ></div>
      
      <div className="relative flex items-start gap-6">
        {/* Icon */}
        <div className={`shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="text-sm">Explore</span>
              <ArrowRight className="size-5" />
            </div>
          </div>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
    </button>
  );
}
