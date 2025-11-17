interface SparklineProps {
  data: number[];
  color: string;
  isDark: boolean;
}

export function Sparkline({ data, color, isDark }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M ${points}`;

  return (
    <svg 
      viewBox="0 0 100 30" 
      className="w-full h-8"
      preserveAspectRatio="none"
    >
      {/* Area fill */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className={`${color}`} stopOpacity="0.3" />
          <stop offset="100%" className={`${color}`} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <path
        d={`${pathData} L 100,100 L 0,100 Z`}
        fill={`url(#gradient-${color})`}
        className="animate-in fade-in duration-1000"
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${color} animate-in slide-in-from-left duration-1000`}
      />
    </svg>
  );
}
