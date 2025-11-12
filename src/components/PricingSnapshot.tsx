import { motion } from "motion/react";
import { Check, Sparkles, Zap, Crown, DollarSign } from "lucide-react";
import { Button } from "./ui/button";

const plans = [
  {
    name: "Free Plan",
    icon: Sparkles,
    price: "₹0",
    period: "month",
    description: "Perfect for getting started",
    features: [
      { title: "AI career coaching", detail: "3 sessions/month" },
      { title: "Resume builder", detail: "3 resumes with critique & ATS" },
      { title: "Resume templates", detail: "10 free templates" },
      { title: "PDF export", detail: "3 PDFs with watermark" },
      { title: "Interview prep", detail: "2 complete sessions/month" },
      { title: "Languages", detail: "All languages (EN/HI/MR)" },
      { title: "Basic profile setup", detail: "Available" },
      { title: "ATS checker", detail: "1 analysis/month" },
      { title: "Skill gap analysis", detail: "1 analysis/month" },
      { title: "WhatsApp export", detail: "With watermark" },
    ],
    cta: "Current Plan",
    popular: false,
    gradient: "from-gray-400 to-gray-600",
  },
  {
    name: "Starter Plan",
    icon: Zap,
    price: "₹99",
    period: "month",
    description: "Great for job seekers",
    features: [
      { title: "AI career coaching", detail: "15 sessions/month" },
      { title: "Resume builder", detail: "10 resumes with critique & ATS" },
      { title: "Resume templates", detail: "15 templates" },
      { title: "PDF export", detail: "10 PDFs without watermark" },
      { title: "Interview prep", detail: "15 complete sessions/month" },
      { title: "All languages", detail: "EN/HI/MR" },
      { title: "ATS checker", detail: "5 analyses/month" },
      { title: "Skill gap analysis", detail: "8 analyses/month" },
      { title: "WhatsApp export", detail: "Clean export" },
      { title: "Email support", detail: "Available" },
    ],
    cta: "Upgrade Now",
    popular: false,
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    name: "Professional Plan",
    icon: Crown,
    price: "₹199",
    period: "month",
    description: "For serious career growth",
    features: [
      { title: "Unlimited AI career coaching", detail: "Unlimited" },
      { title: "Resume builder", detail: "Unlimited resumes with critique & ATS" },
      { title: "All premium templates", detail: "Unlimited access" },
      { title: "Unlimited interview prep", detail: "Unlimited sessions" },
      { title: "Unlimited ATS checker", detail: "Unlimited + detailed reports" },
      { title: "Unlimited skill gap analysis", detail: "Unlimited analyses" },
      { title: "PDF export", detail: "Unlimited without watermark" },
      { title: "Advanced formatting", detail: "Available" },
      { title: "Priority support", detail: "Available" },
      { title: "WhatsApp notifications", detail: "Available" },
      { title: "Advanced analytics", detail: "Available" },
    ],
    cta: "Select Plan",
    popular: true,
    gradient: "from-teal-500 to-cyan-500",
  },
];

export function PricingSnapshot() {
  return (
    <section id="pricing" className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.05),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.05),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-6 bg-teal-50 border border-teal-200 rounded-full shadow-sm"
          >
            <DollarSign className="w-4 h-4 text-teal-600" />
            <span className="text-teal-700 uppercase tracking-wider">Simple Pricing</span>
          </motion.div>
          <h2 
            className="mb-6"
            style={{
              fontSize: '3rem',
              fontWeight: 600,
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Choose your perfect plan
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade anytime. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: plan.popular ? 1.02 : 1.01 }}
              className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                >
                  <div className="px-4 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm shadow-lg">
                    Most Popular
                  </div>
                </motion.div>
              )}

              {/* Card */}
              <div className={`relative h-full bg-white rounded-3xl p-8 shadow-xl transition-all duration-300 ${
                plan.popular 
                  ? 'border-2 border-teal-500 md:py-12' 
                  : 'border-2 border-gray-200 hover:border-teal-300'
              }`}>
                {/* Gradient overlay */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${plan.gradient} ${
                  plan.popular ? 'opacity-5' : 'opacity-0'
                } group-hover:opacity-5 transition-all duration-300`} />

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <plan.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Plan name */}
                  <h3 className="text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-900" style={{ fontSize: '3rem', lineHeight: '1' }}>
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-gray-500">
                      {plan.period}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + featureIndex * 0.05 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3"
                      >
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-900">{feature.title}</div>
                          <div className="text-gray-500 text-sm italic">{feature.detail}</div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30'
                          : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-teal-500 hover:bg-teal-50'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Remove the money-back guarantee text */}
      </div>
    </section>
  );
}