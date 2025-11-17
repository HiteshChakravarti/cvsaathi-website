import { motion } from "motion/react";
import { ArrowLeft, Globe, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

export function GlobalCompliancePage() {
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
              <Globe className="w-8 h-8 text-teal-600" />
              <h1 className="text-4xl font-bold text-gray-900">Global Privacy Laws</h1>
            </div>
            <p className="text-gray-600">Compliance with international privacy regulations</p>
          </div>

          {/* GDPR */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">GDPR (European Union)</h2>
            <p className="text-gray-700 mb-4">We comply with the General Data Protection Regulation:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Lawful Basis:</strong> Clear legal basis for data processing</li>
              <li><strong>Data Subject Rights:</strong> Access, rectification, erasure, portability</li>
              <li><strong>Privacy by Design:</strong> Built-in privacy protections</li>
              <li><strong>Data Protection Impact Assessments:</strong> Regular privacy assessments</li>
              <li><strong>Data Protection Officer:</strong> Dedicated DPO for EU users</li>
            </ul>
          </section>

          {/* CCPA */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">CCPA (California, USA)</h2>
            <p className="text-gray-700 mb-4">We comply with the California Consumer Privacy Act:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Right to Know:</strong> Transparent data collection practices</li>
              <li><strong>Right to Delete:</strong> Consumer deletion requests</li>
              <li><strong>Right to Opt-Out:</strong> Sale of personal information</li>
              <li><strong>Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
              <li><strong>Authorized Agent:</strong> Third-party requests accepted</li>
            </ul>
          </section>

          {/* COPPA */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">COPPA (USA)</h2>
            <p className="text-gray-700 mb-4">We comply with Children's Online Privacy Protection Act:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Age Verification:</strong> We do not knowingly collect data from children under 13</li>
              <li><strong>Parental Consent:</strong> Required for any child data collection</li>
              <li><strong>Limited Data Collection:</strong> Minimal data collection from children</li>
              <li><strong>Secure Storage:</strong> Enhanced security for any child data</li>
            </ul>
          </section>

          {/* PIPEDA */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">PIPEDA (Canada)</h2>
            <p className="text-gray-700 mb-4">We comply with Canada's Personal Information Protection and Electronic Documents Act:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Consent:</strong> Meaningful consent for data collection</li>
              <li><strong>Purpose Limitation:</strong> Data used only for stated purposes</li>
              <li><strong>Individual Access:</strong> Right to access personal information</li>
              <li><strong>Safeguards:</strong> Appropriate security measures</li>
            </ul>
          </section>

          {/* Contact */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <p className="text-gray-700">
              For questions about global compliance: <a href="mailto:privacy@cvsaathi.com" className="text-teal-600 hover:underline font-semibold">privacy@cvsaathi.com</a>
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

