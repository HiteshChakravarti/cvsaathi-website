import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface MinimalFeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  isDark: boolean;
  onClick: () => void;
}

export function MinimalFeatureCard({ 
  icon, 
  title, 
  description, 
  isDark, 
  onClick 
}: MinimalFeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left p-8 rounded-2xl border transition-all duration-300 ${
        isDark
          ? 'bg-white/[0.02] hover:bg-teal-500/5 border-white/5 hover:border-teal-500/20'
          : 'bg-gray-50 hover:bg-teal-50 border-gray-200 hover:border-teal-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-xl transition-all duration-300 ${
            isDark
              ? 'bg-teal-500/10 group-hover:bg-teal-500/15'
              : 'bg-white group-hover:bg-teal-50'
          }`}>
            <div className={isDark ? 'text-teal-400' : 'text-teal-600'}>
              {icon}
            </div>
          </div>
          
          <div>
            <h3 className={`text-xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {description}
            </p>
          </div>
        </div>
        
        <ArrowRight className={`size-5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 ${
          isDark ? 'text-teal-400' : 'text-teal-600'
        }`} />
      </div>
    </button>
  );
}