import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Sparkles, Mail } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import authHero from "../../Assets/Auth Page hero image.png";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const forgotPasswordSchema = useMemo(() => z.object({
    email: z.string().email(t('authPages.common.invalidEmail')),
  }), [t]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate email
      forgotPasswordSchema.parse({ email });

      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setIsEmailSent(true);
      toast.success(t('authPages.forgotPassword.toastSuccess'));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors[0].message;
        setError(message);
        toast.error(message);
      } else if (error instanceof Error) {
        console.error(error);
        setError(t('authPages.common.passwordResetFailed'));
        toast.error(t('authPages.common.passwordResetFailed'));
      } else {
        toast.error(t('authPages.common.unexpectedError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-start p-6 md:pl-16">
        {/* Full-bleed hero image */}
        <div className="absolute inset-0 -z-10">
          <img src={authHero} alt="CVSaathi" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-sm md:ml-0"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-teal-500/30 border border-white/20 p-6 md:p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Mail className="w-8 h-8 text-teal-600" />
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              {t('authPages.forgotPassword.successTitle')}
            </h1>
            <p className="text-gray-600 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
              {t('authPages.forgotPassword.successDescription', { email })}
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => navigate("/auth/signin")}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30 h-12"
              >
                {t('authPages.forgotPassword.successButton')}
              </Button>
              <Button
                onClick={() => setIsEmailSent(false)}
                variant="outline"
                className="w-full border-gray-300"
              >
                {t('authPages.forgotPassword.resendButton')}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-start p-6 md:pl-16">
      {/* Full-bleed hero image */}
      <div className="absolute inset-0 -z-10">
        <img src={authHero} alt="CVSaathi" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm md:ml-0"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-teal-50 border border-teal-200 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-teal-700 text-sm font-medium tracking-wide">
              {t('authPages.forgotPassword.badge')}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('authPages.forgotPassword.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600 mb-8"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {t('authPages.forgotPassword.description')}
          </motion.p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Label htmlFor="email" className="text-gray-700 font-medium mb-2 block">
                {t('authPages.common.emailLabel')}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full ${error ? 'border-red-500 focus-visible:ring-red-500/50' : 'focus-visible:ring-teal-500/50'}`}
                disabled={isLoading}
                required
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="pt-2"
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30 h-12 text-base font-semibold gap-2"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('authPages.forgotPassword.submitting')}
                  </>
                ) : (
                  <>
                    {t('authPages.forgotPassword.submit')}
                    <Mail className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Back to Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-6 text-center"
          >
            <Link
              to="/auth/signin"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('authPages.forgotPassword.backToSignIn')}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

