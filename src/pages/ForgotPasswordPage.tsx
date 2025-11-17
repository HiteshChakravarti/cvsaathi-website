import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Sparkles, Mail } from "lucide-react";
import { z } from "zod";
import authHero from "../../Assets/Auth Page hero image.png";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function ForgotPasswordPage() {
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
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
        toast.error("Please enter a valid email address");
      } else if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message || "Failed to send reset email. Please try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
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
              Check Your Email
            </h1>
            <p className="text-gray-600 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => navigate("/auth/signin")}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30 h-12"
              >
                Back to Sign In
              </Button>
              <Button
                onClick={() => setIsEmailSent(false)}
                variant="outline"
                className="w-full border-gray-300"
              >
                Send Another Email
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
              Reset Password
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
            Forgot Password?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600 mb-8"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            No worries! Enter your email and we'll send you a reset link.
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
                Email Address
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
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
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
              Back to Sign In
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

