import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  isDark: boolean;
}

export function FeatureCard({ icon, iconBg, title, description, isDark }: FeatureCardProps) {
  return (
    <div className={`group rounded-xl backdrop-blur-xl border p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
      isDark
        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/40'
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-lg'
    }`}>
      <div className="flex gap-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center shrink-0 shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        
        <div>
          <h4 className={`text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
        </div>
      </div>
    </div>
  );
}