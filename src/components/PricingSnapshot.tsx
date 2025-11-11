import { motion } from "motion/react";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "./ui/button";

const plans = [
  {
    name: "Free",
    icon: Sparkles,
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "1 resume",
      "Basic templates",
      "ATS score check",
      "PDF download",
      "Basic AI suggestions",
    ],
    cta: "Start Free",
    popular: false,
    gradient: "from-gray-400 to-gray-600",
  },
  {
    name: "Pro",
    icon: Zap,
    price: "₹299",
    period: "per month",
    description: "Most popular for job seekers",
    features: [
      "Unlimited resumes",
      "Premium templates",
      "Advanced ATS optimization",
      "Cover letter builder",
      "AI-powered writing",
      "Expert review",
      "Priority support",
    ],
    cta: "Start 7-Day Free Trial",
    popular: true,
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    name: "Lifetime",
    icon: Crown,
    price: "₹2,999",
    period: "one-time",
    description: "Best value for career growth",
    features: [
      "Everything in Pro",
      "Lifetime access",
      "All future features",
      "LinkedIn optimization",
      "Interview preparation",
      "Career coaching",
      "VIP support",
    ],
    cta: "Get Lifetime Access",
    popular: false,
    gradient: "from-yellow-400 to-orange-500",
  },
];

export function PricingSnapshot() {
  return (
    <section id="pricing" className="py-32 px-6 relative overflow-hidden bg-white">
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
          <div className="inline-block px-5 py-2 mb-6 bg-teal-50 border border-teal-200 rounded-full">
            <span className="text-teal-700 uppercase tracking-wider">Simple Pricing</span>
          </div>
          <h2 className="text-gray-900 mb-6">
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
                        className="flex items-center gap-3"
                      >
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
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

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            All plans include <span className="text-teal-600">30-day money-back guarantee</span> • No credit card required for free plan
          </p>
        </motion.div>
      </div>
    </section>
  );
}
