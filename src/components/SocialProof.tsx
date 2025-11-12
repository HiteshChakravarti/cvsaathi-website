import { motion } from "motion/react";
import { Users, Award, Star, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "50K+",
    label: "Active Users",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: Award,
    value: "95%",
    label: "Success Rate",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "User Rating",
    gradient: "from-teal-500 to-emerald-500",
  },
  {
    icon: TrendingUp,
    value: "10K+",
    label: "Jobs Landed",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export function SocialProof() {
  return (
    <section className="py-20 px-6 relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 
            className="mb-4"
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
            Trusted by thousands of job seekers
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto">
            Join professionals from leading companies who trust CVSaathi
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl">
                {/* Icon */}
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* Value */}
                <motion.div
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                  className="mb-2"
                >
                  <div className="text-white">
                    {stat.value}
                  </div>
                </motion.div>

                {/* Label */}
                <p className="text-white/80">
                  {stat.label}
                </p>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-transparent transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-white/90">
            Join <span className="text-white px-2 py-1 bg-white/20 rounded-lg backdrop-blur-sm">50,000+</span> professionals already using CVSaathi
          </p>
        </motion.div>
      </div>
    </section>
  );
}