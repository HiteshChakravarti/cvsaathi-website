import { motion } from "motion/react";
import { ArrowLeft, AlertTriangle, FileText, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function TermsOfServicePage() {
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <div className="flex flex-col sm:flex-row gap-4 text-gray-600">
              <p>Effective Date: <span className="font-semibold text-gray-900">January 1, 2025</span></p>
              <p>Last Updated: <span className="font-semibold text-gray-900">January 1, 2025</span></p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing or using CVSaathi website ("the Website"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Website.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">CVSaathi is a career development platform that provides:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Resume building and optimization tools</li>
              <li>AI-powered interview preparation</li>
              <li>Skill gap analysis and career guidance</li>
              <li>Professional development resources</li>
              <li>ATS (Applicant Tracking System) compatibility checking</li>
            </ul>
            <p className="text-gray-700 mt-4">
              CVSaathi provides career guidance tools including resume building, interview preparation, ATS optimization, and AI-powered career coaching. Our services are designed for educational and informational purposes.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">3. AI Career Guidance Disclaimer</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-700">
                    Our AI Career Companion provides general career guidance and educational information only. It does not constitute professional legal, financial, medical, or career counseling advice. Users should consult qualified professionals for specific legal, financial, or medical matters.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">4. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">You agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide accurate and truthful information</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to reverse engineer or hack the Website</li>
              <li>Respect intellectual property rights</li>
              <li>Maintain the security of your account</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Users are responsible for the accuracy of information provided. Users should verify all career advice independently. Users must not rely solely on AI guidance for critical decisions. Users should consult professionals for specific legal/financial matters.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">5. Limitations of Liability</h2>
            <p className="text-gray-700 mb-4">CVSaathi is provided "as is" without warranties. We are not liable for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of data or business opportunities</li>
              <li>Service interruptions or technical issues</li>
              <li>Third-party content or services</li>
            </ul>
            <p className="text-gray-700 mt-4">
              CVSaathi is not liable for any decisions made based on our AI guidance. We provide educational tools but cannot guarantee career outcomes. Users accept all risks associated with following AI-generated advice.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">6. Subscription and Payment</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Free Plan:</strong> Basic features available at no cost</li>
              <li><strong>Premium Plans:</strong> Advanced features require paid subscription</li>
              <li><strong>Payment Processing:</strong> Secure payment via Razorpay</li>
              <li><strong>Billing:</strong> Monthly or yearly billing cycles</li>
              <li><strong>Refunds:</strong> Subject to our refund policy</li>
              <li><strong>Auto-renewal:</strong> Subscriptions auto-renew unless cancelled</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">7. Intellectual Property</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Website Content:</strong> CVSaathi owns all rights to the Website and its content</li>
              <li><strong>User Content:</strong> You retain rights to content you create</li>
              <li><strong>License:</strong> We grant you a limited license to use the Website</li>
              <li><strong>Restrictions:</strong> You may not copy, modify, or distribute the Website</li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
              <p className="text-sm text-amber-800">
                <strong>Platform Protection:</strong> While your content belongs to you, our platform's underlying technology and proprietary algorithms are protected intellectual property.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">8. Privacy and Data</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Privacy Policy:</strong> Your privacy is governed by our <Link to="/support/privacy-policy" className="text-teal-600 hover:underline">Privacy Policy</Link></li>
              <li><strong>Data Collection:</strong> We collect data as described in our Privacy Policy</li>
              <li><strong>Data Security:</strong> We implement industry-standard security measures</li>
              <li><strong>Data Rights:</strong> You have rights to access, correct, and delete your data</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We collect and process user data to provide our services. Personal information is protected according to our Privacy Policy. AI interactions are used to improve service quality while maintaining user privacy.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">9. Acceptable Use</h2>
            <p className="text-gray-700">
              Users must not use our services for illegal purposes or to provide false information. We reserve the right to terminate access for violations of these terms.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">10. Service Availability</h2>
            <p className="text-gray-700">
              We strive to maintain service availability but cannot guarantee uninterrupted access. We may update or modify services with reasonable notice to users.
            </p>
          </section>

          {/* Section 11 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">11. Termination</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>User Termination:</strong> You may delete your account at any time</li>
              <li><strong>Service Termination:</strong> We may terminate service for violations</li>
              <li><strong>Data Deletion:</strong> Data deleted according to our retention policy</li>
              <li><strong>Effect of Termination:</strong> Access to service ends immediately</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">12. Changes to Terms</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Updates:</strong> We may update these terms from time to time</li>
              <li><strong>Notification:</strong> Users will be notified of significant changes</li>
              <li><strong>Continued Use:</strong> Continued use constitutes acceptance of changes</li>
              <li><strong>Effective Date:</strong> Changes take effect as specified in the update</li>
            </ul>
          </section>

          {/* Section 13 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">13. Contact Information</h2>
            <p className="text-gray-700 mb-4">For questions about these Terms of Service:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Email:</strong> <a href="mailto:legal@cvsaathi.com" className="text-teal-600 hover:underline">legal@cvsaathi.com</a></li>
              <li><strong>Support:</strong> <a href="mailto:support@cvsaathi.com" className="text-teal-600 hover:underline">support@cvsaathi.com</a></li>
              <li><strong>Website:</strong> <a href="https://www.cvsaathi.com" className="text-teal-600 hover:underline">www.cvsaathi.com</a></li>
            </ul>
          </section>

          {/* Acknowledgment */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
            <p className="text-gray-700">
              <strong>By using CVSaathi, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

