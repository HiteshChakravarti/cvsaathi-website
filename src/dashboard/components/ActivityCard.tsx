import { Clock } from "lucide-react";
import { ReactNode } from "react";

interface ActivityCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  time: string;
  isDark: boolean;
}

export function ActivityCard({ icon, iconBg, title, description, time, isDark }: ActivityCardProps) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
      isDark
        ? 'bg-white/5 hover:bg-white/10'
        : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center shrink-0`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
        <Clock className="size-3" />
        {time}
      </div>
    </div>
  );
}
