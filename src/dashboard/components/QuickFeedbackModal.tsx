import { useState } from "react";
import { X, Star, Send, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useFeedback, FeedbackType } from "../../hooks/useFeedback";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface QuickFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    screen?: string;
    action?: string;
    feature?: string;
  };
  onSuccess?: () => void;
}

export function QuickFeedbackModal({ 
  isOpen, 
  onClose, 
  context,
  onSuccess 
}: QuickFeedbackModalProps) {
  const { t } = useTranslation();
  const { createFeedback, saving } = useFeedback();
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<FeedbackType>('general');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      toast.error(t('dashboard.feedback.ratingRequired'));
      return;
    }

    try {
      await createFeedback({
        message: message.trim() || t('dashboard.feedback.quickFeedbackDefault', { rating }),
        type,
        rating,
        screen_context: context?.screen || 'dashboard',
      });

      // Reset form
      setRating(null);
      setMessage('');
      setType('general');
      
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleSkip = () => {
    setRating(null);
    setMessage('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`relative max-w-md w-full rounded-2xl border ${
          true // You can pass isDark prop if needed
            ? 'bg-slate-800 border-white/10'
            : 'bg-white border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className={`text-lg font-semibold ${
            true ? 'text-white' : 'text-gray-900'
          }`}>
            {t('dashboard.feedback.quickFeedbackTitle')}
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${
              true ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`size-5 ${true ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {context?.feature && (
            <p className={`text-sm mb-4 ${true ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('dashboard.feedback.quickFeedbackContext', { feature: context.feature })}
            </p>
          )}

          {/* Rating */}
          <div className="mb-6">
            <label className={`block text-sm mb-3 ${true ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('dashboard.feedback.howWasYourExperience')} *
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-125 active:scale-95"
                >
                  <Star
                    className={`size-10 ${
                      rating && star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating && (
              <p className={`text-center text-sm mt-2 ${true ? 'text-gray-400' : 'text-gray-600'}`}>
                {rating <= 2 
                  ? t('dashboard.feedback.ratingLow')
                  : rating === 3
                  ? t('dashboard.feedback.ratingMedium')
                  : t('dashboard.feedback.ratingHigh')
                }
              </p>
            )}
          </div>

          {/* Optional Message */}
          <div className="mb-6">
            <label className={`block text-sm mb-2 ${true ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('dashboard.feedback.additionalComments')} <span className="text-gray-500">({t('dashboard.feedback.optional')})</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder={t('dashboard.feedback.quickMessagePlaceholder')}
              className={`w-full px-4 py-2 rounded-xl border resize-none ${
                true
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-200 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              {t('dashboard.feedback.skip')}
            </Button>
            <Button
              type="submit"
              disabled={saving || !rating}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
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
      </div>
    </div>
  );
}

