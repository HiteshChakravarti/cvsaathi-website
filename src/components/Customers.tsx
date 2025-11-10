import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    company: "Tech Startup, Bangalore",
    content: "Got 5 interview calls in just 2 weeks! The city-specific optimization really works. My resume was perfectly tailored for Bangalore's tech scene.",
    rating: 5,
    initials: "PS",
    gradient: "from-[#2DD4BF] to-[#3B82F6]",
  },
  {
    name: "Rahul Verma",
    role: "Marketing Manager",
    company: "MNC, Mumbai",
    content: "The AI understood exactly what Mumbai companies look for. Landed my dream job at a Fortune 500 company. Best investment ever!",
    rating: 5,
    initials: "RV",
    gradient: "from-[#A855F7] to-[#EC4899]",
  },
  {
    name: "Ananya Patel",
    role: "Data Analyst",
    company: "Consulting Firm, Pune",
    content: "As a fresher, I was struggling with my resume. This tool helped me create a professional resume that got noticed by top companies.",
    rating: 5,
    initials: "AP",
    gradient: "from-[#3B82F6] to-[#8B5CF6]",
  },
  {
    name: "Karthik Reddy",
    role: "Product Designer",
    company: "Startup, Hyderabad",
    content: "The templates are modern and ATS-friendly. I love how it optimized my resume for Hyderabad's growing startup ecosystem.",
    rating: 5,
    initials: "KR",
    gradient: "from-[#10B981] to-[#2DD4BF]",
  },
];

export function Customers() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <section id="customers" className="py-32 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0C0E18] via-[#1a1d2e]/30 to-[#0C0E18]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: "12%" }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <span className="text-white/70">CUSTOMERS</span>
          </div>
          <h2 className="mb-4 text-white">
            What Our Clients Say
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Join thousands of satisfied job seekers who transformed their careers
          </p>
        </motion.div>

        {/* Testimonial Slider */}
        <div className="max-w-4xl mx-auto">
          <div className="relative min-h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-12 relative">
                  <Quote className="absolute top-8 right-8 w-16 h-16 text-white/5" />

                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(current.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-white/90 mb-8 relative z-10">
                    "{current.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <Avatar className={`w-14 h-14 bg-gradient-to-br ${current.gradient}`}>
                      <AvatarFallback className="bg-transparent text-white">
                        {current.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white">{current.name}</div>
                      <div className="text-white/50">
                        {current.role}
                      </div>
                      <div className="text-white/40">
                        {current.company}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6]"
                    : "bg-white/20"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Additional testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              viewport={{ once: true, margin: "12%" }}
              className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              <p className="text-white/70 mb-4 line-clamp-3">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <Avatar className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient}`}>
                  <AvatarFallback className="bg-transparent text-white">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white">{testimonial.name}</div>
                  <div className="text-white/50">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
