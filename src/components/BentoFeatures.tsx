import { motion } from "motion/react";
import { Brain, MapPin, Zap, Target, Shield, Sparkles, TrendingUp, FileCheck } from "lucide-react";
import { Card } from "./ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Advanced AI analyzes job descriptions and optimizes your resume for maximum impact.",
    gradient: "from-purple-500/10 to-pink-500/10",
    borderGradient: "from-purple-500/50 to-pink-500/50",
    large: true,
  },
  {
    icon: MapPin,
    title: "City-Smart",
    description: "Tailored for local job markets across India.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    borderGradient: "from-blue-500/50 to-cyan-500/50",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Create resumes in minutes, not hours.",
    gradient: "from-yellow-500/10 to-orange-500/10",
    borderGradient: "from-yellow-500/50 to-orange-500/50",
  },
  {
    icon: FileCheck,
    title: "ATS-Optimized",
    description: "Pass all applicant tracking systems effortlessly.",
    gradient: "from-green-500/10 to-emerald-500/10",
    borderGradient: "from-green-500/50 to-emerald-500/50",
    large: true,
  },
  {
    icon: Target,
    title: "Role-Specific",
    description: "Templates for every industry and position.",
    gradient: "from-red-500/10 to-pink-500/10",
    borderGradient: "from-red-500/50 to-pink-500/50",
  },
  {
    icon: TrendingUp,
    title: "3x More Callbacks",
    description: "Data-proven results from real users.",
    gradient: "from-purple-500/10 to-blue-500/10",
    borderGradient: "from-purple-500/50 to-blue-500/50",
  },
];

export function BentoFeatures() {
  return (
    <section id="features" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-white/70">Features</span>
          </div>
          <h2 className="mb-4 text-white">
            Everything You Need to Stand Out
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Powered by cutting-edge AI technology designed for the Indian job market
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={feature.large ? "lg:col-span-2 lg:row-span-1" : ""}
            >
              <Card
                className={`group relative overflow-hidden bg-gradient-to-br ${feature.gradient} backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all h-full p-8`}
              >
                {/* Gradient border effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${feature.borderGradient} blur-xl -z-10`} />
                
                <div className={`flex ${feature.large ? 'flex-col md:flex-row gap-8 items-start md:items-center' : 'flex-col'}`}>
                  <div className={`${feature.large ? 'flex-shrink-0' : ''}`}>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <div className={feature.large ? 'flex-1' : ''}>
                    <h3 className="mb-2 text-white">{feature.title}</h3>
                    <p className="text-white/60">{feature.description}</p>
                  </div>
                </div>

                {/* Decorative elements for large cards */}
                {feature.large && (
                  <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
