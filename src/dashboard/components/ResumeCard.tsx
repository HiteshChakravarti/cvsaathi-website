import { FileText } from "lucide-react";

interface ResumeCardProps {
  isDark: boolean;
}

export function ResumeCard({ isDark }: ResumeCardProps) {
  return (
    <div className={`group rounded-xl backdrop-blur-xl border p-4 transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-3 ${
      isDark
        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/40'
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-lg'
    }`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${
        isDark
          ? 'bg-gradient-to-br from-gray-500/20 to-gray-600/20'
          : 'bg-gradient-to-br from-gray-200 to-gray-300'
      }`}>
        <FileText className={`size-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Empty Resume Slot</p>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Create your resume</p>
      </div>
    </div>
  );
}