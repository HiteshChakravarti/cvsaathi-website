import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot } from "lucide-react";
import { Button } from "./ui/button";
const heroBanner = "/ESHA HERO BANNERS.png";

export function EstelCompanion() {
  return (
    <section className="py-20 bg-white" id="estel">
      <div className="max-w-7xl mx-auto">
        {/* Full-width banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="w-full mb-16"
        >
          <img
          src={heroBanner}
            alt="Estel AI Career Companion"
            className="w-full h-auto object-cover rounded-3xl"
          />
        </motion.div>

        {/* Content below banner */}
        <div className="px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8 text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 mb-6 bg-teal-50 border border-teal-200 rounded-full shadow-sm"
            >
              <Bot className="w-4 h-4 text-teal-600" />
              <span className="text-teal-700 uppercase tracking-wider">AI Companion</span>
            </motion.div>

            {/* Heading and content */}
            <div className="space-y-8">
              <h2
                className="text-gray-900 text-center"
                style={{
                  fontSize: '3rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Estel</span> — Your AI Career Companion
              </h2>
              
              <div className="space-y-6 leading-relaxed max-w-3xl mx-auto">
                <p
                  className="text-gray-900"
                  style={{
                    fontSize: '1.25rem',
                    lineHeight: 1.7,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>More than an assistant</span> — Estel is your personal guide to every stage of your professional journey.
                </p>
                
                <p className="text-gray-700" style={{ fontSize: '1.125rem', lineHeight: 1.8 }}>
                  Trained on thousands of real-world resumes, interviews, and career success patterns, Estel helps you craft job-winning profiles, analyze skill gaps, and prepare confidently for interviews — all through a single, intuitive experience.
                </p>
                
                <p className="text-gray-700" style={{ fontSize: '1.125rem', lineHeight: 1.8 }}>
                  While others juggle multiple tools for resumes, coaching, and learning, Estel brings everything together. She understands your goals, speaks your language, and offers personalized advice that evolves with you.
                </p>
                
                <p className="text-gray-700" style={{ fontSize: '1.125rem', lineHeight: 1.8 }}>
                  With Estel by your side, your career growth is no longer guesswork — it's guided by intelligence, empathy, and experience.
                </p>
                
                <p
                  className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 pt-4"
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    lineHeight: 1.6,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Build smarter. Learn faster. Grow with Estel.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="pt-4"
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link to="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2 shadow-xl px-8 rounded-xl"
                    style={{ fontSize: '1rem', fontWeight: 600, padding: '1.25rem 2rem' }}
                  >
                    Start Chatting with Estel
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}