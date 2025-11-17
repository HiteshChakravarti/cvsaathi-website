import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  iconBg: string;
  value: string;
  label: string;
  subtext: string;
  progress?: number;
  isDark: boolean;
}

export function StatCard({ icon, iconBg, value, label, subtext, progress, isDark }: StatCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-xl backdrop-blur-xl border p-6 transition-all duration-300 hover:scale-105 ${
      isDark
        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/40'
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-lg'
    }`}>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-white/10 to-transparent'
          : 'bg-gradient-to-br from-blue-100 to-transparent'
      }`}></div>
      
      <div className="relative">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center mb-4 shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        
        <div className={`text-4xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</div>
        <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>{label}</div>
        <div className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          <span className="text-green-400">↑</span>
          {subtext}
        </div>
        
        {progress !== undefined && (
          <div className="mt-4">
            <div className={`h-2 rounded-full overflow-hidden ${
              isDark ? 'bg-white/10' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-full bg-gradient-to-r ${iconBg} rounded-full transition-all duration-1000`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}