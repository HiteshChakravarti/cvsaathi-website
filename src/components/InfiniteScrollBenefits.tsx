import { motion } from "motion/react";
import { Lightbulb, Users, TrendingUp, Award, DollarSign, Zap, Shield, Target } from "lucide-react";

const benefits = [
  { icon: Lightbulb, label: "Faster Innovation" },
  { icon: Users, label: "Virtual Assistance" },
  { icon: TrendingUp, label: "Scalable Solutions" },
  { icon: Award, label: "Personalized Experiences" },
  { icon: DollarSign, label: "Cost Effective" },
  { icon: Zap, label: "Lightning Fast" },
  { icon: Shield, label: "Secure & Private" },
  { icon: Target, label: "Precision Matching" },
];

export function InfiniteScrollBenefits() {
  // Duplicate benefits for seamless loop
  const duplicatedBenefits = [...benefits, ...benefits];

  return (
    <section className="py-4 relative overflow-hidden bg-transparent">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

      {/* Scrolling container */}
      <motion.div
        className="flex gap-6"
        animate={{
          x: [0, -50 + '%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {duplicatedBenefits.map((benefit, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-3 px-6 py-3 bg-gray-100 border border-gray-200 rounded-full whitespace-nowrap group hover:bg-gray-900 hover:border-gray-900 transition-all cursor-pointer flex-shrink-0 shadow-sm"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-teal-500 group-hover:to-cyan-500 transition-all">
              <benefit.icon className="w-4 h-4 text-teal-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-gray-700 group-hover:text-white transition-colors">
              {benefit.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
