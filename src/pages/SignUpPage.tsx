import { motion } from "motion/react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import authHero from "../../Assets/Auth Page hero image.png";

export function SignUpPage() {
  const { t } = useTranslation();
  const signUpSchema = useMemo(() => z.object({
    name: z.string().min(2, t('authPages.common.nameMin')),
    email: z.string().email(t('authPages.common.invalidEmail')),
    password: z.string().min(8, t('authPages.common.passwordMin')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('authPages.common.passwordsMismatch'),
    path: ["confirmPassword"],
  }), [t]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/app");
    }
  }, [user, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form
      signUpSchema.parse(formData);

      // Sign up user
      await signUp(formData.email, formData.password);
      
      toast.success(t('authPages.signUp.successToast'));
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/app");
      }, 1500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error(t('authPages.common.formError'));
      } else if (error instanceof Error) {
        console.error(error);
        toast.error(t('authPages.common.accountCreationFailed'));
      } else {
        toast.error(t('authPages.common.unexpectedError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-start p-6 md:pl-16">
      {/* Full-bleed hero image */}
      <div className="absolute inset-0 -z-10">
        <img src={authHero} alt="CVSaathi" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/45 to-black/15" />
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm md:ml-0"
      >
        <div className="bg-gradient-to-br from-white/98 via-white/95 to-teal-50/70 backdrop-blur-xl rounded-3xl shadow-[0_35px_65px_rgba(15,23,42,0.35)] border border-white/50 p-6 md:p-8 lg:p-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-teal-50 border border-teal-200 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-teal-700 text-sm font-medium tracking-wide">
              {t('authPages.signUp.badge')}
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
            {t('authPages.signUp.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600 mb-8"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {t('authPages.signUp.description')}
          </motion.p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Label htmlFor="name" className="text-gray-700 font-medium mb-2 block">
                {t('authPages.common.fullNameLabel')}
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full ${errors.name ? 'border-red-500 focus-visible:ring-red-500/50' : 'focus-visible:ring-teal-500/50'}`}
                disabled={isLoading}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Label htmlFor="email" className="text-gray-700 font-medium mb-2 block">
                {t('authPages.common.emailLabel')}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full ${errors.email ? 'border-red-500 focus-visible:ring-red-500/50' : 'focus-visible:ring-teal-500/50'}`}
                disabled={isLoading}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Label htmlFor="password" className="text-gray-700 font-medium mb-2 block">
                {t('authPages.common.passwordLabel')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className={`w-full pr-12 ${errors.password ? 'border-red-500 focus-visible:ring-red-500/50' : 'focus-visible:ring-teal-500/50'}`}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? t('authPages.common.hidePassword') : t('authPages.common.showPassword')}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium mb-2 block">
                {t('authPages.common.confirmPasswordLabel')}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`w-full pr-12 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500/50' : 'focus-visible:ring-teal-500/50'}`}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? t('authPages.common.hidePassword') : t('authPages.common.showPassword')}
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
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
                    {t('authPages.signUp.submitting')}
                  </>
                ) : (
                  <>
                    {t('authPages.signUp.submit')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-600 text-sm">
              {t('authPages.common.haveAccountPrompt')}{" "}
              <Link
                to="/auth/signin"
                className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
              >
                {t('authPages.common.signInLinkText')}
              </Link>
            </p>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4 justify-center text-xs text-gray-500"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t('authPages.signUp.trustNoCard')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t('authPages.signUp.trustTrial')}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

