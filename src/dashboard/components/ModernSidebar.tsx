import { Home, FileText, Bot, MessageSquare, Users, Calendar, Settings, BookOpen, BarChart3, FileCheck, Briefcase, Brain, FolderOpen, Mic, TrendingUp, HelpCircle, CreditCard, Layout, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ModernSidebarProps {
  isDark: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function ModernSidebar({ isDark, activeSection, onSectionChange }: ModernSidebarProps) {
  const { t } = useTranslation();
  
  const menuItems = [
    { id: 'dashboard', icon: Home, label: t('dashboard.sidebar.menu.dashboard') },
    { id: 'ai-coach', icon: Brain, label: t('dashboard.sidebar.menu.aiCoach') },
    { id: 'resume-builder', icon: FolderOpen, label: t('dashboard.sidebar.menu.resumeBuilder') },
    { id: 'templates', icon: Layout, label: t('dashboard.sidebar.menu.templates') },
    { id: 'ats-checker', icon: FileCheck, label: t('dashboard.sidebar.menu.atsChecker') },
    { id: 'interview-prep', icon: Mic, label: t('dashboard.sidebar.menu.interviewPrep') },
    { id: 'skill-gap', icon: TrendingUp, label: t('dashboard.sidebar.menu.skillGap') },
  ];

  const bottomItems = [
    { id: 'pricing', icon: CreditCard, label: t('dashboard.sidebar.bottom.pricing') },
    { id: 'feedback', icon: MessageCircle, label: t('dashboard.sidebar.bottom.feedback') },
    { id: 'settings', icon: Settings, label: t('dashboard.sidebar.bottom.settings') },
    // Help icon hidden as requested
    // { id: 'help', icon: HelpCircle, label: t('dashboard.sidebar.bottom.help') },
  ];

  const handleNavigation = (id: string) => {
    // For settings, show coming soon for now
    if (id === 'settings') {
      // Just change section, App.tsx will show dashboard with toast
      onSectionChange(id);
    } else {
      onSectionChange(id);
    }
  };

  return (
    <aside className={`fixed left-0 top-0 w-20 h-screen border-r transition-all duration-500 z-50 ${
      isDark
        ? 'bg-slate-900 border-white/10'
        : 'bg-gradient-to-b from-teal-600 to-teal-700 border-teal-800'
    }`}>
      <div className="flex flex-col h-full p-4">
        {/* Navigation */}
        <nav className="flex-1 space-y-2 pt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? isDark
                      ? 'bg-teal-500/20 text-teal-400'
                      : 'bg-white/20 text-white'
                    : isDark
                      ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                      : 'text-teal-100 hover:bg-white/10 hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className="size-6" />
              </button>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                    : 'text-teal-100 hover:bg-white/10 hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className="size-6" />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}