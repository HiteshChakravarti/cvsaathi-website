import { motion } from "motion/react";
import { ArrowLeft, Clock, Database, CreditCard, MessageSquare, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export function DataRetentionPage() {
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
              <Clock className="w-8 h-8 text-teal-600" />
              <h1 className="text-4xl font-bold text-gray-900">Data Retention Policy</h1>
            </div>
            <p className="text-gray-600">How long we keep your information</p>
          </div>

          {/* Account Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6" />
              Account Data
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Profile Information:</strong> Retained while account is active</li>
              <li><strong>Login Credentials:</strong> Retained until account deletion</li>
              <li><strong>Preferences:</strong> Retained while account is active</li>
              <li><strong>Contact Information:</strong> Retained while account is active</li>
            </ul>
          </section>

          {/* Resume & Career Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Resume & Career Data</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Resume Content:</strong> Retained while account is active</li>
              <li><strong>Interview Sessions:</strong> Retained for 2 years after the last session</li>
              <li><strong>Skill Analyses:</strong> Retained for 3 years for improvement tracking</li>
              <li><strong>Career Goals:</strong> Retained while account is active</li>
            </ul>
          </section>

          {/* Usage Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Usage Data</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Website Usage Logs:</strong> Retained for 1 year for analytics</li>
              <li><strong>Performance Data:</strong> Retained for 6 months</li>
              <li><strong>Error Logs:</strong> Retained for 3 months</li>
              <li><strong>Analytics Data:</strong> Aggregated and anonymized after 1 year</li>
            </ul>
          </section>

          {/* Payment Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Payment Data
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Transaction Records:</strong> Retained for 7 years (legal requirement)</li>
              <li><strong>Payment Methods:</strong> Retained while subscription is active</li>
              <li><strong>Billing History:</strong> Retained for 7 years</li>
              <li><strong>Refund Records:</strong> Retained for 7 years</li>
            </ul>
          </section>

          {/* Communication Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Communication Data
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Support Tickets:</strong> Retained for 2 years after resolution</li>
              <li><strong>Feedback:</strong> Retained for 3 years for product improvement</li>
              <li><strong>Marketing Communications:</strong> Retained until opt-out</li>
              <li><strong>Legal Communications:</strong> Retained for 7 years</li>
            </ul>
          </section>

          {/* Automatic Deletion */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              Automatic Deletion
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Inactive Accounts:</strong> Data deleted after 3 years of inactivity</li>
              <li><strong>Account Deletion:</strong> All data permanently deleted within 30 days of account deletion</li>
              <li><strong>Retention Expiry:</strong> Automatic deletion occurs when the retention period ends</li>
              <li><strong>Legal Hold:</strong> Some data may be retained longer if legally required</li>
            </ul>
          </section>

          {/* Contact */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <p className="text-gray-700">
              Questions about data retention? Contact: <a href="mailto:cvsaathicustomercare@gmail.com" className="text-teal-600 hover:underline font-semibold">cvsaathicustomercare@gmail.com</a>
            </p>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information:</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/support/privacy-policy" className="text-teal-600 hover:text-teal-700">
                Privacy Policy →
              </Link>
              <Link to="/support/data-rights" className="text-teal-600 hover:text-teal-700">
                Your Data Rights →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

