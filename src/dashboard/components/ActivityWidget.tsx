interface ActivityWidgetProps {
  name: string;
  id: string;
  avatar: string;
  isDark: boolean;
  isOnline?: boolean;
}

export function ActivityWidget({ name, id, avatar, isDark, isOnline = false }: ActivityWidgetProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar}`}></div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-teal-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</p>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{id}</p>
      </div>
    </div>
  );
}
