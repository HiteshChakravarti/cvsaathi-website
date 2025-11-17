import { Home, FileText, Bot, TrendingUp, Settings, Users, Briefcase, BarChart3, FileCheck, Sparkles } from "lucide-react";

interface SidebarProps {
  isDark: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ isDark, activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'resume', icon: FileText, label: 'Resume Builder' },
    { id: 'ai-coach', icon: Bot, label: 'AI Coach' },
    { id: 'ats', icon: FileCheck, label: 'ATS Checker' },
    { id: 'interview', icon: Briefcase, label: 'Interview Prep' },
    { id: 'skills', icon: BarChart3, label: 'Skill Gap' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 border-r transition-all duration-500 z-50 ${
      isDark
        ? 'bg-black border-white/5'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex flex-col h-full p-6">
        {/* Logo Section */}
        <div className="mb-12 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-lg"></div>
            <div>
              <h2 className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>CVSaathi</h2>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? isDark
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                    : isDark
                      ? 'text-gray-500 hover:bg-white/5 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="size-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="pt-6 border-t space-y-1 ${isDark ? 'border-white/5' : 'border-gray-200'}">
          <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            isDark
              ? 'text-gray-500 hover:bg-white/5 hover:text-white'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}>
            <Settings className="size-5" />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}