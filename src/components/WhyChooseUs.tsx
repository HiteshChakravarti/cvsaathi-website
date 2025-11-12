import { motion } from "motion/react";
import { BarChart3, TrendingUp, Users, Award } from "lucide-react";

const benefits = [
  {
    icon: BarChart3,
    title: "AI That Understands You",
    description: "CV Saathi isn't just smart — it's personalized. Our multilingual AI tailors every resume, career suggestion, and interview tip to your city, your industry, and your goals.",
    illustration: "chart",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Career Insights",
    description: "Track your growth instantly with live analytics and job-market signals — see which skills are trending and how your profile compares.",
    illustration: "growth",
    centerPiece: true,
  },
  {
    icon: Users,
    title: "AI-Driven Growth",
    description: "Every click helps you move forward. Our intelligent system learns from your progress to recommend better opportunities, faster.",
    illustration: "sync",
  },
];

function BenefitCard({ benefit, index }: { benefit: typeof benefits[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative"
    >
      <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 h-full border border-gray-100 hover:border-gray-200">
        {/* Illustration/Icon Area */}
        <div className="mb-6 relative h-48 flex items-center justify-center">
          {benefit.illustration === "chart" && (
            <motion.div 
              className="relative w-full h-full"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Chart visualization */}
              <div className="absolute inset-0 flex items-end justify-center gap-2">
                <motion.div
                  className="w-12 bg-gradient-to-t from-gray-200 to-gray-300 rounded-t-lg"
                  style={{ height: '40%' }}
                  whileHover={{ height: '50%', transition: { duration: 0.3 } }}
                />
                <motion.div
                  className="w-12 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg"
                  style={{ height: '60%' }}
                  whileHover={{ height: '70%', transition: { duration: 0.3 } }}
                />
                <motion.div
                  className="w-12 bg-gradient-to-t from-gray-200 to-gray-300 rounded-t-lg"
                  style={{ height: '50%' }}
                  whileHover={{ height: '60%', transition: { duration: 0.3 } }}
                />
                <motion.div
                  className="w-12 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg"
                  style={{ height: '70%' }}
                  whileHover={{ height: '80%', transition: { duration: 0.3 } }}
                />
              </div>
              {/* Animated dot */}
              <motion.div
                className="absolute top-8 right-12 w-3 h-3 bg-red-500 rounded-full shadow-lg"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          )}

          {benefit.illustration === "growth" && (
            <motion.div 
              className="relative w-full h-full"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Growth bars */}
              <div className="absolute inset-0 flex items-center justify-center gap-4">
                {/* Labels */}
                <div className="flex flex-col gap-6 text-xs text-gray-400">
                  <span>80% Automation</span>
                  <span>10% Cost</span>
                  <span className="text-gray-300">API</span>
                </div>
                
                {/* Bars */}
                <div className="flex gap-3">
                  {[60, 70, 80, 90].map((height, i) => (
                    <motion.div
                      key={i}
                      className="w-10 bg-gradient-to-t from-gray-200 to-gray-300 rounded-lg"
                      style={{ height: `${height}%` }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {benefit.illustration === "sync" && (
            <motion.div 
              className="relative w-full h-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Sync icons */}
              <div className="relative">
                <motion.div
                  className="w-24 h-24 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-gray-100"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                
                {/* User avatar */}
                <motion.div
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-4 border-white shadow-lg flex items-center justify-center"
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-gray-300" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Text content */}
        <div className="relative z-10">
          <h3 className="mb-3 transition-colors"
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {benefit.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {benefit.description}
          </p>
        </div>

        {/* Subtle hover gradient */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-50/0 to-gray-100/0 group-hover:from-gray-50/50 group-hover:to-gray-100/30 transition-all duration-500 pointer-events-none" />
      </div>
    </motion.div>
  );
}

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Subtle background decoration */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gray-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-100/50 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-6 bg-teal-50 border border-teal-200 rounded-full shadow-sm"
          >
            <Award className="w-4 h-4 text-teal-600" />
            <span className="text-teal-700 uppercase tracking-wider">Why Us</span>
          </motion.div>

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
            Why Choose Us
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Empowering every career dream with intelligent, human-first AI.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}