import { motion } from "motion/react";
import { ArrowLeft, Mail, Flag, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export function GrievanceOfficerPage() {
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
              <Flag className="w-8 h-8 text-teal-600" />
              <h1 className="text-4xl font-bold text-gray-900">Grievance Officer</h1>
            </div>
            <p className="text-gray-600">Contact information for the Grievance Officer as per Indian compliance requirements</p>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <p className="text-gray-700 mb-6">
              In compliance with the Information Technology Act, 2000 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, CVSaathi has designated a Grievance Officer to address your concerns and complaints.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Contact Information</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Grievance Officer</h3>
                    <a href="mailto:grievance@cvsaathi.com" className="text-teal-600 hover:underline text-lg font-semibold">
                      grievance@cvsaathi.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Data Protection Officer (India)</h3>
                    <a href="mailto:dpo-india@cvsaathi.com" className="text-teal-600 hover:underline text-lg font-semibold">
                      dpo-india@cvsaathi.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Response Time */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Response Time Commitment
            </h2>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
              <p className="text-gray-700">
                We strive to respond to all privacy inquiries and grievances within <strong>30 days</strong> as required by Indian regulations.
              </p>
            </div>
          </section>

          {/* How to File a Grievance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">How to File a Grievance</h2>
            <p className="text-gray-700 mb-4">To file a grievance or complaint, please:</p>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
              <li>Send an email to <a href="mailto:grievance@cvsaathi.com" className="text-teal-600 hover:underline font-semibold">grievance@cvsaathi.com</a></li>
              <li>Include your name, contact information, and a detailed description of your grievance</li>
              <li>Provide any relevant documentation or evidence</li>
              <li>We will acknowledge your grievance within 48 hours and respond within 30 days</li>
            </ol>
          </section>

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

