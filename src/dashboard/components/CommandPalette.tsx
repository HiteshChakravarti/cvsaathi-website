import { useEffect, useState } from "react";
import { Search, Bot, FileText, FileCheck, Briefcase, BarChart3, Settings, Home, Calendar, Users, TrendingUp, Award } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onNavigate: (section: string) => void;
}

const commands = [
  { id: 'dashboard', icon: Home, label: 'Go to Dashboard', category: 'Navigation' },
  { id: 'ai-coach', icon: Bot, label: 'Open AI Career Coach', category: 'Features' },
  { id: 'resume-builder', icon: FileText, label: 'Create New Resume', category: 'Features' },
  { id: 'ats-checker', icon: FileCheck, label: 'Check ATS Score', category: 'Features' },
  { id: 'interview-prep', icon: Briefcase, label: 'Start Interview Prep', category: 'Features' },
  { id: 'skill-gap', icon: BarChart3, label: 'Analyze Skill Gap', category: 'Features' },
  { id: 'analytics', icon: TrendingUp, label: 'View Analytics', category: 'Navigation' },
  { id: 'settings', icon: Settings, label: 'Open Settings', category: 'Navigation' },
];

export function CommandPalette({ isOpen, onClose, isDark, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredCommands[selectedIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = (id: string) => {
    onNavigate(id);
    onClose();
    setSearch("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className={`relative w-full max-w-2xl mx-4 rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
        isDark
          ? 'bg-slate-900 border-white/10'
          : 'bg-white border-gray-200'
      }`}>
        {/* Search Input */}
        <div className={`flex items-center gap-3 p-4 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <Search className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className={`flex-1 bg-transparent outline-none text-lg ${
              isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          <kbd className={`px-2 py-1 text-xs rounded border ${
            isDark 
              ? 'bg-white/5 border-white/10 text-gray-400'
              : 'bg-gray-100 border-gray-300 text-gray-600'
          }`}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No results found
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    isSelected
                      ? isDark
                        ? 'bg-teal-500/20 text-teal-400'
                        : 'bg-teal-50 text-teal-700'
                      : isDark
                        ? 'text-gray-300 hover:bg-white/5'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="size-5" />
                  <div className="flex-1 text-left">
                    <div className="text-sm">{cmd.label}</div>
                    <div className={`text-xs ${
                      isSelected
                        ? isDark ? 'text-teal-300' : 'text-teal-600'
                        : isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {cmd.category}
                    </div>
                  </div>
                  {isSelected && (
                    <kbd className={`px-2 py-1 text-xs rounded border ${
                      isDark 
                        ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                        : 'bg-teal-100 border-teal-200 text-teal-700'
                    }`}>
                      ↵
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-4 py-3 border-t text-xs ${
          isDark 
            ? 'border-white/10 text-gray-500'
            : 'border-gray-200 text-gray-500'
        }`}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className={`px-1.5 py-0.5 rounded border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-300'
              }`}>↑</kbd>
              <kbd className={`px-1.5 py-0.5 rounded border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-300'
              }`}>↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className={`px-1.5 py-0.5 rounded border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-300'
              }`}>↵</kbd>
              to select
            </span>
          </div>
          <span className="text-teal-500">⌘K</span>
        </div>
      </div>
    </div>
  );
}
