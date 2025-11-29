interface ActivityWidgetProps {
  name: string;
  formattedTime: string;
  avatar: string;
  isDark: boolean;
  isOnline?: boolean;
  onClick?: () => void;
}

export function ActivityWidget({ name, formattedTime, avatar, isDark, isOnline = false, onClick }: ActivityWidgetProps) {
  return (
    <div 
      className={`flex items-center gap-3 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <div className="relative">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar}`}></div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-teal-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</p>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{formattedTime}</p>
      </div>
    </div>
  );
}
