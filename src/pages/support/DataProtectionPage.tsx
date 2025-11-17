import { motion } from "motion/react";
import { ArrowLeft, Shield, Lock, Server, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export function DataProtectionPage() {
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
              <h1 className="text-4xl font-bold text-gray-900">Data Protection Measures</h1>
            </div>
            <p className="text-gray-600">How we secure your information</p>
          </div>

          {/* Encryption */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Encryption
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Data in Transit:</strong> TLS 1.3 encryption for all communications</li>
              <li><strong>Data at Rest:</strong> AES-256 encryption for stored data</li>
              <li><strong>End-to-End:</strong> Encrypted data transmission</li>
              <li><strong>Key Management:</strong> Secure key rotation and storage</li>
            </ul>
          </section>

          {/* Access Controls */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Access Controls
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Multi-Factor Authentication:</strong> Required for admin access</li>
              <li><strong>Role-Based Access:</strong> Least privilege principle</li>
              <li><strong>Regular Audits:</strong> Access review and monitoring</li>
              <li><strong>Zero Trust:</strong> Verify every access request</li>
            </ul>
          </section>

          {/* Infrastructure Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <Server className="w-6 h-6" />
              Infrastructure Security
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Secure Hosting:</strong> Enterprise-grade cloud infrastructure</li>
              <li><strong>Network Security:</strong> Firewalls and intrusion detection</li>
              <li><strong>Regular Updates:</strong> Security patches and updates</li>
              <li><strong>Backup Systems:</strong> Redundant data protection</li>
            </ul>
          </section>

          {/* Monitoring & Incident Response */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6" />
              Monitoring & Incident Response
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>24/7 Monitoring:</strong> Continuous security monitoring</li>
              <li><strong>Incident Response:</strong> Rapid response procedures</li>
              <li><strong>Breach Notification:</strong> Timely user notification</li>
              <li><strong>Security Testing:</strong> Regular penetration testing</li>
            </ul>
          </section>

          {/* Contact */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <p className="text-gray-700">
              Security questions? Contact: <a href="mailto:security@cvsaathi.com" className="text-teal-600 hover:underline font-semibold">security@cvsaathi.com</a>
            </p>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information:</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/support/privacy-policy" className="text-teal-600 hover:text-teal-700">
                Privacy Policy →
              </Link>
              <Link to="/support/data-retention" className="text-teal-600 hover:text-teal-700">
                Data Retention Policy →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

