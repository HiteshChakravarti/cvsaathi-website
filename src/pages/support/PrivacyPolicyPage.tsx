import { motion } from "motion/react";
import { ArrowLeft, Shield, Lock, Globe, Mail, Flag } from "lucide-react";
import { Link } from "react-router-dom";

export function PrivacyPolicyPage() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy for CVSaathi</h1>
            <div className="flex flex-col sm:flex-row gap-4 text-gray-600">
              <p>Effective Date: <span className="font-semibold text-gray-900">January 1, 2025</span></p>
              <p>Last Updated: <span className="font-semibold text-gray-900">January 1, 2025</span></p>
            </div>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              CVSaathi ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website CVSaathi (the "Website") and related services.
            </p>
            <p className="text-gray-700">
              By using our Website, you consent to the data practices described in this Privacy Policy. If you do not agree with the practices described in this Privacy Policy, please do not use the Website.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Personal Information You Provide</h3>
            <p className="text-gray-700 mb-3">We collect information you voluntarily provide when using our Website:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li><strong>Account Information:</strong> Name, email address, phone number</li>
              <li><strong>Professional Information:</strong> Work history, education, skills, career goals</li>
              <li><strong>Resume Content:</strong> Personal details, work experience, education, projects, skills</li>
              <li><strong>Profile Data:</strong> Profile picture, professional summary, preferences</li>
              <li><strong>Communication Data:</strong> Messages with AI coach, feedback, support inquiries</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <p className="text-gray-700 mb-3">When you use our Website, we automatically collect:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers</li>
              <li><strong>Usage Data:</strong> Website features used, time spent, interaction patterns</li>
              <li><strong>Performance Data:</strong> Crash reports, error logs, website performance metrics</li>
              <li><strong>Location Data:</strong> General location (if permitted) for job market insights</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Camera and Microphone Data</h3>
            <p className="text-gray-700 mb-3">For video resume features:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li><strong>Video Recordings:</strong> Stored locally and optionally uploaded with your consent</li>
              <li><strong>Audio Recordings:</strong> Processed for video resume creation</li>
              <li><strong>Camera Access:</strong> Only when actively recording video resumes</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">3. How We Use Your Information</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Primary Purposes</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li><strong>Service Delivery:</strong> Provide resume building, AI coaching, and career guidance</li>
              <li><strong>Personalization:</strong> Customize recommendations and content based on your profile</li>
              <li><strong>AI Features:</strong> Power our AI coach and resume optimization tools</li>
              <li><strong>Progress Tracking:</strong> Monitor your career development and skill improvement</li>
              <li><strong>Communication:</strong> Send important updates, tips, and support responses</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">4. Information Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 We Do NOT Sell Your Personal Information</h3>
            <p className="text-gray-700 mb-6">
              CVSaathi does not sell, rent, or trade your personal information to third parties for monetary compensation.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">We implement industry-standard security measures:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li><strong>Encryption:</strong> Data encrypted in transit and at rest</li>
              <li><strong>Access Controls:</strong> Limited access to authorized personnel only</li>
              <li><strong>Secure Infrastructure:</strong> Cloud services with enterprise-grade security</li>
              <li><strong>Regular Audits:</strong> Ongoing security assessments and improvements</li>
            </ul>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-4">
              <p className="text-sm text-teal-800">
                <strong>Your data is protected with enterprise-grade security measures including encryption, secure servers, and regular security audits.</strong>
              </p>
            </div>
          </section>

          {/* Your Privacy Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">6. Your Privacy Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li><strong>Access:</strong> View all personal data we have about you</li>
              <li><strong>Update:</strong> Modify or correct your personal information</li>
              <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Restrict:</strong> Limit how we process your information</li>
            </ul>
            <p className="text-gray-700 mb-4">
              To exercise any of these rights, contact us at <a href="mailto:privacy@cvsaathi.com" className="text-teal-600 hover:underline">privacy@cvsaathi.com</a> or use the "Download My Data" and "Delete Account" features on this website.
            </p>
            <Link to="/support/data-rights" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold">
              Learn more about your data rights →
            </Link>
          </section>

          {/* Indian Privacy Compliance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <Flag className="w-6 h-6" />
              7. Indian Privacy Compliance
            </h2>
            <p className="text-gray-700 mb-4">For users in India, we comply with:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li>Digital Personal Data Protection Act 2023</li>
              <li>Information Technology Act 2000</li>
              <li>Information Technology Rules 2011</li>
              <li>RBI Guidelines for digital payments</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Your data is processed lawfully with appropriate safeguards. You have rights to access, correct, and erase your data.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Grievance Officer:</strong> <a href="mailto:grievance@cvsaathi.com" className="text-teal-600 hover:underline">grievance@cvsaathi.com</a>
              </p>
            </div>
            <Link to="/support/indian-compliance" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold mt-4">
              View detailed Indian Privacy Compliance →
            </Link>
          </section>

          {/* International Compliance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6" />
              8. International Compliance
            </h2>
            <p className="text-gray-700 mb-4">We comply with major privacy laws globally:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
              <li><strong>GDPR (General Data Protection Regulation)</strong> - European Union</li>
              <li><strong>CCPA (California Consumer Privacy Act)</strong> - California, USA</li>
              <li><strong>COPPA (Children's Online Privacy Protection)</strong> - USA</li>
            </ul>
            <Link to="/support/global-compliance" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold">
              View detailed Global Privacy Compliance →
            </Link>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700">
              CVSaathi is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">10. Contact Information</h2>
            <p className="text-gray-700 mb-6">If you have questions about this Privacy Policy:</p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-teal-600" />
                  India:
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Grievance Officer:</strong> <a href="mailto:grievance@cvsaathi.com" className="text-teal-600 hover:underline">grievance@cvsaathi.com</a></li>
                  <li><strong>Data Protection Officer:</strong> <a href="mailto:dpo-india@cvsaathi.com" className="text-teal-600 hover:underline">dpo-india@cvsaathi.com</a></li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-600" />
                  Global:
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Privacy Team:</strong> <a href="mailto:privacy@cvsaathi.com" className="text-teal-600 hover:underline">privacy@cvsaathi.com</a></li>
                  <li><strong>Support:</strong> <a href="mailto:support@cvsaathi.com" className="text-teal-600 hover:underline">support@cvsaathi.com</a></li>
                  <li><strong>Website:</strong> <a href="https://www.cvsaathi.com" className="text-teal-600 hover:underline">www.cvsaathi.com</a></li>
                </ul>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-6">
              <p className="text-sm text-teal-800">
                <strong>Response Time Commitment:</strong> We strive to respond to all privacy inquiries within 30 days.
              </p>
            </div>
          </section>

          {/* Policy Dates */}
          <section className="mb-8 border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-600">
              This Privacy Policy is effective as of <strong>January 1, 2025</strong> and was last updated on <strong>January 1, 2025</strong>.
            </p>
          </section>

          {/* Commitment */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-8">
            <p className="text-gray-700">
              CVSaathi is committed to transparency and protecting your privacy. If you have any concerns or questions, please don't hesitate to contact us.
            </p>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/support/indian-compliance" className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
                <Flag className="w-4 h-4" />
                Indian Privacy Compliance
              </Link>
              <Link to="/support/global-compliance" className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
                <Globe className="w-4 h-4" />
                Global Privacy Laws
              </Link>
              <Link to="/support/data-protection" className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
                <Shield className="w-4 h-4" />
                Data Protection Measures
              </Link>
              <Link to="/support/data-retention" className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
                <Lock className="w-4 h-4" />
                Data Retention Policy
              </Link>
              <Link to="/support/data-rights" className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
                <Mail className="w-4 h-4" />
                Your Data Rights
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

