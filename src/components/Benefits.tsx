import { motion } from "motion/react";
import { TrendingUp, Clock, Shield, Target, Zap, Award } from "lucide-react";
import { Card } from "./ui/card";

const benefits = [
  {
    icon: TrendingUp,
    title: "3x Higher Interview Rate",
    description: "Our AI-optimized resumes get 3x more interview callbacks compared to traditional resumes.",
    color: "from-[#2DD4BF] to-[#3B82F6]",
  },
  {
    icon: Clock,
    title: "Save 90% Time",
    description: "Create a professional resume in 15 minutes instead of spending hours formatting and editing.",
    color: "from-[#A855F7] to-[#EC4899]",
  },
  {
    icon: Target,
    title: "City-Smart Targeting",
    description: "Resumes tailored for specific Indian cities with local market insights and trends.",
    color: "from-[#3B82F6] to-[#8B5CF6]",
  },
  {
    icon: Shield,
    title: "100% ATS Compatible",
    description: "Pass all applicant tracking systems with our AI-optimized formatting and keywords.",
    color: "from-[#10B981] to-[#2DD4BF]",
  },
  {
    icon: Zap,
    title: "Real-Time Optimization",
    description: "Get instant suggestions and improvements as you build your resume with AI assistance.",
    color: "from-[#F59E0B] to-[#EF4444]",
  },
  {
    icon: Award,
    title: "Proven Results",
    description: "Join 50,000+ successful job seekers who landed their dream jobs using our platform.",
    color: "from-[#EC4899] to-[#A855F7]",
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: "12%" }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <span className="text-white/70">BENEFITS</span>
          </div>
          <h2 className="mb-4 text-white">
            Why Choose Us
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Discover why thousands of job seekers trust our AI-powered platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.06,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              viewport={{ once: true, margin: "12%" }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2 },
              }}
            >
              <Card className="group relative overflow-hidden bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-white/[0.16] transition-all duration-300 p-8 h-full">
                {/* Gradient glow on hover */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${benefit.color} blur-2xl -z-10`}
                  style={{ filter: "blur(40px)" }}
                />

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6`}>
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="mb-3 text-white">{benefit.title}</h3>
                <p className="text-white/60">{benefit.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
