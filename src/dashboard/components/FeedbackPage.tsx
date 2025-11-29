import { useState } from "react";
import { ChevronLeft, MessageSquare, Bug, Lightbulb, HelpCircle, Star, Send, Trash2, CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useFeedback, FeedbackType, FeedbackStatus } from "../../hooks/useFeedback";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

interface FeedbackPageProps {
  isDark: boolean;
  onBack: () => void;
}

const feedbackTypes: { id: FeedbackType; label: string; icon: any; description: string }[] = [
  { id: 'general', label: 'General', icon: MessageSquare, description: 'General feedback or comments' },
  { id: 'bug', label: 'Bug Report', icon: Bug, description: 'Report a bug or issue' },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, description: 'Suggest a new feature' },
  { id: 'support', label: 'Support', icon: HelpCircle, description: 'Need help or support' },
];

const getStatusIcon = (status: FeedbackStatus) => {
  switch (status) {
    case 'resolved':
      return CheckCircle;
    case 'in_progress':
      return Clock;
    case 'closed':
      return XCircle;
    default:
      return AlertCircle;
  }
};

const getStatusColor = (status: FeedbackStatus, isDark: boolean) => {
  switch (status) {
    case 'resolved':
      return isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
    case 'in_progress':
      return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
    case 'closed':
      return isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
    default:
      return isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
  }
};

export function FeedbackPage({ isDark, onBack }: FeedbackPageProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { feedback, loading, saving, createFeedback, deleteFeedback } = useFeedback();
  
  const [selectedType, setSelectedType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Auto-detect screen context from current route
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error(t('dashboard.feedback.messageRequired'));
      return;
    }

    try {
      await createFeedback({
        message,
        type: selectedType,
        rating,
        screen_context: getScreenContext(),
      });

      // Reset form
      setMessage('');
      setRating(null);
      setSelectedType('general');
      toast.success(t('dashboard.feedback.submitSuccess'));
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm(t('dashboard.feedback.confirmDelete'))) return;

    try {
      await deleteFeedback(feedbackId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-gray-50 via-teal-50/30 to-gray-50'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-500 ${
        isDark 
          ? 'border-white/10 bg-slate-900/80 backdrop-blur-xl'
          : 'border-gray-200 bg-white/80 backdrop-blur-xl'
      }`}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              <div>
                <h1 className={`text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('dashboard.feedback.title')}
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('dashboard.feedback.description')}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              className={isDark ? 'border-white/10' : 'border-gray-200'}
            >
              {showHistory ? t('dashboard.feedback.newFeedback') : t('dashboard.feedback.viewHistory')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-8 py-8">
        {showHistory ? (
          /* Feedback History */
          <div className={`rounded-2xl border ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <h2 className={`text-xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.feedback.history')}
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-teal-500" />
                  <span className={`ml-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('dashboard.feedback.loading')}
                  </span>
                </div>
              ) : feedback.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className={`size-12 mx-auto mb-4 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {t('dashboard.feedback.noFeedbackYet')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((item) => {
                    const StatusIcon = getStatusIcon(item.status);
                    const TypeConfig = feedbackTypes.find(t => t.id === item.type);
                    const TypeIcon = TypeConfig?.icon || MessageSquare;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          isDark
                            ? 'bg-white/5 border-white/10 hover:bg-white/10'
                            : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              item.type === 'bug' ? 'bg-red-500/20 text-red-400' :
                              item.type === 'feature' ? 'bg-blue-500/20 text-blue-400' :
                              item.type === 'support' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              <TypeIcon className="size-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {TypeConfig?.label}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(item.status, isDark)}`}>
                                  <StatusIcon className="size-3 inline mr-1" />
                                  {t(`dashboard.feedback.status.${item.status}`)}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatDate(item.created_at)}
                                {item.screen_context && ` • ${item.screen_context}`}
                              </p>
                            </div>
                          </div>
                          {item.rating && (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`size-4 ${
                                    star <= item.rating!
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : isDark
                                      ? 'text-gray-600'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.message}
                        </p>

                        {item.admin_response && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            isDark ? 'bg-teal-500/10 border border-teal-500/20' : 'bg-teal-50 border border-teal-200'
                          }`}>
                            <p className={`text-xs font-medium mb-1 ${
                              isDark ? 'text-teal-400' : 'text-teal-700'
                            }`}>
                              {t('dashboard.feedback.adminResponse')}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
                              {item.admin_response}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            {item.priority === 'high' && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                              }`}>
                                {t('dashboard.feedback.priority.high')}
                              </span>
                            )}
                            {item.response_required && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {t('dashboard.feedback.responseRequired')}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              isDark
                                ? 'text-red-400 hover:bg-red-500/20'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 className="size-3 inline mr-1" />
                            {t('dashboard.feedback.delete')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Feedback Form */
          <div className="space-y-6">
            {/* Feedback Type Selection */}
            <div className={`rounded-2xl border p-6 ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.feedback.selectType')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                        isSelected
                          ? isDark
                            ? 'bg-teal-500/20 border-teal-500/50'
                            : 'bg-teal-50 border-teal-500'
                          : isDark
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`size-5 mb-2 ${
                        isSelected
                          ? 'text-teal-500'
                          : isDark
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`} />
                      <div className={`text-sm font-medium mb-1 ${
                        isSelected
                          ? isDark ? 'text-teal-400' : 'text-teal-700'
                          : isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {t(`dashboard.feedback.types.${type.id}.label`)}
                      </div>
                      <div className={`text-xs ${
                        isDark ? 'text-gray-500' : 'text-gray-600'
                      }`}>
                        {t(`dashboard.feedback.types.${type.id}.description`)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rating (Optional) */}
            <div className={`rounded-2xl border p-6 ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.feedback.rating')} <span className="text-sm text-gray-500">({t('dashboard.feedback.optional')})</span>
              </h2>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-8 ${
                        rating && star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : isDark
                          ? 'text-gray-600 hover:text-yellow-500'
                          : 'text-gray-300 hover:text-yellow-500'
                      }`}
                    />
                  </button>
                ))}
                {rating && (
                  <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('dashboard.feedback.ratingSelected', { rating })}
                  </span>
                )}
              </div>
            </div>

            {/* Message Form */}
            <form onSubmit={handleSubmit} className={`rounded-2xl border p-6 ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.feedback.yourFeedback')}
              </h2>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder={t('dashboard.feedback.messagePlaceholder')}
                className={`w-full px-4 py-3 rounded-xl border resize-none ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                required
              />
              <div className="flex items-center justify-between mt-4">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  {t('dashboard.feedback.helpText')}
                </p>
                <Button
                  type="submit"
                  disabled={saving || !message.trim()}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      {t('dashboard.feedback.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="size-4 mr-2" />
                      {t('dashboard.feedback.submit')}
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Info Box */}
            <div className={`rounded-xl border p-4 ${
              isDark
                ? 'bg-blue-500/10 border-blue-500/20'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                {t('dashboard.feedback.info')}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

