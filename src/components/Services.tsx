import { motion } from "motion/react";
import { Globe, Languages, Briefcase, GraduationCap, TrendingUp, Users } from "lucide-react";
import { Card } from "./ui/card";

const services = [
  {
    icon: Globe,
    title: "Multi-City Optimization",
    description: "Tailored resumes for major Indian cities including Bangalore, Mumbai, Delhi, Pune, Hyderabad, and Chennai.",
    gradient: "from-[#2DD4BF] to-[#3B82F6]",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    description: "Create resumes in English and Hindi with AI-powered translation and localization.",
    gradient: "from-[#A855F7] to-[#EC4899]",
  },
  {
    icon: Briefcase,
    title: "Industry Templates",
    description: "Specialized templates for IT, Finance, Healthcare, Marketing, Sales, and more industries.",
    gradient: "from-[#3B82F6] to-[#8B5CF6]",
  },
  {
    icon: GraduationCap,
    title: "Career Level Support",
    description: "Templates and guidance for freshers, experienced professionals, and career changers.",
    gradient: "from-[#10B981] to-[#2DD4BF]",
  },
  {
    icon: TrendingUp,
    title: "Salary Insights",
    description: "Get city-specific salary benchmarks and negotiation tips based on your role and experience.",
    gradient: "from-[#F59E0B] to-[#EF4444]",
  },
  {
    icon: Users,
    title: "Interview Coaching",
    description: "AI-powered interview preparation with common questions and best practices for your industry.",
    gradient: "from-[#EC4899] to-[#A855F7]",
  },
];

export function Services() {
  return (
    <section id="services" className="py-32 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0C0E18] via-[#1a1d2e]/50 to-[#0C0E18]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: "12%" }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <span className="text-white/70">SERVICES</span>
          </div>
          <h2 className="mb-4 text-white">
            Our AI-Driven Services
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Comprehensive career tools powered by artificial intelligence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
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
                rotateX: 2,
                rotateY: -2,
                scale: 1.01,
                transition: { duration: 0.2 },
              }}
              style={{ perspective: 1000 }}
            >
              <Card className="group relative overflow-hidden bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-white/[0.16] transition-all duration-300 p-8 h-full">
                {/* Subtle gradient glow */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${service.gradient}`}
                  style={{ filter: "blur(60px)", opacity: 0.15 }}
                />

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="mb-3 text-white">{service.title}</h3>
                  <p className="text-white/60">{service.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
