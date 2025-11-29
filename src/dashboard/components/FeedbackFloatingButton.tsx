import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { QuickFeedbackModal } from "./QuickFeedbackModal";
import { useLocation } from "react-router-dom";

interface FeedbackFloatingButtonProps {
  isDark: boolean;
}

export function FeedbackFloatingButton({ isDark }: FeedbackFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const getScreenContext = () => {
    const path = location.pathname;
    if (path.includes('/resume-builder')) return 'resume-builder';
    if (path.includes('/ats-checker')) return 'ats-checker';
    if (path.includes('/interview-prep')) return 'interview-prep';
    if (path.includes('/skill-gap')) return 'skill-gap';
    if (path.includes('/job-tracker')) return 'job-tracker';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isDark
            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
            : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
        }`}
        title="Give Feedback"
      >
        <MessageSquare className="size-6" />
      </button>

      <QuickFeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        context={{ screen: getScreenContext() }}
      />
    </>
  );
}

