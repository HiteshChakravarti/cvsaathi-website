import { motion } from "motion/react";
import { ArrowLeft, Shield, Eye, Edit, Trash2, Download, Lock, Ban } from "lucide-react";
import { Link } from "react-router-dom";

export function DataRightsPage() {
  const rights = [
    {
      icon: Eye,
      title: "Right to Access",
      description: "You have the right to know what personal data we hold about you and how we use it. You can request a copy of your data at any time.",
    },
    {
      icon: Edit,
      title: "Right to Rectification",
      description: "You can ask us to correct any inaccurate or incomplete personal data we hold about you.",
    },
    {
      icon: Trash2,
      title: "Right to Erasure",
      description: "You have the right to request deletion of your personal data in certain circumstances (the \"right to be forgotten\").",
    },
    {
      icon: Download,
      title: "Right to Data Portability",
      description: "You can request a copy of your data in a structured, machine-readable format that you can transfer to another service.",
    },
    {
      icon: Lock,
      title: "Right to Restrict Processing",
      description: "You can ask us to limit how we use your personal data in certain circumstances.",
    },
    {
      icon: Ban,
      title: "Right to Object",
      description: "You can object to us processing your personal data for certain purposes, such as marketing.",
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
              <Shield className="w-8 h-8 text-teal-600" />
              <h1 className="text-4xl font-bold text-gray-900">Your Data Rights</h1>
            </div>
            <p className="text-gray-600">Your rights under GDPR & DPDP Act</p>
          </div>

          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Your Data Rights under GDPR & DPDP Act</h2>
            <p className="text-gray-700 mb-6">
              As a user of CVSaathi, you have specific rights regarding your personal data. These rights are protected under the General Data Protection Regulation (GDPR) for EU users and the Digital Personal Data Protection Act (DPDP Act) for Indian users.
            </p>
          </div>

          {/* Rights List */}
          <div className="space-y-6 mb-12">
            {rights.map((right, index) => {
              const Icon = right.icon;
              return (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {index + 1}. {right.title}
                      </h3>
                      <p className="text-gray-700">{right.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* How to Exercise Rights */}
          <section className="mb-12 bg-teal-50 border border-teal-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Exercise These Rights</h2>
            <p className="text-gray-700 mb-4">
              To exercise any of these rights, contact us at <a href="mailto:privacy@cvsaathi.com" className="text-teal-600 hover:underline font-semibold">privacy@cvsaathi.com</a> or use the following features on this website:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>"Download My Data"</strong> feature - Export all your data</li>
              <li><strong>"Delete Account"</strong> feature - Permanently delete your account and data</li>
            </ul>
          </section>

          {/* Response Time */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
            <p className="text-gray-700">
              <strong>Response Time:</strong> We strive to respond to all data rights requests within 30 days as required by GDPR and DPDP Act.
            </p>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information:</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/support/privacy-policy" className="text-teal-600 hover:text-teal-700">
                Privacy Policy →
              </Link>
              <Link to="/support/indian-compliance" className="text-teal-600 hover:text-teal-700">
                Indian Privacy Compliance →
              </Link>
              <Link to="/support/global-compliance" className="text-teal-600 hover:text-teal-700">
                Global Privacy Laws →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

