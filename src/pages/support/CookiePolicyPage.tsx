import { motion } from "motion/react";
import { ArrowLeft, Cookie, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-12"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Cookie className="w-8 h-8 text-teal-600" />
              <h1 className="text-4xl font-bold text-gray-900">Cookie Policy</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 text-gray-600 justify-center">
              <p>Effective Date: <span className="font-semibold text-gray-900">January 1, 2025</span></p>
              <p>Last Updated: <span className="font-semibold text-gray-900">January 1, 2025</span></p>
            </div>
          </div>

          {/* What are Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">What are Cookies?</h2>
            <p className="text-gray-700">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our services.
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-700 text-sm">Required for the website to function properly. These cannot be disabled.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                <p className="text-gray-700 text-sm">Help us understand how visitors interact with our website to improve user experience.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Preference Cookies</h3>
                <p className="text-gray-700 text-sm">Remember your settings and preferences for a personalized experience.</p>
              </div>
            </div>
          </section>

          {/* How We Use Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">How We Use Cookies</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>To maintain your login session</li>
              <li>To remember your preferences and settings</li>
              <li>To analyze website traffic and usage patterns</li>
              <li>To improve our services and user experience</li>
            </ul>
          </section>

          {/* Managing Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Managing Cookies
            </h2>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies through your browser settings. However, disabling certain cookies may affect the functionality of our website.
            </p>
            <p className="text-gray-700">
              Most browsers allow you to refuse or accept cookies, delete existing cookies, or set preferences for cookie usage.
            </p>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              We may use third-party services that set cookies on your device. These services help us provide analytics and improve our services.
            </p>
            <p className="text-gray-700">
              These third-party cookies are subject to their respective privacy policies.
            </p>
          </section>

          {/* Contact */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <p className="text-gray-700">
              Questions about our Cookie Policy? Contact: <a href="mailto:privacy@cvsaathi.com" className="text-teal-600 hover:underline font-semibold">privacy@cvsaathi.com</a>
            </p>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information:</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/support/privacy-policy" className="text-teal-600 hover:text-teal-700">
                Privacy Policy →
              </Link>
              <Link to="/support/terms-of-use" className="text-teal-600 hover:text-teal-700">
                Terms of Use →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

