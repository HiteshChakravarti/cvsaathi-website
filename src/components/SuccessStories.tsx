import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";
import { Avatar } from "./ui/avatar";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    quote: "CVSaathi's AI helped me optimize my resume. Within 2 weeks, I had interviews at top tech companies. The ATS score feature was a game-changer!",
    rating: 5,
    company: "Google",
  },
  {
    name: "Rahul Verma",
    role: "Product Manager at Microsoft",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    quote: "The templates are professional and the AI suggestions improved my content significantly. Landed my dream job in just 3 weeks!",
    rating: 5,
    company: "Microsoft",
  },
  {
    name: "Ananya Patel",
    role: "Marketing Lead at Amazon",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    quote: "As a fresh graduate, I was struggling with my resume. CVSaathi made it so easy! The expert tips and beautiful templates helped me stand out.",
    rating: 5,
    company: "Amazon",
  },
];

export function SuccessStories() {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-gradient-to-br from-white via-teal-50/30 to-white">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />

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
            <Star className="w-4 h-4 text-teal-600" />
            <span className="text-teal-700 uppercase tracking-wider">Success Stories</span>
          </motion.div>
          <h2 className="text-gray-900 mb-6">
            Real stories from real job seekers
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who transformed their careers with CVSaathi
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 hover:border-teal-300 transition-all duration-300 h-full flex flex-col">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/0 to-cyan-500/0 group-hover:from-teal-500/5 group-hover:to-cyan-500/5 transition-all duration-300" />

                {/* Quote Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                  className="relative mb-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center group-hover:from-teal-500 group-hover:to-cyan-500 transition-all duration-300">
                    <Quote className="w-7 h-7 text-teal-600 group-hover:text-white transition-colors" />
                  </div>
                </motion.div>

                {/* Quote */}
                <blockquote className="relative text-gray-700 mb-6 flex-grow italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4 relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-teal-100 group-hover:ring-teal-300 transition-all">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-gray-900">
                      {testimonial.name}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Company Badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="absolute top-8 right-8"
                >
                  <div className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200 text-sm">
                    {testimonial.company}
                  </div>
                </motion.div>
              </div>

              {/* Decorative corner */}
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full blur-2xl group-hover:from-teal-500/40 group-hover:to-cyan-500/40 transition-all duration-300" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6">
            Join <span className="text-teal-600">50,000+ satisfied users</span> and write your success story
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 transition-all"
          >
            Start Your Success Story
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}