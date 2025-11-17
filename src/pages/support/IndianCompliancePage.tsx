import { motion } from "motion/react";
import { ArrowLeft, Flag, Shield, CreditCard, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function IndianCompliancePage() {
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
              <h1 className="text-4xl font-bold text-gray-900">Indian Privacy Compliance</h1>
            </div>
            <p className="text-gray-600">Compliance with Indian data protection and digital payment regulations</p>
          </div>

          {/* DPDP Act 2023 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Digital Personal Data Protection Act 2023</h2>
            <p className="text-gray-700 mb-4">
              CVSaathi complies with the Digital Personal Data Protection Act 2023 (DPDP Act), India's comprehensive data protection law.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Data Processing:</strong> We process personal data lawfully and transparently</li>
              <li><strong>User Rights:</strong> You have rights to access, correct, and erase your data</li>
              <li><strong>Data Localization:</strong> We store data securely within India</li>
              <li><strong>Consent Management:</strong> Clear consent mechanisms for data collection</li>
              <li><strong>Data Minimization:</strong> We collect only necessary data</li>
            </ul>
          </section>

          {/* IT Act 2000 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Information Technology Act 2000</h2>
            <p className="text-gray-700 mb-4">We comply with the IT Act 2000 and its amendments:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Secure Data Handling:</strong> Industry-standard encryption and security</li>
              <li><strong>Grievance Redressal:</strong> Designated Grievance Officer</li>
              <li><strong>Data Breach Notification:</strong> Prompt notification of any breaches</li>
              <li><strong>Reasonable Security Practices:</strong> Following prescribed standards</li>
            </ul>
          </section>

          {/* RBI Guidelines */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">RBI Guidelines for Digital Payments</h2>
            <p className="text-gray-700 mb-4">For payment processing, we follow RBI guidelines:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Secure Payment Processing:</strong> PCI DSS compliant systems</li>
              <li><strong>Data Encryption:</strong> End-to-end encryption for financial data</li>
              <li><strong>Audit Trails:</strong> Complete transaction logging</li>
              <li><strong>Fraud Prevention:</strong> Advanced fraud detection systems</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Contact Information</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Grievance Officer</p>
                  <a href="mailto:grievance@cvsaathi.com" className="text-teal-600 hover:underline font-semibold">
                    grievance@cvsaathi.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Data Protection Officer</p>
                  <a href="mailto:dpo-india@cvsaathi.com" className="text-teal-600 hover:underline font-semibold">
                    dpo-india@cvsaathi.com
                  </a>
                </div>
              </div>
            </div>
          </section>

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
              <Link to="/support/grievance-officer" className="text-teal-600 hover:text-teal-700">
                Grievance Officer →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

