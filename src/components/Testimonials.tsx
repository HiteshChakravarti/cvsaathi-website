import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    city: "Bangalore",
    content: "Got 5 interview calls in just 2 weeks! The city-specific optimization really works. My resume was perfectly tailored for Bangalore's tech scene.",
    rating: 5,
    initials: "PS",
  },
  {
    name: "Rahul Verma",
    role: "Marketing Manager",
    city: "Mumbai",
    content: "The AI understood exactly what Mumbai companies look for. Landed my dream job at a Fortune 500 company. Best investment ever!",
    rating: 5,
    initials: "RV",
  },
  {
    name: "Ananya Patel",
    role: "Data Analyst",
    city: "Pune",
    content: "As a fresher, I was struggling with my resume. This tool helped me create a professional resume that got noticed by top companies in Pune.",
    rating: 5,
    initials: "AP",
  },
  {
    name: "Karthik Reddy",
    role: "Product Designer",
    city: "Hyderabad",
    content: "The templates are modern and ATS-friendly. I love how it optimized my resume for Hyderabad's growing startup ecosystem.",
    rating: 5,
    initials: "KR",
  },
  {
    name: "Sneha Gupta",
    role: "Business Analyst",
    city: "Delhi NCR",
    content: "Switched careers successfully thanks to this platform. The AI helped me highlight transferable skills perfectly for Delhi's job market.",
    rating: 5,
    initials: "SG",
  },
  {
    name: "Aditya Kumar",
    role: "DevOps Engineer",
    city: "Chennai",
    content: "The city-smart feature is a game changer. It knows what Chennai tech companies want and optimizes accordingly. Highly recommend!",
    rating: 5,
    initials: "AK",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="mb-4 text-white">
            Loved by Job Seekers Across India
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Join thousands who landed their dream jobs with our AI-powered platform
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all p-6 h-full">
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-white/80 mb-6 relative z-10">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500">
                    <AvatarFallback className="bg-transparent text-white">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white">{testimonial.name}</div>
                    <div className="text-white/50">
                      {testimonial.role} • {testimonial.city}
                    </div>
                  </div>
                </div>

                {/* Gradient hover effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-purple-500/5 to-blue-500/5 -z-10" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
