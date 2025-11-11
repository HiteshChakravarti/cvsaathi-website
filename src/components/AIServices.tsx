import { motion } from "motion/react";
import { BarChart3, Pen, MessageCircle, BookOpen, Settings, Triangle } from "lucide-react";

const services = [
  {
    id: 1,
    icon: BarChart3,
    title: "AI Strategy Consulting",
    description: "Get expert guidance to implement AI solutions that drive business growth",
    hasUI: false,
    floatingIcons: [BarChart3],
  },
  {
    id: 2,
    icon: Pen,
    title: "Content Generation",
    description: "We provide seamless content creation solutions that generate captivating, high-quality content in line with your brand's voice.",
    hasUI: true,
    large: true,
    floatingIcons: [Pen],
  },
  {
    id: 3,
    icon: MessageCircle,
    title: "AI-Powered Chatbots",
    description: "We develop AI-driven chatbots with advanced cognitive technologies to elevate customer support and automate business operations.",
    hasUI: true,
    largeBottom: true,
    floatingIcons: [MessageCircle],
  },
  {
    id: 4,
    icon: Settings,
    title: "Automated Workflows",
    description: "Automate workflows to streamline tasks, boost efficiency, and save time",
    hasUI: false,
    floatingIcons: [BookOpen, Pen, Settings, Triangle],
  },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden p-8"
    >
      {/* Floating icons */}
      <div className="relative mb-6">
        {service.id === 1 && (
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-xl"
          >
            <BarChart3 className="w-8 h-8 text-white" />
          </motion.div>
        )}

        {service.id === 2 && (
          <div className="flex gap-4">
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-xl"
            >
              <Pen className="w-7 h-7 text-white" />
            </motion.div>
          </div>
        )}

        {service.id === 3 && (
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-xl"
          >
            <MessageCircle className="w-8 h-8 text-white" />
          </motion.div>
        )}

        {service.id === 4 && (
          <div className="flex flex-wrap gap-3">
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
              className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg"
            >
              <Settings className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg"
            >
              <Pen className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg"
            >
              <BookOpen className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
              className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg"
            >
              <Triangle className="w-6 h-6 text-white" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Content Generation UI */}
      {service.id === 2 && (
        <div className="mb-6 bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              <span>Continue writing</span>
            </div>
            <div className="text-gray-600 text-sm">Fix spelling</div>
            <div className="text-gray-600 text-sm">Explain in detail</div>
          </div>
          <button className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors">
            Generate
          </button>
        </div>
      )}

      {/* Chatbot UI */}
      {service.id === 3 && (
        <div className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <input
            type="text"
            placeholder="Type a message"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            disabled
          />
        </div>
      )}

      {/* Title */}
      <h3 className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">
        {service.description}
      </p>

      {/* Subtle hover gradient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-50/0 to-gray-100/0 group-hover:from-gray-50/30 group-hover:to-gray-100/20 transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
}

export function AIServices() {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Subtle background decoration */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gray-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-100/40 rounded-full blur-3xl" />

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
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white border border-teal-200 rounded-full shadow-sm"
          >
            <Settings className="w-4 h-4 text-teal-600" />
            <span className="text-teal-600 uppercase tracking-wider text-sm">Services</span>
          </motion.div>

          <h2 className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Our AI-Driven Services
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Leverage AI features that boost performance to your business.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Strategy Consulting - Top left */}
          <div>
            <ServiceCard service={services[0]} index={0} />
          </div>

          {/* Content Generation - Top right (tall) */}
          <div className="md:row-span-2">
            <ServiceCard service={services[1]} index={1} />
          </div>

          {/* AI-Powered Chatbots - Bottom left (tall) */}
          <div className="md:row-span-2">
            <ServiceCard service={services[2]} index={2} />
          </div>

          {/* Automated Workflows - Bottom right */}
          <div>
            <ServiceCard service={services[3]} index={3} />
          </div>
        </div>
      </div>
    </section>
  );
}
