import { Home, Bot, FolderOpen, Layout, FileCheck, Mic, TrendingUp, CreditCard, Settings, HelpCircle } from "lucide-react";

interface SidebarContentProps {
  isDark: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClose?: () => void;
  compact?: boolean;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "ai-coach", label: "AI Coach", icon: Bot },
  { id: "resume-builder", label: "Resume Builder", icon: FolderOpen },
  { id: "templates", label: "Templates", icon: Layout },
  { id: "ats-checker", label: "ATS Checker", icon: FileCheck },
  { id: "interview-prep", label: "Interview Prep", icon: Mic },
  { id: "skill-gap", label: "Skill Gap", icon: TrendingUp },
];

const footerItems = [
  { id: "pricing", label: "Pricing", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
];

export function SidebarContent({ isDark, activeSection, onSectionChange, onClose, compact = false }: SidebarContentProps) {
  const handleClick = (section: string) => {
    onSectionChange(section);
    if (onClose) {
      onClose();
    }
  };

  const baseButtonClasses =
    "w-full flex items-center rounded-xl transition-all duration-300 px-3 py-3 text-sm font-medium";

  const layoutClasses = compact ? "flex-col items-center gap-2 p-3" : "flex-col gap-2 p-4";
  const labelClasses = compact ? "sr-only" : "ml-3";

  const getStateClasses = (id: string) => {
    const isActive = activeSection === id;
    if (isActive) {
      return isDark
        ? "bg-teal-500/20 text-teal-200 border border-white/10"
        : "bg-teal-50 text-teal-600 border border-teal-100";
    }
    return isDark
      ? "text-gray-400 hover:bg-white/5 border border-transparent"
      : "text-gray-600 hover:bg-gray-50 border border-transparent";
  };

  return (
    <div className={`flex h-full ${layoutClasses}`}>
      <nav className="flex-1 w-full space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`${baseButtonClasses} ${getStateClasses(item.id)} ${compact ? "justify-center" : "justify-start"}`}
            >
              <Icon className="size-5 shrink-0" />
              <span className={labelClasses}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-2 w-full space-y-1 border-t border-white/10 dark:border-white/5">
        {footerItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`${baseButtonClasses} ${isDark ? "text-gray-400 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50"} ${
                compact ? "justify-center" : "justify-start"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              <span className={labelClasses}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


