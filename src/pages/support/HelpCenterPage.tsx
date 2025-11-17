import { motion } from "motion/react";
import { ArrowLeft, HelpCircle, Search, Book, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export function HelpCenterPage() {
  const helpCategories = [
    {
      icon: Book,
      title: "Getting Started",
      items: [
        "How to create your first resume",
        "Setting up your profile",
        "Understanding Estel AI Coach",
      ],
    },
    {
      icon: MessageSquare,
      title: "Using Features",
      items: [
        "Resume Builder guide",
        "Interview Prep tips",
        "ATS Checker explained",
        "Skill Gap Analysis",
      ],
    },
    {
      icon: HelpCircle,
      title: "Account & Billing",
      items: [
        "Subscription plans",
        "Payment questions",
        "Account settings",
        "Data management",
      ],
    },
  ];

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
              <HelpCircle className="w-8 h-8 text-teal-600" />
              <h1 className="text-4xl font-bold text-gray-900">Help Center</h1>
            </div>
            <p className="text-gray-600">Find answers to common questions and learn how to use CVSaathi effectively</p>
          </div>

          {/* Search */}
          <div className="mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Help Categories */}
          <div className="space-y-6 mb-12">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                  </div>
                  <ul className="space-y-2 ml-14">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-700">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Contact Support */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-gray-700 mb-4">
              Our support team is here to help you. Contact us and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@cvsaathi.com"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Support
            </a>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links:</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/#faq" className="text-teal-600 hover:text-teal-700">
                FAQ →
              </Link>
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

