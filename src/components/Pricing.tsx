import { motion } from "motion/react";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const plans = [
  {
    name: "Free",
    icon: Sparkles,
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "1 Resume",
      "Basic Templates",
      "ATS Optimization",
      "PDF Download",
      "City-Smart Suggestions",
    ],
    cta: "Get Started",
    popular: false,
    gradient: "from-white/5 to-white/5",
  },
  {
    name: "Pro",
    icon: Zap,
    price: "₹299",
    period: "per month",
    description: "For serious job seekers",
    features: [
      "Unlimited Resumes",
      "Premium Templates",
      "Advanced AI Optimization",
      "Multiple Export Formats",
      "Priority Support",
      "Cover Letter Generator",
      "LinkedIn Profile Optimizer",
    ],
    cta: "Start Free Trial",
    popular: true,
    gradient: "from-purple-500/20 to-blue-500/20",
  },
  {
    name: "Lifetime",
    icon: Crown,
    price: "₹2,999",
    period: "one-time",
    description: "Best value for your career",
    features: [
      "Everything in Pro",
      "Lifetime Access",
      "All Future Features",
      "1-on-1 Career Consultation",
      "Interview Prep Resources",
      "Salary Negotiation Guide",
      "Job Market Insights",
    ],
    cta: "Get Lifetime Access",
    popular: false,
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="mb-4 text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Choose the perfect plan for your career journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white z-20">
                  Most Popular
                </div>
              )}

              <Card
                className={`relative overflow-hidden bg-gradient-to-br ${plan.gradient} backdrop-blur-xl border ${
                  plan.popular ? "border-purple-500/50" : "border-white/10"
                } hover:border-white/20 transition-all p-8 h-full flex flex-col ${
                  plan.popular ? "scale-105" : ""
                }`}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-6">
                  <plan.icon className="w-6 h-6 text-white" />
                </div>

                {/* Plan name and price */}
                <div className="mb-6">
                  <h3 className="mb-2 text-white">{plan.name}</h3>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-white">{plan.price}</span>
                    <span className="text-white/50 mb-1">/{plan.period}</span>
                  </div>
                  <p className="text-white/60">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {plan.cta}
                </Button>

                {/* Background gradient effect */}
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-2xl -z-10" />
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-white/60 mb-4">Trusted by professionals at</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {["Google", "Microsoft", "Amazon", "Flipkart", "Zomato", "Swiggy"].map(
              (company, index) => (
                <div key={index} className="text-white/40">
                  {company}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
