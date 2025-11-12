import { motion } from "motion/react";
import { Github, Twitter, Linkedin, Mail, MapPin } from "lucide-react";
import logoImage from "figma:asset/a1fa1e52b70bc90b456fc07ea39f8393a8febdc0.png";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Templates", href: "#templates" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ],
  resources: [
    { label: "Resume Guide", href: "#" },
    { label: "Cover Letter Tips", href: "#" },
    { label: "Interview Prep", href: "#" },
    { label: "Career Advice", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Logo */}
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src={logoImage} 
                  alt="CVSaathi" 
                  className="h-14 w-auto"
                />
                <span className="text-white text-2xl" style={{ fontWeight: 600 }}>CVSaathi</span>
              </div>

              <p className="text-gray-400 mb-6 max-w-sm">
                AI-Powered Career Growth Platform
              </p>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-400 mb-6">
                <MapPin className="w-4 h-4 text-teal-500" />
                <span>Made in India 🇮🇳</span>
              </div>

              {/* Social links */}
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-teal-500 hover:bg-teal-500/10 flex items-center justify-center transition-all group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white mb-4 capitalize">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-teal-500 transition-colors inline-block hover:translate-x-1 duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-12 mb-12"
        >
          <div className="max-w-2xl">
            <h4 className="text-white mb-3">
              Stay updated with career tips
            </h4>
            <p className="text-gray-400 mb-6">
              Get weekly resume tips, job search strategies, and career advice delivered to your inbox.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 text-sm">
            © 2024 CVSaathi. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">
              Cookies
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
    </footer>
  );
}