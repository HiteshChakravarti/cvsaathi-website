import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const faqs = [
  {
    question: "What makes CVSaathi different from other resume builders?",
    answer: "CVSaathi is India's first AI-powered city-smart resume builder. We combine advanced AI technology with local job market insights to create resumes specifically optimized for Indian recruiters and ATS systems. Our platform understands regional preferences and industry standards across different Indian cities.",
  },
  {
    question: "How does the ATS optimization work?",
    answer: "Our AI analyzes your resume against 50+ ATS parameters used by top Indian companies. We check formatting, keyword optimization, section structure, and content relevance. You get a real-time ATS score with specific suggestions to improve your chances of passing automated screening.",
  },
  {
    question: "Can I use CVSaathi for free?",
    answer: "Yes! Our free plan includes 1 resume, basic templates, ATS score checking, and PDF downloads. It's perfect for getting started. Upgrade to Pro for unlimited resumes, premium templates, and advanced AI features whenever you're ready.",
  },
  {
    question: "What formats can I download my resume in?",
    answer: "You can download your resume in multiple formats including PDF (most recommended for ATS), DOCX (editable), and even get a shareable link. Pro users also get access to ATS-optimized plain text versions perfect for online applications.",
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely! We use bank-level encryption to protect your data. Your resume and personal information are never shared with third parties. You have complete control over your data and can delete it anytime. We're fully compliant with Indian data protection regulations.",
  },
  {
    question: "Do you offer a money-back guarantee?",
    answer: "Yes! All paid plans come with a 30-day money-back guarantee. If you're not satisfied for any reason, we'll refund your payment in full, no questions asked. We also offer a 7-day free trial for Pro plans so you can try before you buy.",
  },
  {
    question: "Can CVSaathi help with cover letters too?",
    answer: "Yes! Pro and Lifetime plans include an AI-powered cover letter builder. Our AI helps you create compelling, personalized cover letters that match your resume and the specific job you're applying for. It's like having a professional writer on demand.",
  },
  {
    question: "How often are templates updated?",
    answer: "We regularly add new templates based on current design trends and recruiter feedback. Pro and Lifetime users get instant access to all new templates as they're released. We also update existing templates to match evolving ATS requirements.",
  },
];

export function FAQ() {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-5 py-2 mb-6 bg-white border border-teal-200 rounded-full shadow-sm">
            <span className="text-teal-700 uppercase tracking-wider">FAQ</span>
          </div>
          <h2 className="text-gray-900 mb-6">
            Frequently asked questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about CVSaathi. Can't find the answer you're looking for? Chat with our support team.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-white border-2 border-gray-200 rounded-2xl px-6 hover:border-teal-300 transition-all data-[state=open]:border-teal-500 data-[state=open]:shadow-lg data-[state=open]:shadow-teal-500/10"
                >
                  <AccordionTrigger className="text-gray-900 hover:text-teal-600 hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-3xl p-8 border-2 border-teal-200 shadow-xl">
            <h3 className="text-gray-900 mb-3">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you succeed
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all"
            >
              Contact Support
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
