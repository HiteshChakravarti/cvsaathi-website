import { motion } from "motion/react";
import { ArrowLeft, RefreshCw, CreditCard, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export function RefundsPage() {
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
              <RefreshCw className="w-8 h-8 text-teal-600" />
              <h1 className="text-4xl font-bold text-gray-900">Refunds & Cancellations</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 text-gray-600 justify-center">
              <p>Effective Date: <span className="font-semibold text-gray-900">January 1, 2025</span></p>
              <p>Last Updated: <span className="font-semibold text-gray-900">January 1, 2025</span></p>
            </div>
          </div>

          {/* Cancellation Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Cancellation Policy</h2>
            <p className="text-gray-700 mb-4">
              You can cancel your subscription at any time from your account settings. Your subscription will remain active until the end of the current billing period.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Monthly subscriptions: Cancel anytime, access continues until the end of the current month</li>
              <li>Annual subscriptions: Cancel anytime, access continues until the end of the current year</li>
              <li>No cancellation fees apply</li>
            </ul>
          </section>

          {/* Refund Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Refund Policy</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  7-Day Money-Back Guarantee
                </h3>
                <p className="text-gray-700 text-sm">
                  If you're not satisfied with our service within the first 7 days of your subscription, you can request a full refund.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Partial Refunds</h3>
                <p className="text-gray-700 text-sm">
                  For annual subscriptions cancelled after 7 days, we may provide a prorated refund based on the remaining unused period, subject to review.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">No Refunds</h3>
                <p className="text-gray-700 text-sm">
                  Refunds are not available for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4 mt-2">
                  <li>Free plan subscriptions</li>
                  <li>Subscriptions cancelled after the refund period</li>
                  <li>Violations of our Terms of Service</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to Request Refund */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">How to Request a Refund</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
              <li>Contact our support team at <a href="mailto:support@cvsaathi.com" className="text-teal-600 hover:underline font-semibold">support@cvsaathi.com</a></li>
              <li>Include your account email and subscription details</li>
              <li>Provide a reason for the refund request</li>
              <li>We will process your refund within 5-7 business days</li>
            </ol>
          </section>

          {/* Processing Time */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Refund Processing Time</h2>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
              <p className="text-gray-700">
                Refunds are typically processed within <strong>5-7 business days</strong> after approval. The refund will be credited to your original payment method.
              </p>
            </div>
          </section>

          {/* Contact */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <p className="text-gray-700">
              For refund inquiries, contact: <a href="mailto:support@cvsaathi.com" className="text-teal-600 hover:underline font-semibold">support@cvsaathi.com</a>
            </p>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information:</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/support/terms-of-use" className="text-teal-600 hover:text-teal-700">
                Terms of Use →
              </Link>
              <Link to="/support/privacy-policy" className="text-teal-600 hover:text-teal-700">
                Privacy Policy →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

