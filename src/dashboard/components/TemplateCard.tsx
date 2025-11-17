import { Star } from "lucide-react";
import { Button } from "../../components/ui/button";

interface TemplateCardProps {
  title: string;
  rating: number;
  isDark: boolean;
}

export function TemplateCard({ title, rating, isDark }: TemplateCardProps) {
  return (
    <div className={`group rounded-xl backdrop-blur-xl border p-6 transition-all duration-300 hover:scale-105 ${
      isDark
        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/40'
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-lg'
    }`}>
      <div className={`aspect-[4/3] rounded-lg mb-4 flex items-center justify-center overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-white/5 to-white/10'
          : 'bg-gradient-to-br from-gray-100 to-gray-200'
      }`}>
        <div className={`w-full h-full flex items-center justify-center ${
          isDark
            ? 'bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm'
            : 'bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50'
        }`}>
          <div className={`text-center text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Template Preview</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <h4 className={isDark ? 'text-white' : 'text-gray-900'}>{title}</h4>
        <div className="flex items-center gap-1">
          <Star className="size-4 text-yellow-400 fill-yellow-400" />
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{rating}</span>
        </div>
      </div>
      
      <Button className={`w-full border ${
        isDark
          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 border-purple-500/30'
          : 'bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 border-purple-300'
      }`}>
        Use Template
      </Button>
    </div>
  );
}