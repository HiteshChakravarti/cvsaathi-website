import { motion } from "motion/react";
import { Twitter, Linkedin, Mail, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../../Assets/Logo.png";

// Updated footer links structure
const footerLinks = {
  cvsaathi: {
    title: "CVSaathi",
    links: [
      { label: "Overview", href: "/cvsaathi/overview" },
      { label: "Features", href: "/cvsaathi/features" },
      { label: "Estel – AI Career Companion", href: "/cvsaathi/estel", highlight: true }, // Core feature
      { label: "Resume Builder", href: "/cvsaathi/resume-builder" },
      { label: "Interview Prep Coach", href: "/cvsaathi/interview-prep" },
      { label: "Skill Gap Analysis", href: "/cvsaathi/skill-gap-analysis" },
      { label: "ATS Score Checker", href: "/cvsaathi/ats-checker" },
      { label: "Pricing / Plans", href: "#pricing" },
      { label: "Download App", href: "/cvsaathi/download-app", comingSoon: true },
    ],
  },
  candidates: {
    title: "For Candidates",
    links: [
      { label: "For Students & Freshers", href: "/candidates/students-freshers" },
      { label: "For Tier-2 City Professionals", href: "/candidates/tier2-professionals" },
      { label: "Career Switch Toolkit", href: "/candidates/career-switch" },
      { label: "Back-to-Work After Career Break", href: "/candidates/back-to-work" },
      { label: "Govt & PSU Aspirants", href: "/candidates/govt-psu", comingSoon: true },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About CVSaathi", href: "/company/about" },
      { label: "Our Story & Mission", href: "/company/story-mission" },
      { label: "Join as Mentor / Career Coach", href: "/company/careers" },
      { label: "Partners & Colleges", href: "/company/partners", comingSoon: true },
      { label: "Contact Us", href: "/company/contact" },
    ],
  },
  support: {
    title: "Support & Legal",
    links: [
      { label: "Help Center", href: "/support/help-center" },
      { label: "FAQ", href: "#faq" },
      { label: "Data & Privacy Policy", href: "/support/privacy-policy" },
      { label: "Terms of Use", href: "/support/terms-of-use" },
      { label: "Cookie Policy", href: "/support/cookie-policy" },
      { label: "Refunds & Cancellations", href: "/support/refunds" },
      { label: "Grievance Officer", href: "/support/grievance-officer" },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "mailto:support@cvsaathi.com", label: "Email" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        {/* Main footer content - Brand + 4 columns all side by side */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 mb-12">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:w-64 flex-shrink-0"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={logoImage} 
                alt="CVSaathi" 
                className="h-14 w-auto opacity-80 mix-blend-screen"
              />
              <span className="text-white text-2xl" style={{ fontWeight: 600 }}>CVSaathi</span>
            </div>

            <p className="text-gray-400 mb-6 max-w-sm text-sm">
              AI-Powered Career Growth Platform. Empowering professionals with intelligent career tools.
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-400 mb-6 text-sm">
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

          {/* Links columns - 4 columns side by side */}
          <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-8 lg:gap-6 flex-1">
            {Object.entries(footerLinks).map(([key, section], categoryIndex) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="flex-1 min-w-[180px]"
              >
              <h4 className="text-white mb-4 font-semibold text-base">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, index) => {
                  const isHashLink = link.href.startsWith('#');
                  const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto:');
                  
                  return (
                    <li key={index} className="flex items-center gap-2">
                      {isHashLink ? (
                        <a
                          href={link.href}
                          className={`text-gray-400 hover:text-teal-500 transition-colors inline-block hover:translate-x-1 duration-200 text-sm ${
                            link.highlight ? 'font-medium text-teal-400' : ''
                          }`}
                        >
                          {link.label}
                          {link.comingSoon && (
                            <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>
                          )}
                        </a>
                      ) : isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-teal-500 transition-colors inline-flex items-center gap-1 hover:translate-x-1 duration-200 text-sm"
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className={`text-gray-400 hover:text-teal-500 transition-colors inline-block hover:translate-x-1 duration-200 text-sm ${
                            link.highlight ? 'font-medium text-teal-400' : ''
                          }`}
                        >
                          {link.label}
                          {link.comingSoon && (
                            <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>
                          )}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              </motion.div>
            ))}
          </div>
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
            <h4 className="text-white mb-3 text-lg font-semibold">
              Stay updated with career tips
            </h4>
            <p className="text-gray-400 mb-6 text-sm">
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
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all font-medium"
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
            © 2024 CVSaathi. All rights reserved. Made with ❤️ for Tier-2 India.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/support/privacy-policy" className="text-gray-400 hover:text-teal-500 transition-colors">
              Privacy
            </Link>
            <Link to="/support/terms-of-use" className="text-gray-400 hover:text-teal-500 transition-colors">
              Terms
            </Link>
            <Link to="/support/cookie-policy" className="text-gray-400 hover:text-teal-500 transition-colors">
              Cookies
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
    </footer>
  );
}
