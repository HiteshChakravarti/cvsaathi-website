import { Home, FileText, Bot, Settings, BarChart3, FileCheck, Briefcase, Brain, FolderOpen, Mic, TrendingUp, HelpCircle, CreditCard, Layout } from "lucide-react";

interface SidebarContentProps {
  isDark: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClose?: () => void;
  compact?: boolean;
}

export function SidebarContent({ isDark, activeSection, onSectionChange, onClose, compact = false }: SidebarContentProps) {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'ai-coach', icon: Brain, label: 'AI Coach' },
    { id: 'resume-builder', icon: FolderOpen, label: 'Resume Builder' },
    { id: 'templates', icon: Layout, label: 'Templates' },
    { id: 'ats-checker', icon: FileCheck, label: 'ATS Checker' },
    { id: 'interview-prep', icon: Mic, label: 'Interview Prep' },
    { id: 'skill-gap', icon: TrendingUp, label: 'Skill Gap Analysis' },
  ];

  const bottomItems = [
    { id: 'pricing', icon: CreditCard, label: 'Pricing' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
  ];

  const handleNavigation = (id: string) => {
    if (id === 'settings' || id === 'help') {
      onSectionChange(id);
    } else {
      onSectionChange(id);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`flex flex-col h-full ${compact ? 'p-4' : 'p-6'}`}>
      {/* Navigation */}
      <nav className="flex-1 space-y-2 pt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center ${compact ? 'justify-center' : 'justify-start gap-3'} p-3 rounded-xl transition-all duration-300 ${
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
              {!compact && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
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
              className={`w-full flex items-center ${compact ? 'justify-center' : 'justify-start gap-3'} p-3 rounded-xl transition-all duration-300 ${
                isDark
                  ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
              title={item.label}
            >
              <Icon className="size-6" />
              {!compact && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

