import { useState, useEffect } from "react";
import { ArrowLeft, Check, Zap, Star, Sparkles, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";
import { useUserProfile } from "../../hooks/useUserProfile";
import { paymentService } from "../../services/paymentService";
import { useTranslation } from "react-i18next";

interface PricingPageProps {
  isDark: boolean;
  onBack: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PricingPage({ isDark, onBack }: PricingPageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentPlan, refreshSubscription } = useSubscription();
  const { profile } = useUserProfile();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script once
  useEffect(() => {
    if (razorpayLoaded || typeof window.Razorpay !== 'undefined') {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      toast.error(t('dashboard.pricing.toasts.failedToLoadGateway'));
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [razorpayLoaded]);

  // Plan structure matching the image
  const plans = [
    {
      id: 'free',
      name: t('dashboard.pricing.plans.free.name'),
      icon: Sparkles,
      description: t('dashboard.pricing.plans.free.description'),
      monthlyPrice: 0, // ₹0
      annualPrice: 0, // ₹0
      color: 'from-gray-400 to-gray-500',
      borderColor: isDark ? 'border-white/10' : 'border-gray-200',
      features: [
        t('dashboard.pricing.plans.free.features.aiCoaching'),
        t('dashboard.pricing.plans.free.features.resumeBuilder'),
        t('dashboard.pricing.plans.free.features.templates'),
        t('dashboard.pricing.plans.free.features.pdfExport'),
        t('dashboard.pricing.plans.free.features.interviewPrep'),
        t('dashboard.pricing.plans.free.features.languages'),
        t('dashboard.pricing.plans.free.features.profileSetup'),
        t('dashboard.pricing.plans.free.features.atsChecker'),
        t('dashboard.pricing.plans.free.features.skillGap'),
        t('dashboard.pricing.plans.free.features.whatsapp'),
      ],
      cta: t('dashboard.pricing.plans.free.cta'),
      popular: false,
    },
    {
      id: 'starter',
      name: t('dashboard.pricing.plans.starter.name'),
      icon: Zap,
      description: t('dashboard.pricing.plans.starter.description'),
      monthlyPrice: 9900, // ₹99 in paise
      annualPrice: 99000, // ₹990/year (₹99 * 10 months = save 2 months)
      color: 'from-blue-400 to-indigo-500',
      borderColor: isDark ? 'border-blue-500/30' : 'border-blue-300',
      features: [
        t('dashboard.pricing.plans.starter.features.aiCoaching'),
        t('dashboard.pricing.plans.starter.features.resumeBuilder'),
        t('dashboard.pricing.plans.starter.features.templates'),
        t('dashboard.pricing.plans.starter.features.pdfExport'),
        t('dashboard.pricing.plans.starter.features.interviewPrep'),
        t('dashboard.pricing.plans.starter.features.languages'),
        t('dashboard.pricing.plans.starter.features.atsChecker'),
        t('dashboard.pricing.plans.starter.features.skillGap'),
        t('dashboard.pricing.plans.starter.features.whatsapp'),
        t('dashboard.pricing.plans.starter.features.emailSupport'),
      ],
      cta: t('dashboard.pricing.plans.starter.cta'),
      popular: false,
      savingsAnnual: 198, // Save ₹198/year (2 months free)
    },
    {
      id: 'professional',
      name: t('dashboard.pricing.plans.professional.name'),
      icon: Star,
      description: t('dashboard.pricing.plans.professional.description'),
      monthlyPrice: 19900, // ₹199 in paise
      annualPrice: 199000, // ₹1990/year (₹199 * 10 months = save 2 months)
      color: 'from-teal-400 to-cyan-500',
      borderColor: 'border-teal-500',
      features: [
        t('dashboard.pricing.plans.professional.features.aiCoaching'),
        t('dashboard.pricing.plans.professional.features.resumeBuilder'),
        t('dashboard.pricing.plans.professional.features.templates'),
        t('dashboard.pricing.plans.professional.features.interviewPrep'),
        t('dashboard.pricing.plans.professional.features.atsChecker'),
        t('dashboard.pricing.plans.professional.features.skillGap'),
        t('dashboard.pricing.plans.professional.features.pdfExport'),
        t('dashboard.pricing.plans.professional.features.formatting'),
        t('dashboard.pricing.plans.professional.features.prioritySupport'),
        t('dashboard.pricing.plans.professional.features.whatsapp'),
        t('dashboard.pricing.plans.professional.features.analytics'),
      ],
      cta: t('dashboard.pricing.plans.professional.cta'),
      popular: true,
      badge: t('dashboard.pricing.plans.professional.badge'),
      savingsAnnual: 398, // Save ₹398/year (2 months free)
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      toast.info(t('dashboard.pricing.toasts.alreadyOnFreePlan'));
      return;
    }

    if (!user) {
      toast.error(t('dashboard.pricing.toasts.signInRequired'));
      return;
    }

    if (!razorpayLoaded) {
      toast.error(t('dashboard.pricing.toasts.paymentGatewayLoading'));
      return;
    }

    setLoadingPlan(planId);

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const amount = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
      const planName = planId === 'starter' ? 'starter' : 'professional';
      const billingCycleType = billingCycle === 'annual' ? 'yearly' : 'monthly';

      // Step 1: Create payment order via edge function
      toast.loading(t('dashboard.pricing.toasts.creatingOrder'), { id: 'payment-order' });
      
      const orderData = await paymentService.createPaymentOrder({
        plan_id: planName as 'starter' | 'professional',
        billing_cycle: billingCycleType as 'monthly' | 'yearly',
        amount: amount,
      });

      toast.dismiss('payment-order');

      // Step 2: Get user profile for prefill
      const userName = profile?.full_name || 
                       (profile?.first_name && profile?.last_name 
                         ? `${profile.first_name} ${profile.last_name}` 
                         : user.email?.split('@')[0] || '');
      const userEmail = user.email || '';
      const userPhone = profile?.phone || '';

      // Step 3: Open Razorpay checkout
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        throw new Error('Razorpay Key ID is not configured. Please check your environment variables.');
      }

      const options = {
        key: razorpayKeyId,
        amount: orderData.amount, // Already in paise
        currency: orderData.currency || 'INR',
        name: 'CVSaathi',
        description: `${plan.name} - ${billingCycle === 'annual' ? 'Annual' : 'Monthly'} Subscription`,
        order_id: orderData.razorpay_order_id,
        handler: async function (response: any) {
          try {
            setLoadingPlan(planId);
            toast.loading(t('dashboard.pricing.toasts.verifyingPayment'), { id: 'payment-verify' });

            // Step 4: Verify payment with backend
            const verifyResult = await paymentService.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: planName as 'starter' | 'professional',
              billing_cycle: billingCycleType as 'monthly' | 'yearly',
              amount: orderData.amount, // Amount in paise, needed for subscription activation
            });

            toast.dismiss('payment-verify');

            if (verifyResult.success) {
              toast.success(t('dashboard.pricing.toasts.paymentSuccess'), {
                description: t('dashboard.pricing.toasts.welcomeToPlan', { planName: plan.name }),
                duration: 5000,
              });
              
              // Refresh subscription status
              await refreshSubscription();
              
              // Small delay before going back to dashboard
              setTimeout(() => {
                onBack();
              }, 2000);
            } else {
              throw new Error(verifyResult.message || t('dashboard.pricing.toasts.paymentVerificationFailed'));
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error(t('dashboard.pricing.toasts.paymentVerificationFailed'), {
              description: error.message || t('dashboard.pricing.toasts.contactSupportIfDeducted'),
            });
          } finally {
            setLoadingPlan(null);
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        notes: {
          plan: planId,
          plan_name: plan.name,
          billing_cycle: billingCycleType,
        },
        theme: {
          color: '#14b8a6', // Teal color
        },
        modal: {
          ondismiss: function() {
            setLoadingPlan(null);
            toast.info(t('dashboard.pricing.toasts.paymentCancelled'));
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response);
        toast.error(t('dashboard.pricing.toasts.paymentFailed'), {
          description: response.error?.description || t('dashboard.pricing.toasts.tryAgainOrContactSupport'),
        });
        setLoadingPlan(null);
      });

      razorpay.open();
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast.error(t('dashboard.pricing.toasts.failedToStartPayment'), {
        description: error.message || t('dashboard.pricing.toasts.tryAgainLater'),
      });
      setLoadingPlan(null);
    }
  };

  const getPrice = (plan: typeof plans[0]) => {
    const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
    return (price / 100).toFixed(0); // Convert paise to rupees
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (billingCycle === 'annual' && plan.savingsAnnual) {
      return plan.savingsAnnual;
    }
    return 0;
  };

  // Check if user is on current plan
  const isCurrentPlan = (planId: string) => {
    if (planId === 'free' && currentPlan.name === 'free') return true;
    if (planId === 'starter' && currentPlan.name === 'starter') return true;
    if (planId === 'professional' && currentPlan.name === 'professional') return true;
    return false;
  };

  // Update CTA text based on current plan
  const getCtaText = (planId: string, defaultCta: string) => {
    if (isCurrentPlan(planId)) {
      return t('dashboard.pricing.buttons.currentPlan');
    }
    if (planId === 'free') {
      return t('dashboard.pricing.buttons.currentPlan');
    }
    return defaultCta;
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
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className={`size-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <div>
              <h1 className={`text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.pricing.pageTitle')}
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('dashboard.pricing.pageDescription')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12 max-w-7xl mx-auto">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className={`inline-flex items-center gap-4 p-2 rounded-2xl border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('dashboard.pricing.billingCycle.monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 relative ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('dashboard.pricing.billingCycle.annual')}
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">
                {t('dashboard.pricing.billingCycle.saveUpTo', { amount: 398 })}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price = getPrice(plan);
            const savings = getSavings(plan);
            const isLoading = loadingPlan === plan.id;
            const isCurrent = isCurrentPlan(plan.id);

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border-2 transition-all duration-500 ${
                  plan.popular 
                    ? 'transform scale-105 shadow-2xl' 
                    : 'hover:scale-105 hover:shadow-xl'
                } ${
                  isDark 
                    ? plan.popular 
                      ? 'bg-white/10 border-teal-500 shadow-teal-500/20' 
                      : 'bg-white/5 ' + plan.borderColor
                    : plan.popular
                      ? 'bg-white border-teal-500 shadow-teal-200'
                      : 'bg-white ' + plan.borderColor
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm shadow-lg">
                      <Star className="size-4 fill-white" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.color} mb-6`}>
                    <Icon className="size-8 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className={`text-2xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {plan.id === 'free' ? t('dashboard.pricing.price.free') : `₹${price}`}
                      </span>
                      {plan.id !== 'free' && (
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {billingCycle === 'annual' ? t('dashboard.pricing.price.perYear') : t('dashboard.pricing.price.perMonth')}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'annual' && savings > 0 && (
                      <p className="text-sm text-teal-500 mt-2">
                        {plan.id === 'starter' ? t('dashboard.pricing.plans.starter.savingsAnnual') : t('dashboard.pricing.plans.professional.savingsAnnual')}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent || isLoading || !razorpayLoaded}
                    className={`w-full mb-6 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white'
                        : isDark
                          ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        {t('dashboard.pricing.buttons.processing')}
                      </>
                    ) : (
                      getCtaText(plan.id, plan.cta)
                    )}
                  </Button>

                  {/* Features */}
                  <div className="space-y-3">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('dashboard.pricing.whatsIncluded')}
                    </p>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className={`size-5 mt-0.5 flex-shrink-0 ${
                          plan.popular ? 'text-teal-500' : isDark ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className={`rounded-3xl border p-8 ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard.pricing.comparePlans')}
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <th className={`text-left py-4 px-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('dashboard.pricing.comparisonTable.feature')}
                  </th>
                  <th className={`text-center py-4 px-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.pricing.comparisonTable.freePlan')}
                  </th>
                  <th className={`text-center py-4 px-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.pricing.comparisonTable.starterPlan')}
                  </th>
                  <th className={`text-center py-4 px-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.pricing.comparisonTable.professionalPlan')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: t('dashboard.pricing.comparisonTable.features.aiCoaching'), free: '3 sessions/month', starter: '15 sessions/month', professional: t('dashboard.pricing.comparisonTable.values.unlimited') },
                  { feature: t('dashboard.pricing.comparisonTable.features.resumeBuilder'), free: '3 resumes', starter: '10 resumes', professional: t('dashboard.pricing.comparisonTable.values.unlimited') },
                  { feature: t('dashboard.pricing.comparisonTable.features.templates'), free: '10 free templates', starter: '15 templates', professional: t('dashboard.pricing.comparisonTable.values.unlimited') + ' access' },
                  { feature: t('dashboard.pricing.comparisonTable.features.pdfExport'), free: '3 PDFs (' + t('dashboard.pricing.comparisonTable.values.watermark') + ')', starter: '10 PDFs (' + t('dashboard.pricing.comparisonTable.values.noWatermark') + ')', professional: t('dashboard.pricing.comparisonTable.values.unlimited') + ' (' + t('dashboard.pricing.comparisonTable.values.noWatermark') + ')' },
                  { feature: t('dashboard.pricing.comparisonTable.features.interviewPrep'), free: '2 sessions/month', starter: '15 sessions/month', professional: t('dashboard.pricing.comparisonTable.values.unlimited') },
                  { feature: t('dashboard.pricing.comparisonTable.features.atsChecker'), free: '1 analysis/month', starter: '5 analyses/month', professional: t('dashboard.pricing.comparisonTable.values.unlimited') + ' + detailed reports' },
                  { feature: t('dashboard.pricing.comparisonTable.features.skillGap'), free: '1 analysis/month', starter: '8 analyses/month', professional: t('dashboard.pricing.comparisonTable.values.unlimited') },
                  { feature: t('dashboard.pricing.comparisonTable.features.languages'), free: t('dashboard.pricing.comparisonTable.values.allLanguages'), starter: t('dashboard.pricing.comparisonTable.values.allLanguages'), professional: t('dashboard.pricing.comparisonTable.values.allLanguages') },
                  { feature: t('dashboard.pricing.comparisonTable.features.whatsapp'), free: t('dashboard.pricing.comparisonTable.values.watermark'), starter: t('dashboard.pricing.comparisonTable.values.cleanExport'), professional: t('dashboard.pricing.comparisonTable.values.cleanExport') },
                  { feature: t('dashboard.pricing.comparisonTable.features.support'), free: t('dashboard.pricing.comparisonTable.values.community'), starter: t('dashboard.pricing.comparisonTable.values.emailSupport'), professional: t('dashboard.pricing.comparisonTable.values.prioritySupport') },
                  { feature: t('dashboard.pricing.comparisonTable.features.formatting'), free: t('dashboard.pricing.comparisonTable.values.notAvailable'), starter: t('dashboard.pricing.comparisonTable.values.available'), professional: t('dashboard.pricing.comparisonTable.values.available') },
                  { feature: t('dashboard.pricing.comparisonTable.features.analytics'), free: t('dashboard.pricing.comparisonTable.values.notAvailable'), starter: t('dashboard.pricing.comparisonTable.values.notAvailable'), professional: t('dashboard.pricing.comparisonTable.values.available') },
                  { feature: t('dashboard.pricing.comparisonTable.features.notifications'), free: t('dashboard.pricing.comparisonTable.values.notAvailable'), starter: t('dashboard.pricing.comparisonTable.values.notAvailable'), professional: t('dashboard.pricing.comparisonTable.values.available') },
                ].map((row, i) => (
                  <tr key={i} className={`border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <td className={`py-4 px-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {row.feature}
                    </td>
                    <td className={`text-center py-4 px-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {row.free}
                    </td>
                    <td className={`text-center py-4 px-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {row.starter}
                    </td>
                    <td className={`text-center py-4 px-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {row.professional}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className={`text-2xl mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard.pricing.faq.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: t('dashboard.pricing.faq.questions.changePlans.q'),
                a: t('dashboard.pricing.faq.questions.changePlans.a'),
              },
              {
                q: t('dashboard.pricing.faq.questions.paymentMethods.q'),
                a: t('dashboard.pricing.faq.questions.paymentMethods.a'),
              },
              {
                q: t('dashboard.pricing.faq.questions.refundPolicy.q'),
                a: t('dashboard.pricing.faq.questions.refundPolicy.a'),
              },
              {
                q: t('dashboard.pricing.faq.questions.annualDiscounts.q'),
                a: t('dashboard.pricing.faq.questions.annualDiscounts.a'),
              },
              {
                q: t('dashboard.pricing.faq.questions.exceedLimits.q'),
                a: t('dashboard.pricing.faq.questions.exceedLimits.a'),
              },
              {
                q: t('dashboard.pricing.faq.questions.cancelSubscription.q'),
                a: t('dashboard.pricing.faq.questions.cancelSubscription.a'),
              },
            ].map((faq, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {faq.q}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
